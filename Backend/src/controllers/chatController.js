import Chat from '../models/Chat.js';
import ExchangeRequest from '../models/ExchangeRequest.js';

// @desc    Get user's chats
// @route   GET /api/chat
// @access  Private
export const getChats = async (req, res, next) => {
  try {
    const chats = await Chat.find({
      participants: req.user.id,
      isActive: true
    })
      .populate('participants', 'name email profilePic lastActive')
      .populate('exchange', 'skillOffered skillRequested status')
      .sort({ lastMessageAt: -1 });

    res.json({
      success: true,
      data: { chats }
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

    // Mark messages as read
    chat.messages.forEach(msg => {
      const senderId = msg.sender && msg.sender._id ? msg.sender._id.toString() : msg.sender.toString();
      if (senderId !== req.user.id && !msg.read) {
        msg.read = true;
      }
    });
    await chat.save();

    res.json({
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
    const { text } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message text is required'
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
        message: 'Not authorized'
      });
    }

    const message = {
      sender: req.user.id,
      text: text.trim(),
      timestamp: new Date()
    };

    chat.messages.push(message);
    chat.lastMessage = text.trim();
    chat.lastMessageAt = new Date();
    await chat.save();

    await chat.populate('messages.sender', 'name profilePic');

    res.status(201).json({
      success: true,
      data: { message: chat.messages[chat.messages.length - 1] }
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
    });

    const unreadCounts = chats.map(chat => {
      const count = chat.messages.reduce((acc, msg) => {
        if (msg.sender.toString() !== req.user.id && !msg.read) acc++;
        return acc;
      }, 0);

      return { _id: chat._id, count };
    });

    res.json({
      success: true,
      data: unreadCounts
    });
  } catch (error) {
    next(error);
  }
};


// @desc    Delete chat
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
        message: 'Not authorized'
      });
    }

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