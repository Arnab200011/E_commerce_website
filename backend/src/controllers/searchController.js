import Product from '../models/Product.js';
import SearchHistory from '../models/SearchHistory.js';

/**
 * Search products and save search history
 * GET /api/products/search?keyword=...
 */
export const searchProducts = async (req, res) => {
  try {
    const { keyword } = req.query;

    if (!keyword || keyword.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Search keyword is required'
      });
    }

    const trimmedKeyword = keyword.trim();

    // Search products using case-insensitive regex on name and description
    const products = await Product.find({
      $or: [
        { name: { $regex: trimmedKeyword, $options: 'i' } },
        { description: { $regex: trimmedKeyword, $options: 'i' } }
      ]
    }).sort({ createdAt: -1 });

    // Save search keyword to history and trim to last 5 entries
    // This is done asynchronously - we don't wait for it to complete
    SearchHistory.addSearchAndTrim(req.user.id, trimmedKeyword).catch(error => {
      console.error('Failed to save search history:', error);
      // Don't fail the request if history save fails
    });

    res.status(200).json({
      success: true,
      keyword: trimmedKeyword,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({
      success: false,
      message: 'Product search failed'
    });
  }
};

/**
 * Get user's search history (last 5 searches)
 * GET /api/search-history
 */
export const getSearchHistory = async (req, res) => {
  try {
    const searches = await SearchHistory.getRecentSearches(req.user.id, 5);

    res.status(200).json({
      success: true,
      count: searches.length,
      data: searches
    });
  } catch (error) {
    console.error('Get search history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch search history'
    });
  }
};
