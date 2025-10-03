import User from '../models/User.js';
import ExchangeRequest from '../models/ExchangeRequest.js';
import Review from '../models/Review.js';
import Skill from '../models/Skill.js';

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, status } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    const skip = (page - 1) * limit;

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

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

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const verifiedUsers = await User.countDocuments({ isEmailVerified: true });

    const totalExchanges = await ExchangeRequest.countDocuments();
    const pendingExchanges = await ExchangeRequest.countDocuments({ status: 'pending' });
    const activeExchanges = await ExchangeRequest.countDocuments({ status: 'accepted' });
    const completedExchanges = await ExchangeRequest.countDocuments({ status: 'completed' });

    const totalReviews = await Review.countDocuments();

    // Top skills
    const topSkillsToTeach = await User.aggregate([
      { $unwind: '$skillsToTeach' },
      { $group: { _id: '$skillsToTeach', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const topSkillsToLearn = await User.aggregate([
      { $unwind: '$skillsToLearn' },
      { $group: { _id: '$skillsToLearn', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newUsersLast30Days = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    const newExchangesLast30Days = await ExchangeRequest.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          verified: verifiedUsers,
          newLast30Days: newUsersLast30Days
        },
        exchanges: {
          total: totalExchanges,
          pending: pendingExchanges,
          active: activeExchanges,
          completed: completedExchanges,
          newLast30Days: newExchangesLast30Days
        },
        reviews: {
          total: totalReviews
        },
        topSkills: {
          teach: topSkillsToTeach,
          learn: topSkillsToLearn
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Deactivate user
// @route   PUT /api/admin/users/:id/deactivate
// @access  Private/Admin
export const deactivateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = false;
    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Activate user
// @route   PUT /api/admin/users/:id/activate
// @access  Private/Admin
export const activateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = true;
    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: 'User activated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user permanently
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete related data
    await ExchangeRequest.deleteMany({
      $or: [{ sender: user._id }, { receiver: user._id }]
    });

    await Review.deleteMany({
      $or: [{ reviewer: user._id }, { reviewee: user._id }]
    });

    await user.deleteOne();

    res.json({
      success: true,
      message: 'User and related data deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create skill category
// @route   POST /api/admin/skills
// @access  Private/Admin
export const createSkill = async (req, res, next) => {
  try {
    const { name, category, tags, description } = req.body;

    const skill = await Skill.create({
      name,
      category,
      tags,
      description
    });

    res.status(201).json({
      success: true,
      message: 'Skill created successfully',
      data: { skill }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all skills
// @route   GET /api/admin/skills
// @access  Private/Admin
export const getAllSkills = async (req, res, next) => {
  try {
    const skills = await Skill.find().sort({ userCount: -1 });

    res.json({
      success: true,
      data: { skills }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all deactivated Account
// @route   GET /api/admin/get-deactivated
// @access  Private/Admin
export const getDactivatedAccount = async (req, res, next) => {
  try {
    const users = await User.find({ isActive: false });

    res.json({
      success: true,
      data: { users }
    });
  } catch (error) {
    next(error);
  }
}
