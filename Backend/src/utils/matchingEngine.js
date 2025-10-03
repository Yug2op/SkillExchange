import User from '../models/User.js';

/**
 * Find matching users for skill exchange
 * @param {Object} currentUser - The user looking for matches
 * @returns {Array} Array of matched users with match scores
 */
const findMatches = async (currentUser) => {
  try {
    const skillsToTeach = currentUser.skillsToTeach || [];
    const skillsToLearn = currentUser.skillsToLearn || [];

    if (skillsToTeach.length === 0 || skillsToLearn.length === 0) {
      return [];
    }

    // Find users who teach what current user wants to learn
    // AND learn what current user wants to teach
    const potentialMatches = await User.find({
      _id: { $ne: currentUser._id },
      isActive: true,
      $and: [
        { skillsToTeach: { $in: skillsToLearn } },
        { skillsToLearn: { $in: skillsToTeach } }
      ]
    }).select('-password');

    // Calculate match scores
    const matches = potentialMatches.map(user => {
      // Perfect matches (skills align exactly)
      const perfectTeachMatches = user.skillsToTeach.filter(skill =>
        skillsToLearn.map(s => s.toLowerCase()).includes(skill.toLowerCase())
      );

      const perfectLearnMatches = user.skillsToLearn.filter(skill =>
        skillsToTeach.map(s => s.toLowerCase()).includes(skill.toLowerCase())
      );

      // Calculate match score (0-100)
      const teachScore = (perfectTeachMatches.length / skillsToLearn.length) * 50;
      const learnScore = (perfectLearnMatches.length / skillsToTeach.length) * 50;
      const matchScore = Math.round(teachScore + learnScore);

      // Location bonus
      let locationBonus = 0;
      if (currentUser.location && user.location) {
        if (currentUser.location.city === user.location.city) {
          locationBonus = 10;
        } else if (currentUser.location.country === user.location.country) {
          locationBonus = 5;
        }
      }

      // Rating bonus
      const ratingBonus = Math.round(user.rating.average);

      const finalScore = Math.min(100, matchScore + locationBonus + ratingBonus);

      return {
        user,
        matchScore: finalScore,
        matchedSkills: {
          canTeachYou: perfectTeachMatches,
          wantsToLearn: perfectLearnMatches
        },
        sameLocation: locationBonus > 0
      };
    });

    // Sort by match score
    matches.sort((a, b) => b.matchScore - a.matchScore);

    // Find similar matches (users who teach or learn similar skills)
    const similarMatches = await findSimilarMatches(currentUser, matches.map(m => m.user._id));

    return [...matches, ...similarMatches];
  } catch (error) {
    console.error('Matching engine error:', error);
    throw error;
  }
};

/**
 * Find users with similar but not exact skill matches
 */
const findSimilarMatches = async (currentUser, excludeIds) => {
  try {
    const similarSkills = currentUser.skillsToTeach.concat(currentUser.skillsToLearn);
    
    const similarUsers = await User.find({
      _id: { $ne: currentUser._id },
      isActive: true,
      skillsToTeach: { $in: similarSkills },
      skillsToLearn: { $in: similarSkills }
    }).select('-password');

    return similarUsers.map(user => ({
      user,
      matchScore: 0,
      matchedSkills: {
        canTeachYou: [],
        wantsToLearn: []
      },
      sameLocation: false
    }));
  } catch (error) {
    console.error('Similar matches error:', error);
    throw error;
  }
};

export { findMatches, findSimilarMatches };
