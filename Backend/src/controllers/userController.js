import User from '../models/User.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';
import fs from 'fs';

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
        updates[key] = req.body[key];
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
    const { teach, learn, location, page = 1, limit = 20 } = req.query;

    const query = { isActive: true };

    if (teach) {
      query.skillsToTeach = { $regex: teach, $options: 'i' };
    }

    if (learn) {
      query.skillsToLearn = { $regex: learn, $options: 'i' };
    }

    if (location) {
      query.$or = [
        { 'location.city': { $regex: location, $options: 'i' } },
        { 'location.country': { $regex: location, $options: 'i' } }
      ];
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

// Helper: compute matches for a given user document
const computeMatches = async (currentUser) => {
  const matchesMap = new Map();
  const skillsToLearn = currentUser.skillsToLearn || [];
  const skillsToTeach = currentUser.skillsToTeach || [];

  // 1) Find users who can teach the skills current user wants to learn
  for (const skill of skillsToLearn) {
    const canTeachUsers = await User.find({
      isActive: true,
      skillsToTeach: skill,
      _id: { $ne: currentUser._id }
    }).select('name profilePic location skillsToTeach skillsToLearn rating bio');

    canTeachUsers.forEach(user => {
      const id = user._id.toString();
      if (!matchesMap.has(id)) {
        matchesMap.set(id, {
          user,
          matchedSkills: { canTeachYou: [skill], wantsToLearn: [] },
          matchScore: 1
        });
      } else {
        matchesMap.get(id).matchedSkills.canTeachYou.push(skill);
        matchesMap.get(id).matchScore += 1;
      }
    });
  }

  // 2) Find users who want to learn skills current user can teach
  for (const skill of skillsToTeach) {
    const wantsUsers = await User.find({
      isActive: true,
      skillsToLearn: skill,
      _id: { $ne: currentUser._id }
    }).select('name profilePic location skillsToTeach skillsToLearn rating bio');

    wantsUsers.forEach(user => {
      const id = user._id.toString();
      if (!matchesMap.has(id)) {
        matchesMap.set(id, {
          user,
          matchedSkills: { canTeachYou: [], wantsToLearn: [skill] },
          matchScore: 1
        });
      } else {
        matchesMap.get(id).matchedSkills.wantsToLearn.push(skill);
        matchesMap.get(id).matchScore += 1;
      }
    });
  }

  // 3) Optional: sameLocation flag
  matchesMap.forEach(match => {
    if (currentUser.location && match.user.location) {
      match.sameLocation = currentUser.location.city === match.user.location.city;
    } else {
      match.sameLocation = false;
    }
  });

  // 4) Return sorted list
  const uniqueMatches = Array.from(matchesMap.values())
    .filter(match => match.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore);

  return uniqueMatches;
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
        data: { matches: [] }
      });
    }

    const matches = await computeMatches(currentUser);

    return res.json({ success: true, data: { matches } });
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