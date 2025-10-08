import Chat from '../models/Chat.js';

// @desc    Get user's chats
// @route   GET /api/chat
// @access  Private
export const getChats = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const chats = await Chat.find({
      participants: req.user.id,
      isActive: true
    })
      .populate('participants', 'name email profilePic lastActive isOnline')
      .populate('exchange', 'skillOffered skillRequested status')
      .sort({ lastMessageAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Chat.countDocuments({
      participants: req.user.id,
      isActive: true
    });

    res.json({
      success: true,
      data: {
        chats,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get chat by ID
// @route   GET /api/chat/:id
// @access  Private
export const getChatById = async (req, res, next) => {
  try {
    const chat = await Chat.findById(req.params.id)
      .populate('participants', 'name email profilePic lastActive')
      .populate('exchange', 'skillOffered skillRequested status')
      .populate('messages.sender', 'name profilePic');

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check if user is participant
    const isParticipant = chat.participants.some(
      p => p._id.toString() === req.user.id
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this chat'
      });
    }

    // Mark messages as read when chat is accessed
    await chat.markMessagesAsRead(req.user.id);

    res.json({
      success: true,
      data: { chat }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create or get existing chat between two users
// @route   POST /api/chat/create
// @access  Private
export const createOrGetChat = async (req, res, next) => {
  try {
    const { participantId, exchangeId } = req.body;

    if (!participantId) {
      return res.status(400).json({
        success: false,
        message: 'Participant ID is required'
      });
    }

    // Prevent creating chat with yourself
    if (participantId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot create chat with yourself'
      });
    }

    // Find or create chat
    const chat = await Chat.findOrCreateChat(req.user.id, participantId, exchangeId);

    // Populate the chat data
    await chat.populate('participants', 'name email profilePic lastActive');
    await chat.populate('exchange', 'skillOffered skillRequested status');

    res.status(201).json({
      success: true,
      data: { chat }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Send message (HTTP fallback)
// @route   POST /api/chat/:id/message
// @access  Private
export const sendMessage = async (req, res, next) => {
  try {
    const { text, messageType = 'text', fileData } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message text is required'
      });
    }

    if (text.length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Message too long (max 2000 characters)'
      });
    }

    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check if user is participant
    const isParticipant = chat.participants.some(
      p => p.toString() === req.user.id
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to send messages in this chat'
      });
    }

    // Add message to chat
    await chat.addMessage(req.user.id, text, messageType, fileData);

    // Populate the new message sender data
    await chat.populate('messages.sender', 'name profilePic');

    // Get the last message (the one we just added)
    const lastMessage = chat.messages[chat.messages.length - 1];

    res.status(201).json({
      success: true,
      data: { message: lastMessage }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get unread message count per chat
// @route   GET /api/chat/unread/count
// @access  Private
export const getUnreadCount = async (req, res, next) => {
  try {
    const chats = await Chat.find({
      participants: req.user.id,
      isActive: true
    }).populate('messages.sender', 'name'); // Add this line to populate sender data

    const unreadCounts = chats.map(chat => ({
      _id: chat._id,
      count: chat.messages.reduce((acc, msg) => {
        // Fix: Properly check if message is from other user and unread
        if (msg.sender && msg.sender._id.toString() !== req.user.id && !msg.read) {
          acc++;
        }
        return acc;
      }, 0)
    }));

    res.json({
      success: true,
      data: unreadCounts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark messages as read
// @route   PUT /api/chat/:id/read
// @access  Private
export const markMessagesAsRead = async (req, res, next) => {
  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check if user is participant
    const isParticipant = chat.participants.some(
      p => p._id.toString() === req.user.id
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    await chat.markMessagesAsRead(req.user.id);

    res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete chat (soft delete)
// @route   DELETE /api/chat/:id
// @access  Private
export const deleteChat = async (req, res, next) => {
  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check if user is participant
    const isParticipant = chat.participants.some(
      p => p.toString() === req.user.id
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this chat'
      });
    }

    // Soft delete by deactivating the chat
    chat.isActive = false;
    await chat.save();

    res.json({
      success: true,
      message: 'Chat deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search chats by participant name
// @route   GET /api/chat/search
// @access  Private
export const searchChats = async (req, res, next) => {
  try {
    const { q: searchQuery } = req.query;

    if (!searchQuery || searchQuery.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const chats = await Chat.find({
      participants: req.user.id,
      isActive: true
    })
      .populate('participants', 'name email profilePic lastActive')
      .populate('exchange', 'skillOffered skillRequested status');

    // Filter chats by participant name (excluding current user)
    const filteredChats = chats.filter(chat => {
      const otherParticipants = chat.participants.filter(
        p => p._id.toString() !== req.user.id
      );
      return otherParticipants.some(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });

    // Sort by last message time
    filteredChats.sort((a, b) => b.lastMessageAt - a.lastMessageAt);

    res.json({
      success: true,
      data: { chats: filteredChats }
    });
  } catch (error) {
    next(error);
  }
};