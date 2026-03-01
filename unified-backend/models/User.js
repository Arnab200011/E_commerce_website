/**
 * User model with role-based access control
 * Supports both USER and ADMIN roles
 * Includes password hashing and comparison methods
 */

import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { ROLES } from '../constants/roles.js';

const userSchema = new mongoose.Schema(
  {
    // Profile Information
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters']
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
      index: true
    },

    // Authentication
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false // Never return password by default
    },

    // Authorization
    role: {
      type: String,
      enum: {
        values: [ROLES.USER, ROLES.ADMIN],
        message: 'Role must be either USER or ADMIN'
      },
      default: ROLES.USER,
      index: true
    },

    // Account Status
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },

    isEmailVerified: {
      type: Boolean,
      default: false
    },

    // Email Verification
    emailVerificationToken: {
      type: String,
      select: false
    },

    emailVerificationExpires: {
      type: Date,
      select: false
    },

    // Password Reset (for future implementation)
    passwordResetToken: {
      type: String,
      select: false
    },

    passwordResetExpires: {
      type: Date,
      select: false
    },

    // OAuth Fields (for future expansion)
    googleId: String,
    githubId: String,

    // Account Activity Tracking
    lastLoginAt: Date,

    loginHistory: [
      {
        ipAddress: String,
        userAgent: String,
        timestamp: { type: Date, default: Date.now }
      }
    ],

    // Session Management
    refreshTokens: [
      {
        token: {
          type: String,
          required: true
        },
        createdAt: {
          type: Date,
          default: Date.now,
          expires: 604800 // 7 days in seconds
        }
      }
    ],

    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  {
    timestamps: true
  }
);

/**
 * Pre-save middleware
 * Hashes password before saving if modified
 */
userSchema.pre('save', async function (next) {
  // Only hash if password is modified
  if (!this.isModified('passwordHash')) {
    return next();
  }

  try {
    const saltRounds = 10;
    this.passwordHash = await bcrypt.hash(this.passwordHash, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Compare password method
 * @param {string} plainPassword - Password to compare
 * @returns {boolean} True if passwords match
 * 
 * @example
 * const isMatch = await user.comparePassword('password123');
 */
userSchema.methods.comparePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

/**
 * Get user JSON (excludes sensitive fields)
 * @returns {Object} User object without sensitive data
 */
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.emailVerificationToken;
  delete obj.emailVerificationExpires;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  delete obj.loginHistory;
  return obj;
};

/**
 * Get user public profile (minimal info)
 * @returns {Object} Public user information
 */
userSchema.methods.getPublicProfile = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email
  };
};

/**
 * Check if account is valid for login
 * @returns {boolean} True if account can login
 */
userSchema.methods.canLogin = function () {
  return this.isActive && this.isEmailVerified;
};

/**
 * Update last login
 * @param {string} ipAddress - IP address of login
 * @param {string} userAgent - User agent of login
 */
userSchema.methods.recordLogin = async function (ipAddress = '', userAgent = '') {
  this.lastLoginAt = new Date();
  
  // Keep only last 10 logins
  if (this.loginHistory.length >= 10) {
    this.loginHistory.pop();
  }
  
  this.loginHistory.unshift({
    ipAddress,
    userAgent,
    timestamp: new Date()
  });
  
  await this.save();
};

/**
 * Indexes for performance
 */
userSchema.index({ email: 1, role: 1 });
userSchema.index({ isActive: 1, role: 1 });
userSchema.index({ createdAt: -1 });

const User = mongoose.model('User', userSchema);

export default User;
