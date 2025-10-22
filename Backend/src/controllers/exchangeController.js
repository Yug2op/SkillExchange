import ExchangeRequest from '../models/ExchangeRequest.js';
import Chat from '../models/Chat.js';
import User from '../models/User.js';
import { getIO } from '../config/socket.js';
import Notification from '../models/Notification.js';

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

    // Create notification in database
    await Notification.create({
      recipient: receiverId,
      sender: req.user.id,
      type: 'exchange_request',
      title: 'New Exchange Request',
      message: `${req.user.name} sent you a skill exchange request`,
      data: { exchangeRequestId: exchangeRequest._id }
    });

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
    let chat = await Chat.findOne({
      participants: { $all: [exchange.sender, exchange.receiver] },
      isActive: true
    });

    if (!chat) {
      chat = await Chat.create({
        participants: [exchange.sender, exchange.receiver],
        exchange: exchange._id,
        chatType: 'exchange'
      });
    } else {
      if (!chat.exchange) {
        chat.exchange = exchange._id;
        await chat.save();
      }
    }

    if (!exchange.chat) {
      exchange.chat = chat._id;
      await exchange.save();
    }

    await exchange.populate('sender receiver', 'name email profilePic');

    // ✅ ENSURE: All database operations complete first
    await Promise.all([
      exchange.save(),
      chat.save(),
      Notification.create({
        recipient: exchange.sender.toString(),
        sender: req.user.id,
        type: 'exchange_accepted',
        title: 'Exchange Request Accepted',
        message: `${req.user.name} accepted your skill exchange request`,
        data: { 
          exchangeRequestId: exchange._id,
          chatId: chat._id
        }
      })
    ]);

    // ✅ THEN send socket notification
    try {
      const io = getIO();
      io.to(exchange.sender.toString()).emit('exchange-accepted', {
        exchange,
        acceptedBy: req.user.name
      });
    } catch (error) {
      console.error('Socket notification failed:', error);
      // Don't fail the request if socket fails
    }

    // ✅ FINALLY send response after all operations
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

    // Create notification for sender
    await Notification.create({
      recipient: exchange.sender.toString(),
      sender: req.user.id,
      type: 'exchange_rejected',
      title: 'Exchange Request Rejected',
      message: `${req.user.name} rejected your skill exchange request`,
      data: {
        exchangeRequestId: exchange._id,
        rejectionReason: reason
      }
    });

    // Notify sender via socket
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
        message: 'Exchange request not found'
      });
    }

    if (exchange.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'This exchange request has not been accepted'
      });
    }

    // Add the new session to scheduled sessions
    const newSession = {
      date,
      startTime,
      endTime,
      type,
      location,
      meetingLink,
      completed: false
    };

    exchange.scheduledSessions.push(newSession);
    await exchange.save();

    // Populate for notification data
    await exchange.populate('sender receiver', 'name email profilePic');

    // ✅ ADD: Create notifications for both participants
    const otherParticipantId = exchange.sender.toString() === req.user.id
      ? exchange.receiver.toString()
      : exchange.sender.toString();

    // Notify the other participant
    await Notification.create({
      recipient: otherParticipantId,
      sender: req.user.id,
      type: 'session_scheduled',
      title: 'Session Scheduled',
      message: `${req.user.name} scheduled a ${type} session for ${new Date(date).toLocaleDateString()}`,
      data: {
        exchangeId: exchange._id,
        sessionId: exchange.scheduledSessions[exchange.scheduledSessions.length - 1]._id,
        sessionType: type,
        sessionDate: date,
        sessionTime: startTime
      }
    });

    // Send real-time socket notification to other participant
    try {
      const io = getIO();
      io.to(otherParticipantId).emit('session-scheduled', {
        exchangeId: exchange._id,
        scheduledBy: req.user.name,
        sessionType: type,
        sessionDate: date,
        sessionTime: startTime,
        location,
        meetingLink,
        message: `New ${type} session scheduled for ${new Date(date).toLocaleDateString()}`
      });
    } catch (error) {
      console.error('Socket notification failed:', error);
    }

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

    // Create notifications for both participants
    const otherParticipantId = exchange.sender.toString() === req.user.id
      ? exchange.receiver.toString()
      : exchange.sender.toString();

    await Notification.create({
      recipient: otherParticipantId,
      sender: req.user.id,
      type: 'exchange_completed',
      title: 'Exchange Completed',
      message: `${req.user.name} marked the skill exchange as completed`,
      data: { exchangeRequestId: exchange._id }
    });

    // Add after database notification creation
    try {
      const io = getIO();
      io.to(otherParticipantId).emit('exchange-completed', {
        exchange,
        completedBy: req.user.name
      });
    } catch (error) {
      console.error('Socket notification failed:', error);
    }

    res.json({
      success: true,
      message: 'Exchange marked as completed',
      data: { exchange }
    });
  } catch (error) {
    next(error);
  }
};