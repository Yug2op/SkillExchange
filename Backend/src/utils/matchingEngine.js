import mongoose from 'mongoose';
// services/matchingEngine.js

import User from '../models/User.js';

/**
 * Finds matching users for skill exchange using a MongoDB Aggregation Pipeline.
 * This version uses a weighted scoring model to ensure the total score
 * does not exceed 100, prioritizing the most important match criteria.
 */

/**
 * Finds, filters, sorts, and paginates matching users.
 * @param {Object} currentUser - The user looking for matches.
 * @param {Object} queryOptions - Options for pagination, sorting, and filtering.
 * @param {number} queryOptions.page - The current page number.
 * @param {number} queryOptions.limit - The number of results per page.
 * @param {string} queryOptions.sortBy - The field to sort by.
 * @param {string} queryOptions.filterBy - The filter to apply.
 * @returns {Promise<Object>} A promise that resolves to an object with matches and pagination info.
 */
const findMatches = async (currentUser, { page = 1, limit = 12, sortBy = 'matchScore', filterBy = 'all' }) => {
  const currentUserId = currentUser._id instanceof mongoose.Types.ObjectId
    ? currentUser._id
    : new mongoose.Types.ObjectId(String(currentUser._id));
  try {
    // Prepare the current user's skills for case-insensitive matching
    const skillsToTeach = (currentUser.skillsToTeach || [])
      .map(s => (typeof s === 'string' ? s : s.skill).toLowerCase())
      .filter(Boolean);
    const skillsToLearn = (currentUser.skillsToLearn || [])
      .map(s => (typeof s === 'string' ? s : s.skill).toLowerCase())
      .filter(Boolean);

    if (skillsToTeach.length === 0 && skillsToLearn.length === 0) {
      return { matches: [], pagination: { total: 0, pages: 0, page: 1, limit: 12 } };
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Build the aggregation pipeline step by step
    const pipeline = [
      // STAGE 1: Initial broad filter (avoid over-filtering early)
      {
        $match: {
          _id: { $ne: currentUserId },
          isActive: true
        }
      },
      // STAGE 2: Normalize skills to lowercase arrays regardless of storage shape (object or string)
      {
        $addFields: {
          skillsTeachLower: {
            $map: {
              input: "$skillsToTeach",
              as: "s",
              in: { $toLower: { $ifNull: ["$$s.skill", "$$s"] } }
            }
          },
          skillsLearnLower: {
            $map: {
              input: "$skillsToLearn",
              as: "s",
              in: { $toLower: { $ifNull: ["$$s.skill", "$$s"] } }
            }
          }
        }
      },
      // STAGE 3: Require at least one overlapping skill (case-insensitive) either direction
      {
        $match: {
          $or: [
            { $expr: { $gt: [{ $size: { $setIntersection: ["$skillsTeachLower", skillsToLearn] } }, 0] } },
            { $expr: { $gt: [{ $size: { $setIntersection: ["$skillsLearnLower", skillsToTeach] } }, 0] } }
          ]
        }
      }
    ];
    // Add remaining stages
    pipeline.push(
      // STAGE 4: Identify matched skills (case-insensitive)
      {
        $addFields: {
          canTeachYou: {
            $filter: {
              input: "$skillsToTeach",
              as: "skill_taught",
              cond: {
                $in: [{ $toLower: { $ifNull: ["$$skill_taught.skill", "$$skill_taught"] } }, skillsToLearn]
              }
            }
          },
          wantsToLearn: {
            $filter: {
              input: "$skillsToLearn",
              as: "skill_learned",
              cond: {
                $in: [{ $toLower: { $ifNull: ["$$skill_learned.skill", "$$skill_learned"] } }, skillsToTeach]
              }
            }
          }
        }
      },

      // STAGE 5: Calculate weighted scores
      {
        $addFields: {
          skillScore: {
            $let: {
              vars: {
                teachesCount: { $size: "$canTeachYou" },
                learnsCount: { $size: "$wantsToLearn" }
              },
              in: {
                $cond: {
                  if: { $and: [{ $gt: ["$$teachesCount", 0] }, { $gt: ["$$learnsCount", 0] }] },
                  then: { $add: [50, { $min: [10, { $add: ["$$teachesCount", "$$learnsCount"] }] }] },
                  else: { $add: [25, { $min: [5, { $add: ["$$teachesCount", "$$learnsCount"] }] }] }
                }
              }
            }
          },
          // 0–20 based on lastActive recency (full 20 if seen in last 7 days, linearly down to 0 by 30 days)
          recencyScore: {
            $let: {
              vars: {
                days: {
                  $dateDiff: { startDate: "$lastActive", endDate: "$$NOW", unit: "day" }
                }
              },
              in: {
                $cond: [
                  { $lte: ["$$days", 0] }, 20,
                  {
                    $cond: [
                      { $lte: ["$$days", 7] }, 20,
                      {
                        // Linear scale 7–30 days → 20 down to 0
                        $max: [0, { $subtract: [20, { $multiply: [{ $divide: [{ $subtract: ["$$days", 7] }, 23] }, 20] }] }]
                      }
                    ]
                  }
                ]
              }
            }
          },
          // 0/5/10 based on location vs currentUser (exact city: 10, same country: 5)
          locationScore: {
            $cond: [
              {
                $and: [
                  { $ifNull: ["$location.city", false] },
                  { $eq: [{ $toLower: "$location.city" }, { $toLower: { $literal: (currentUser.location?.city || "") } }] }
                ]
              }, 10,
              {
                $cond: [
                  {
      $and: [
                      { $ifNull: ["$location.country", false] },
                      { $eq: [{ $toLower: "$location.country" }, { $toLower: { $literal: (currentUser.location?.country || "") } }] }
                    ]
                  }, 5, 0
                ]
              }
            ]
          },

          // 0–10 based on rating.average (5-star → 10 points)
          ratingScore: { $min: [10, { $multiply: ["$rating.average", 2] }] }
        }
      },
      // STAGE 6: Calculate Final Score
      {
        $addFields: {
          finalScore: {
            $add: ["$skillScore", "$recencyScore", "$locationScore", "$ratingScore"]
          }
        }
      },

      // STAGE 7: Filter and sort
      { $match: { finalScore: { $gte: 0 } } },
      { $sort: { finalScore: -1 } },
      // STAGE 8: Project only safe/needed fields
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          role: 1,
          availability: 1,
          profilePic: 1,
          bio: 1,
          location: 1,
          rating: 1,
          lastActive: 1,
          isActive: 1,
          skillsToTeach: 1,
          skillsToLearn: 1,
          canTeachYou: 1,
          wantsToLearn: 1,
          skillScore: 1,
          recencyScore: 1,
          locationScore: 1,
          ratingScore: 1,
          finalScore: 1
        }
      }
    );

    const results = await User.aggregate(pipeline);

    // After const results = await User.aggregate(pipeline);
    const total = results.length;
    const pages = Math.ceil(total / limit) || 1;
    const currentPage = Math.min(Math.max(1, page), pages);
    const start = (currentPage - 1) * limit;
    const paged = results.slice(start, start + limit);

      return {
      matches: paged.map(u => ({
        user: {
          _id: u._id,
          name: u.name,
          email: u.email,
          profilePic: u.profilePic,
          location: u.location,
          rating: u.rating,
          lastActive: u.lastActive,
          skillsToTeach: u.skillsToTeach,
          skillsToLearn: u.skillsToLearn,
          role: u.role,
          availability: u.availability,
          bio: u.bio,
          isActive: u.isActive,
          canTeachYou: u.canTeachYou,
          wantsToLearn: u.wantsToLearn,
          skillScore: u.skillScore,
          recencyScore: u.recencyScore,
          locationScore: u.locationScore,
          ratingScore: u.ratingScore,
        },
        matchScore: u.finalScore
      })),
      pagination: {
        total,
        pages,
        page: currentPage,
        limit
      }
    };
  } catch (error) {
    console.error('Matching engine error:', error);
    throw new Error('Could not retrieve matches.');
  }
};

export { findMatches };