import User from '../models/User.js';
import ExchangeRequest from '../models/ExchangeRequest.js';
import Review from '../models/Review.js';
import Skill from '../models/Skill.js';

export const getPublicStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalSkills = await Skill.countDocuments({ isActive: true });
    const totalExchanges = await ExchangeRequest.countDocuments();
    const completedExchanges = await ExchangeRequest.countDocuments({ status: 'completed' });
    
    // Calculate satisfaction rate from reviews
    const reviews = await Review.find({}).select('rating').lean();
    const satisfactionRate = reviews.length > 0 
      ? Math.round((reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length) * 20) // Convert to percentage
      : 95; // Default if no reviews

    res.json({
      success: true,
      data: {
        activeMembers: totalUsers,
        skillsAvailable: totalSkills,
        exchangesCompleted: completedExchanges,
        satisfactionRate: satisfactionRate
      }
    });
  } catch (error) {
    next(error);
  }
};
