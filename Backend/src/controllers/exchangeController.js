import ExchangeRequest from '../models/ExchangeRequest.js';
import Chat from '../models/Chat.js';
import User from '../models/User.js';
import { getIO } from '../config/socket.js';

// @desc    Create exchange request
// @route   POST /api/exchanges/request
// @access  Private
export const createExchangeRequest = async (req, res, next) => {
  try {
    const { receiverId, skillOffered, skillRequested, message } = req.body;

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found'
      });
    }

    // Prevent self-request
    if (req.user.id === receiverId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot send exchange request to yourself'
      });
    }

    // Check for existing pending request
    const existingRequest = await ExchangeRequest.findOne({
      sender: req.user.id,
      receiver: receiverId,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending request with this user'
      });
    }

    // Create exchange request
    const exchangeRequest = await ExchangeRequest.create({
      sender: req.user.id,
      receiver: receiverId,
      skillOffered,
      skillRequested,
      message
    });

    await exchangeRequest.populate('sender receiver', 'name email profilePic');

    // Send notification to receiver via socket
    try {
      const io = getIO();
      io.to(receiverId).emit('new-exchange-request', {
        request: exchangeRequest
      });
    } catch (error) {
      console.error('Socket notification failed:', error);
    }

    res.status(201).json({
      success: true,
      message: 'Exchange request sent successfully',
      data: { exchangeRequest }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's exchange requests
// @route   GET /api/exchanges/my
// @access  Private
export const getMyExchanges = async (req, res, next) => {
  try {
    const { status, type } = req.query;

    const query = {};

    if (type === 'sent') {
      query.sender = req.user.id;
    } else if (type === 'received') {
      query.receiver = req.user.id;
    } else {
      query.$or = [
        { sender: req.user.id },
        { receiver: req.user.id }
      ];
    }

    if (status) {
      query.status = status;
    }

    const exchanges = await ExchangeRequest.find(query)
      .populate('sender receiver', 'name email profilePic rating')
      .populate('chat')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { exchanges }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get exchange request by ID
// @route   GET /api/exchanges/:id
// @access  Private
export const getExchangeById = async (req, res, next) => {
  try {
    const exchange = await ExchangeRequest.findById(req.params.id)
      .populate('sender receiver', 'name email profilePic rating skillsToTeach skillsToLearn')
      .populate('chat');

    if (!exchange) {
      return res.status(404).json({
        success: false,
        message: 'Exchange request not found'
      });
    }

    // Check authorization
    if (
      exchange.sender._id.toString() !== req.user.id &&
      exchange.receiver._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this exchange'
      });
    }

    res.json({
      success: true,
      data: { exchange }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Accept exchange request
// @route   PUT /api/exchanges/:id/accept
// @access  Private
export const acceptExchange = async (req, res, next) => {
  try {
    const exchange = await ExchangeRequest.findById(req.params.id);

    if (!exchange) {
      return res.status(404).json({
        success: false,
        message: 'Exchange request not found'
      });
    }

    // Only receiver can accept
    if (exchange.receiver.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the receiver can accept this request'
      });
    }

    if (exchange.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'This exchange request has already been processed'
      });
    }

    exchange.status = 'accepted';

    // Find or create chat for the exchange
    // First, try to find existing chat between these users
    let chat = await Chat.findOne({
      participants: { $all: [exchange.sender, exchange.receiver] },
      isActive: true
    });

    if (!chat) {
      // Create new chat if none exists
      chat = await Chat.create({
        participants: [exchange.sender, exchange.receiver],
        exchange: exchange._id,
        chatType: 'exchange'
      });
    } else {
      // If chat exists, just link this exchange to it
      // (don't overwrite existing exchange link if any)
      if (!chat.exchange) {
        chat.exchange = exchange._id;
        await chat.save();
      }
    }

    // Ensure the exchange is linked to the chat
    if (!exchange.chat) {
      exchange.chat = chat._id;
      await exchange.save();
    }

    await exchange.populate('sender receiver', 'name email profilePic');

    res.json({
      success: true,
      message: 'Exchange request accepted',
      data: { exchange }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject exchange request
// @route   PUT /api/exchanges/:id/reject
// @access  Private
export const rejectExchange = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const exchange = await ExchangeRequest.findById(req.params.id);

    if (!exchange) {
      return res.status(404).json({
        success: false,
        message: 'Exchange request not found'
      });
    }

    // Only receiver can reject
    if (exchange.receiver.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the receiver can reject this request'
      });
    }

    if (exchange.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'This exchange request has already been processed'
      });
    }

    exchange.status = 'rejected';
    exchange.rejectedAt = Date.now();
    exchange.rejectionReason = reason;
    await exchange.save();

    await exchange.populate('sender receiver', 'name email profilePic');

    // Notify sender
    try {
      const io = getIO();
      io.to(exchange.sender.toString()).emit('exchange-rejected', {
        exchange
      });
    } catch (error) {
      console.error('Socket notification failed:', error);
    }

    res.json({
      success: true,
      message: 'Exchange request rejected',
      data: { exchange }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel exchange request
// @route   PUT /api/exchanges/:id/cancel
// @access  Private
export const cancelExchange = async (req, res, next) => {
  try {
    const exchange = await ExchangeRequest.findById(req.params.id);

    if (!exchange) {
      return res.status(404).json({
        success: false,
        message: 'Exchange request not found'
      });
    }

    // Only sender can cancel
    if (exchange.sender.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Only the sender can cancel this request'
      });
    }

    exchange.status = 'cancelled';
    await exchange.save();

    res.json({
      success: true,
      message: 'Exchange request cancelled',
      data: { exchange }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Schedule session
// @route   POST /api/exchanges/:id/schedule
// @access  Private
export const scheduleSession = async (req, res, next) => {
  try {
    const { date, startTime, endTime, type, location, meetingLink } = req.body;

    const exchange = await ExchangeRequest.findById(req.params.id);

    if (!exchange) {
      return res.status(404).json({
        success: false,
        message: 'Exchange request not found'        });
    }

    if (exchange.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'This exchange request has not been accepted'
      });
    }

    exchange.scheduledSessions.push({
      date,
      startTime,
      endTime,
      type,
      location,
      meetingLink
    });
    await exchange.save();

    res.json({
      success: true,
      message: 'Session scheduled successfully',
      data: { exchange }
    });
  } catch (error) {
    next(error);
  }
};
// @desc    Mark exchange as completed
// @route   PUT /api/exchanges/:id/complete
// @access  Private
export const completeExchange = async (req, res, next) => {
  try {
    const exchange = await ExchangeRequest.findById(req.params.id);

    if (!exchange) {
      return res.status(404).json({
        success: false,
        message: 'Exchange request not found'
      });
    }

    // Check authorization
    if (
      exchange.sender.toString() !== req.user.id &&
      exchange.receiver.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    exchange.status = 'completed';
    exchange.completedAt = Date.now();
    if (Array.isArray(exchange.scheduledSessions)) {
      exchange.scheduledSessions.forEach(session => {
        session.completed = true;
      });
    }
    await exchange.save();

    res.json({
      success: true,
      message: 'Exchange marked as completed',
      data: { exchange }
    });
  } catch (error) {
    next(error);
  }
};