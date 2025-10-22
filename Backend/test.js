// debug-matches.js
import User from './src/models/User.js';
import connectDb from './src/config/database.js'
import mongoose from 'mongoose';

connectDb();

const debugMatches = async () => {
  try {
    // Connect to database (adjust connection string as needed)
    // await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/skillexchange');

    console.log('🔍 Debugging user data and matches...\n');

    // 1. Check total users
    const totalUsers = await User.countDocuments();
    console.log(`📊 Total users in database: ${totalUsers}`);

    // 2. Get all active users
    const allUsers = await User.find({ isActive: true })
      .select('name email skillsToTeach skillsToLearn location')
      .sort({ name: 1 });

    console.log(`\n👥 Active users (${allUsers.length}):`);
    allUsers.forEach(user => {
      console.log(`  - ${user.name} (${user.email})`);
      console.log(`    Teaches: ${user.skillsToTeach?.map(s => s.skill).join(', ') || 'None'}`);
      console.log(`    Learns: ${user.skillsToLearn?.map(s => s.skill).join(', ') || 'None'}`);
      console.log(`    Location: ${user.location?.city || 'Not set'}`);
      console.log('');
    });

    // 3. Test matching for a specific user
    if (allUsers.length > 0) {
      const testUser = allUsers[0];
      console.log(`🧪 Testing matches for: ${testUser.name}`);

      const skillsToTeach = testUser.skillsToTeach?.map(s => s.skill) || [];
      const skillsToLearn = testUser.skillsToLearn?.map(s => s.skill) || [];

      console.log(`  Skills to teach: [${skillsToTeach.join(', ')}]`);
      console.log(`  Skills to learn: [${skillsToLearn.join(', ')}]`);

      // In your debug script
const user = await User.findOne({name: "Riyaaaaaaaaaaaaaaa"});
console.log('User skills structure:', JSON.stringify(user.skillsToTeach, null, 2));
console.log('User skills to learn:', JSON.stringify(user.skillsToLearn, null, 2));

      // Find potential matches manually
      const potentialMatches = await User.find({
        _id: { $ne: testUser._id },
        isActive: true,
        $or: [
          { 'skillsToTeach.skill': { $in: skillsToLearn } },
          { 'skillsToLearn.skill': { $in: skillsToTeach } }
        ]
      }).select('name skillsToTeach.skill skillsToLearn.skill');

      console.log(`\n🎯 Potential matches found: ${potentialMatches.length}`);
      potentialMatches.forEach(user => {
        console.log(`  - ${user.name}`);
        console.log(`    Can teach: ${user.skillsToTeach?.map(s => s.skill).join(', ')}`);
        console.log(`    Wants to learn: ${user.skillsToLearn?.map(s => s.skill).join(', ')}`);
      });
    }

    await mongoose.connection.close();
    console.log('\n✅ Debug complete!');

  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
};

debugMatches();