import User from '../models/User.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';
import fs from 'fs';
import { findMatches } from '../utils/matchingEngine.js';

// @desc    Get user profile
// @route   GET /api/users/:id
// @access  Public
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -emailVerificationToken -resetPasswordToken');


    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    // Ensure user can only update their own profile
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this profile'
      });
    }

    const allowedUpdates = [
      'name', 'bio', 'skillsToTeach', 'skillsToLearn',
      'location', 'availability', 'phone'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        if (key === 'skillsToTeach' || key === 'skillsToLearn') {
          // Ensure skills are objects with skill and level
          updates[key] = (req.body[key] || []).map(skill => {
            if (typeof skill === 'string') {
              return { skill, level: 'Beginner' }; // Default level
            }
            return skill; // Already an object
          });
        } else {
          updates[key] = req.body[key];
        }
      }
    });

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload profile picture
// @route   POST /api/users/:id/profile-pic
// @access  Private
export const uploadProfilePicture = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Please upload an image'
    });
  }

  const filePath = req.file.path; // Store the file path for cleanup

  try {
    if (req.user.id !== req.params.id) {
      // Clean up the uploaded file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete old profile picture if exists
    if (user.profilePic && user.profilePic.publicId) {
      try {
        await deleteFromCloudinary(user.profilePic.publicId);
      } catch (error) {
        console.error('Error deleting old profile picture from Cloudinary:', error);
        // Continue with the upload even if old picture deletion fails
      }
    }

    // Upload to Cloudinary
    let result;
    try {
      result = await uploadToCloudinary(req.file, 'profile-pictures');
    } catch (uploadError) {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return next(new Error('Failed to upload image to Cloudinary'));
    }

    // If we got here, the upload was successful
    user.profilePic = {
      url: result.url,
      publicId: result.publicId
    };

    await user.save({ validateBeforeSave: false });

    // Clean up the uploaded file after successful processing
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: { profilePic: user.profilePic }
    });
  } catch (error) {
    // Clean up the uploaded file in case of any error
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    next(error);
  }
};

// @desc    Search users
// @route   GET /api/users/search
// @access  Public
export const searchUsers = async (req, res, next) => {
  try {
    const { q, teach, learn, location, page = 1, limit = 20, excludeUserId } = req.query;

    const query = { isActive: true };
    if (excludeUserId) {
      query._id = { $ne: excludeUserId };
    }

    const orConditions = [];

    // General text search (name, bio, skills)
    const qTrimmed = q?.trim();

    if (qTrimmed && qTrimmed.length > 0) {
      orConditions.push(
        { name: { $regex: q, $options: 'i' } },
        { bio: { $regex: q, $options: 'i' } },
        { "skillsToTeach.skill": { $regex: q, $options: 'i' } },
        { "skillsToLearn.skill": { $regex: q, $options: 'i' } }
      );
    }

    // Skills search
    if (teach) {
      orConditions.push({ "skillsToTeach.skill": { $regex: teach, $options: 'i' } });
    }

    if (learn) {
      orConditions.push({ "skillsToLearn.skill": { $regex: learn, $options: 'i' } });
    }

    // Location search
    if (location) {
      orConditions.push(
        { 'location.city': { $regex: location, $options: 'i' } },
        { 'location.country': { $regex: location, $options: 'i' } }
      );
    }

    // If we have any search conditions, use $or
    if (orConditions.length > 0) {
      query.$or = orConditions;
    }

    const skip = (page - 1) * limit;

    const users = await User.find(query)
      .select('-password -emailVerificationToken -resetPasswordToken')
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ 'rating.average': -1, lastActive: -1 });

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};



// @desc    Get skill matches for current user
// @route   GET /api/users/matches
// @access  Private
export const getMatches = async (req, res, next) => {
  try {
    const currentUser = await User.findById(req.user.id);
    if (!currentUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!currentUser.skillsToTeach?.length || !currentUser.skillsToLearn?.length) {
      return res.json({
        success: true,
        message: 'Please add skills to teach and learn to find matches',
        data: { matches: [], pagination: { total: 0, pages: 1, page: 1 } }
      });
    }

    // Extract and normalize query params
    const { page = 1, limit = 12, sortBy = 'matchScore', filterBy = 'all' } = req.query || {};

    const result = await findMatches(currentUser, {
      page: Number.parseInt(page, 10) || 1,
      limit: Number.parseInt(limit, 10) || 12,
      sortBy,
      filterBy,
    });

    return res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user account
// @route   DELETE /api/users/:id
// @access  Private
export const deleteAccount = async (req, res, next) => {
  try {
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Soft delete - deactivate account
    user.isActive = false;
    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: 'Account deactivated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get popular skills for public display
// @route   GET /api/users/popular-skills
// @access  Public
export const getPopularSkills = async (req, res, next) => {
  try {
    // Get top skills to teach (most offered)
    const topSkillsToTeach = await User.aggregate([
      { $unwind: '$skillsToTeach' },
      { $group: { _id: '$skillsToTeach.skill', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 15 }
    ]);

    // Get top skills to learn (most requested)
    const topSkillsToLearn = await User.aggregate([
      { $unwind: '$skillsToLearn' },
      { $group: { _id: '$skillsToLearn.skill', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 15 }
    ]);

    // Combine and deduplicate skills
    const allSkills = [...topSkillsToTeach, ...topSkillsToLearn];
    const skillMap = new Map();

    allSkills.forEach(skill => {
      if (skillMap.has(skill._id)) {
        skillMap.get(skill._id).count += skill.count;
      } else {
        skillMap.set(skill._id, { _id: skill._id, count: skill.count });
      }
    });

    const popularSkills = Array.from(skillMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 20)
      .map(skill => skill._id);

    res.json({
      success: true,
      data: {
        popularSkills,
        stats: {
          teach: topSkillsToTeach.slice(0, 10),
          learn: topSkillsToLearn.slice(0, 10)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};