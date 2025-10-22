// Backend/src/controllers/skillController.js
import Skill from '../models/Skill.js';
import SkillSuggestion from '../models/SkillSuggestion.js';

// === PUBLIC FUNCTIONS (No auth required) ===

// Get skills for public users (registration, browsing)
export const getSkillsForPublic = async (req, res) => {
  try {
    const { category, search } = req.query;
    
    let query = { isActive: true };
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skills = await Skill.find(query)
      .sort({ userCount: -1, name: 1 })
      .select('name category description userCount tags');
    
    res.json({ 
      success: true, 
      data: { skills },
      count: skills.length
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching skills',
      error: error.message 
    });
  }
};

// Get skill categories for filtering
export const getSkillCategories = async (req, res) => {
  try {
    const categories = await Skill.distinct('category', { isActive: true });
    res.json({ success: true, data: { categories } });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching categories',
      error: error.message 
    });
  }
};

// === Protected FUNCTIONS (Login required) ===

// Suggest a new skill (public endpoint)
export const suggestNewSkill = async (req, res) => {
  try {
    const { name, category, description } = req.body;
    const suggestedBy = req.user._id;
    
    // Validate required fields
    if (!name || !category) {
      return res.status(400).json({
        success: false,
        message: 'Name and category are required'
      });
    }
    
    // Check if skill already exists
    const existingSkill = await Skill.findOne({ 
      name: { $regex: `^${name}$`, $options: 'i' } 
    });
    
    if (existingSkill) {
      return res.status(400).json({
        success: false,
        message: 'This skill already exists'
      });
    }
    
    // Check if suggestion already exists
    const existingSuggestion = await SkillSuggestion.findOne({
      name: { $regex: `^${name}$`, $options: 'i' },
      status: 'pending'
    });
    
    if (existingSuggestion) {
      return res.status(400).json({
        success: false,
        message: 'This skill suggestion is already pending review'
      });
    }
    
    const suggestion = await SkillSuggestion.create({
      name,
      category,
      description,
      suggestedBy
    });
    
    res.status(201).json({ 
      success: true, 
      message: 'Skill suggestion submitted for review',
      data: { suggestion }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error submitting suggestion',
      error: error.message 
    });
  }
};

// === ADMIN FUNCTIONS (Admin auth required) ===

// Get all skills with admin details
export const getSkillsForAdmin = async (req, res) => {
  try {
    const { category, status, search } = req.query;
    
    let skillQuery = {};
    let suggestionQuery = { status: 'pending' };
    
    if (category && category !== 'all') {
      skillQuery.category = category;
    }
    
    if (status) {
      skillQuery.isActive = status === 'active';
    }
    
    if (search) {
      skillQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skills = await Skill.find(skillQuery).sort({ createdAt: -1 });
    const suggestions = await SkillSuggestion.find(suggestionQuery)
      .populate('suggestedBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({ 
      success: true, 
      data: { skills, suggestions },
      counts: {
        skills: skills.length,
        suggestions: suggestions.length
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching admin data',
      error: error.message 
    });
  }
};

// Create new skill (admin only)
export const createSkill = async (req, res) => {
  try {
    const { name, category, tags, description, level } = req.body;
    
    // Validate required fields
    if (!name || !category) {
      return res.status(400).json({
        success: false,
        message: 'Name and category are required'
      });
    }
    
    // Check if skill already exists
    const existingSkill = await Skill.findOne({ 
      name: { $regex: `^${name}$`, $options: 'i' } 
    });
    
    if (existingSkill) {
      return res.status(400).json({
        success: false,
        message: 'Skill already exists'
      });
    }
    
    const skill = await Skill.create({
      name,
      category,
      tags: tags || [],
      description,
      level: level || 'beginner'
    });
    
    res.status(201).json({ 
      success: true, 
      message: 'Skill created successfully',
      data: { skill }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error creating skill',
      error: error.message 
    });
  }
};

// Update skill (admin only)
export const updateSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const skill = await Skill.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Skill updated successfully',
      data: { skill }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error updating skill',
      error: error.message 
    });
  }
};

// Delete skill (admin only)
export const deleteSkill = async (req, res) => {
  try {
    const { id } = req.params;
    
    const skill = await Skill.findByIdAndDelete(id);
    
    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }
    
    // Also delete related suggestions
    await SkillSuggestion.deleteMany({ name: skill.name });
    
    res.json({ 
      success: true, 
      message: 'Skill deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting skill',
      error: error.message 
    });
  }
};

// Approve skill suggestion (admin only)
export const approveSkillSuggestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;
    
    const suggestion = await SkillSuggestion.findById(id);
    
    if (!suggestion) {
      return res.status(404).json({
        success: false,
        message: 'Suggestion not found'
      });
    }
    
    // Create the skill from suggestion
    const skill = await Skill.create({
      name: suggestion.name,
      category: suggestion.category,
      description: suggestion.description,
      tags: []
    });
    
    // Update suggestion status
    suggestion.status = 'approved';
    suggestion.adminNotes = adminNotes;
    suggestion.reviewedBy = req.user._id;
    suggestion.reviewedAt = new Date();
    await suggestion.save();
    
    res.json({ 
      success: true, 
      message: 'Skill suggestion approved and skill created',
      data: { skill, suggestion }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error approving suggestion',
      error: error.message 
    });
  }
};

// Reject skill suggestion (admin only)
export const rejectSkillSuggestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;
    
    const suggestion = await SkillSuggestion.findById(id);
    
    if (!suggestion) {
      return res.status(404).json({
        success: false,
        message: 'Suggestion not found'
      });
    }
    
    suggestion.status = 'rejected';
    suggestion.adminNotes = adminNotes;
    suggestion.reviewedBy = req.user._id;
    suggestion.reviewedAt = new Date();
    await suggestion.save();
    
    res.json({ 
      success: true, 
      message: 'Skill suggestion rejected',
      data: { suggestion }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error rejecting suggestion',
      error: error.message 
    });
  }
};

// Get skill statistics (admin only)
export const getSkillStats = async (req, res) => {
  try {
    const totalSkills = await Skill.countDocuments();
    const activeSkills = await Skill.countDocuments({ isActive: true });
    const totalSuggestions = await SkillSuggestion.countDocuments();
    const pendingSuggestions = await SkillSuggestion.countDocuments({ status: 'pending' });
    
    const skillsByCategory = await Skill.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    res.json({ 
      success: true, 
      data: {
        totalSkills,
        activeSkills,
        totalSuggestions,
        pendingSuggestions,
        skillsByCategory
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching skill statistics',
      error: error.message 
    });
  }
};