import mongoose from 'mongoose';

const searchHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    keyword: {
      type: String,
      required: [true, 'Search keyword is required'],
      trim: true,
      maxlength: [100, 'Search keyword cannot exceed 100 characters']
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false } // Only track creation time
  }
);

// Compound index for efficient querying and sorting user's search history
searchHistorySchema.index({ userId: 1, createdAt: -1 });

// Static method to add search and maintain only last 5 entries per user
searchHistorySchema.statics.addSearchAndTrim = async function (userId, keyword) {
  // Add the new search entry
  await this.create({ userId, keyword });

  // Find all entries for this user, sorted by newest first
  const allSearches = await this.find({ userId })
    .sort({ createdAt: -1 })
    .select('_id');

  // If more than 5 entries exist, delete the oldest ones
  if (allSearches.length > 5) {
    const idsToKeep = allSearches.slice(0, 5).map(s => s._id);
    await this.deleteMany({
      userId,
      _id: { $nin: idsToKeep }
    });
  }
};

// Static method to get last 5 searches for a user
searchHistorySchema.statics.getRecentSearches = async function (userId, limit = 5) {
  return await this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('keyword createdAt');
};

const SearchHistory = mongoose.model('SearchHistory', searchHistorySchema);

export default SearchHistory;
