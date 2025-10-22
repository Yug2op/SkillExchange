import mongoose from 'mongoose';

// Backend/src/models/Skill.js - ALREADY CORRECT
const skillSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  category: {
    type: String,
    required: true,
    enum: ['Technology', 'Languages', 'Arts & Crafts', 'Music', 'Sports & Fitness',
      'Cooking', 'Business', 'Personal Development', 'Other']
  },
  tags: [{ type: String, trim: true }],
  description: String,
  userCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

skillSchema.index({ name: 'text', tags: 'text' });
skillSchema.index({ category: 1 });

export default mongoose.model('Skill', skillSchema);