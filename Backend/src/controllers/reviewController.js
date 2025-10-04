import Review from '../models/Review.js';
import ExchangeRequest from '../models/ExchangeRequest.js';
import User from '../models/User.js';

// @desc    Create review
// @route   POST /api/reviews
// @access  Private
export const createReview = async (req, res, next) => {
  try {
    const { revieweeId, exchangeId, rating, feedback, skillTaught, aspectRatings,isPublic } = req.body;

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Check if exchange exists and is completed
    const exchange = await ExchangeRequest.findById(exchangeId);

    if (!exchange) {
      return res.status(404).json({
        success: false,
        message: 'Exchange not found'
      });
    }

    if (exchange.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only review completed exchanges'
      });
    }

    // Check if user was part of the exchange
    if (
      exchange.sender.toString() !== req.user.id &&
      exchange.receiver.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to review this exchange'
      });
    }

    // Check if reviewee was the other participant
    const validReviewee = 
      (exchange.sender.toString() === req.user.id && exchange.receiver.toString() === revieweeId) ||
      (exchange.receiver.toString() === req.user.id && exchange.sender.toString() === revieweeId);

    if (!validReviewee) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reviewee for this exchange'
      });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      reviewer: req.user.id,
      reviewee: revieweeId,
      exchange: exchangeId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this exchange'
      });
    }

    // Create review
    const review = await Review.create({
      reviewer: req.user.id,
      reviewee: revieweeId,
      exchange: exchangeId,
      rating,
      feedback,
      skillTaught,
      aspectRatings,
      isPublic
    });

    await review.populate('reviewer reviewee', 'name profilePic');

    // Update reviewee's rating
    const reviewee = await User.findById(revieweeId);
    await reviewee.updateRating(rating);

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: { review }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's reviews
// @route   GET /api/reviews/:userId
// @access  Public
export const getUserReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const reviews = await Review.find({
      reviewee: req.params.userId,
      isPublic: true
    })
      .populate('reviewer', 'name profilePic')
      .populate('exchange', 'skillOffered skillRequested')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Review.countDocuments({
      reviewee: req.params.userId,
      isPublic: true
    });

    // Calculate average ratings
    const allReviews = await Review.find({
      reviewee: req.params.userId,
      isPublic: true
    });

    const avgAspectRatings = {
      communication: 0,
      knowledge: 0,
      punctuality: 0,
      patience: 0
    };

    let aspectCount = 0;

    allReviews.forEach(review => {
      if (review.aspectRatings) {
        avgAspectRatings.communication += review.aspectRatings.communication || 0;
        avgAspectRatings.knowledge += review.aspectRatings.knowledge || 0;
        avgAspectRatings.punctuality += review.aspectRatings.punctuality || 0;
        avgAspectRatings.patience += review.aspectRatings.patience || 0;
        aspectCount++;
      }
    });

    if (aspectCount > 0) {
      avgAspectRatings.communication = (avgAspectRatings.communication / aspectCount).toFixed(1);
      avgAspectRatings.knowledge = (avgAspectRatings.knowledge / aspectCount).toFixed(1);
      avgAspectRatings.punctuality = (avgAspectRatings.punctuality / aspectCount).toFixed(1);
      avgAspectRatings.patience = (avgAspectRatings.patience / aspectCount).toFixed(1);
    }

    res.json({
      success: true,
      data: {
        reviews,
        avgAspectRatings,
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

// @desc    Get my reviews (given by me)
// @route   GET /api/reviews/my/given
// @access  Private
export const getMyGivenReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ reviewer: req.user.id })
      .populate('reviewee', 'name profilePic')
      .populate('exchange', 'skillOffered skillRequested')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { reviews }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
export const updateReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Only reviewer can update
    if (review.reviewer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this review'
      });
    }

    const { rating, feedback, aspectRatings, isPublic } = req.body;
    if (rating) review.rating = rating;
    if (feedback) review.feedback = feedback;
    if (aspectRatings) review.aspectRatings = aspectRatings;
    if (typeof isPublic !== 'undefined') review.isPublic = isPublic;

    await review.save();

    // Update reviewee's rating if rating changed
    if (rating) {
      const reviewee = await User.findById(review.reviewee);
      const oldTotal = reviewee.rating.average * reviewee.rating.count;
      const newTotal = oldTotal - review.rating + rating;
      reviewee.rating.average = newTotal / reviewee.rating.count;
      await reviewee.save();
    }

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: { review }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Only reviewer can delete
    if (review.reviewer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }

    await review.deleteOne();

    // Update reviewee's rating
    const reviewee = await User.findById(review.reviewee);
    const oldTotal = reviewee.rating.average * reviewee.rating.count;
    reviewee.rating.count -= 1;
    if (reviewee.rating.count > 0) {
      reviewee.rating.average = (oldTotal - review.rating) / reviewee.rating.count;
    } else {
      reviewee.rating.average = 0;
    }
    await reviewee.save();

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};