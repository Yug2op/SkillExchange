import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import Chat from '../models/Chat.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import mongoose from 'mongoose';
let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication error'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) return next(new Error('User not found'));

      socket.userId = user._id.toString();
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    // console.log(`✅ User connected: ${socket.userId}`);

    // Join user's personal room
    socket.join(socket.userId);

    // Join chat room
    socket.on('join-chat', (chatId) => {
      // console.log(`📨 [BACKEND] RECEIVED join-chat event from user ${socket.userId} for chat ${chatId}`);
      socket.join(chatId);
      // console.log(`✅ [BACKEND] User ${socket.userId} joined chat room ${chatId}`);
      // console.log(`📢 [BACKEND] Broadcasting join notification to chat ${chatId}`);
    });

    // Load chat (for real-time updates)
    socket.on('load-chat', async ({ chatId }) => {
      try {
        // console.log(`📋 [BACKEND] User ${socket.userId} loading chat ${chatId}`);

        const chat = await Chat.findById(chatId)
          .populate('participants', 'name email profilePic lastActive isOnline')
          .populate('messages.sender', 'name profilePic');

        if (!chat) {
          // console.log(`❌ [BACKEND] Chat ${chatId} not found`);
          return socket.emit('error', { message: 'Chat not found' });
        }

        if (!chat.participants.includes(socket.userId)) {
          // console.log(`❌ [BACKEND] User ${socket.userId} not authorized for chat ${chatId}`);
          return socket.emit('error', { message: 'Not authorized' });
        }

        // Send chat data to user
        socket.emit('chat-loaded', { chat });
        // console.log(`✅ [BACKEND] Chat ${chatId} data sent to user ${socket.userId}`);

        // ✅ FIX: Mark messages as read when chat is loaded via socket (consistent with API)
        await chat.markMessagesAsRead(socket.userId);

        // ✅ FIX: Broadcast read status to other users in real-time
        io.to(chatId).emit('messages-read', { chatId, userId: socket.userId });

      } catch (error) {
        console.error('❌ [BACKEND] load-chat error:', error);
        socket.emit('error', { message: 'Failed to load chat' });
      }
    });

    // Leave chat room
    socket.on('leave-chat', (chatId) => {
      // console.log(`🚪 [BACKEND] User ${socket.userId} leaving chat ${chatId}`);
      socket.leave(chatId);
      // console.log(`✅ [BACKEND] User ${socket.userId} left chat room ${chatId}`);
    });

    // Get online users
    socket.on('get-online-users', async () => {
      try {
        // console.log(`👥 [BACKEND] User ${socket.userId} requesting online users`);

        // Get all connected sockets (users)
        const io = getIO();
        const connectedSockets = await io.fetchSockets();

        const onlineUsers = connectedSockets.map(s => ({
          userId: s.userId,
          connectedAt: s.connectedAt || new Date()
        }));

        socket.emit('online-users', { users: onlineUsers });
        // console.log(`✅ [BACKEND] Sent ${onlineUsers.length} online users to user ${socket.userId}`);

      } catch (error) {
        console.error('❌ [BACKEND] get-online-users error:', error);
        socket.emit('error', { message: 'Failed to get online users' });
      }
    });

    // Send message
    socket.on('send-message', async ({ chatId, text, messageType, fileData, SenderId }) => {
      try {
        // console.log(`📨 [BACKEND] RECEIVED send-message event from user ${socket.userId} to chat ${chatId}`);
        // console.log(`📝 [BACKEND] Message content: "${text.substring(0, 50)}..."`);

        const chat = await Chat.findById(chatId);
        if (!chat) {
          // console.log(`❌ [BACKEND] Chat ${chatId} not found`);
          return socket.emit('error', { message: 'Chat not found' });
        }

        if (!chat.participants.includes(socket.userId)) {
          // console.log(`❌ [BACKEND] User ${socket.userId} not authorized in chat ${chatId}`);
          return socket.emit('error', { message: 'Not authorized in this chat' });
        }

        const user = await User.findById(socket.userId).select('name profilePic')

        const senderId = new mongoose.Types.ObjectId((socket.userId || SenderId).toString());



        const newMessage = {
          sender: senderId,
          text,
          timestamp: new Date(),
          read: false, // Important: mark as unread initially
          messageType: messageType || 'text'
        };

        chat.messages.push(newMessage);
        chat.lastMessage = text;
        chat.lastMessageAt = new Date();
        await chat.save();

        // console.log(`💾 [BACKEND] Message saved to database`);
        // console.log(`📢 [BACKEND] Broadcasting new-message to chat ${chatId}`);

        // IMPORTANT: Use io.to() instead of socket.to() to broadcast to ALL users in the room INCLUDING sender
        io.to(chatId).emit('new-message', {
          chatId,
          message: {
            ...newMessage,
            _id: chat.messages[chat.messages.length - 1]._id, // Include the generated _id
            sender: {
              _id: senderId,
              name: user?.name || 'Unknown',
              profilePic: user?.profilePic


            }
          }
        });
        // console.log(`✅ [BACKEND] new-message event broadcast to ALL users (including sender) in chat ${chatId}`);

        // Notify receiver if online (separate notification)
        // if (receiverId) {// Create database notification for message
        //   try {
        //     await Notification.create({
        //       recipient: receiverId,
        //       sender: socket.userId,
        //       type: 'message',
        //       title: 'New Message',
        //       message: `New message from ${senderName || 'user'}`,
        //       data: {
        //         chatId,
        //         messageId: chat.messages[chat.messages.length - 1]._id
        //       }
        //     });
        //   } catch (error) {
        //     console.error('Failed to create message notification:', error);
        //   }

        //   socket.to(receiverId).emit('message-notification', {
        //     chatId,
        //     senderId: socket.userId,
        //     text,
        //   });
        //   // console.log(`🔔 [BACKEND] Sent notification to receiver ${receiverId}`);
        // }

      } catch (error) {
        console.error('❌ [BACKEND] send-message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicators
    socket.on('typing', async ({ chatId }) => {
      // console.log(`⌨️ [BACKEND] RECEIVED typing event from user ${socket.userId} in chat ${chatId}`);
      // console.log(`📢 [BACKEND] Broadcasting user-typing to other users in chat ${chatId}`);
      const chat = await Chat.findById(chatId);
      
      if (!chat.participants.includes(socket.userId)) {
        return socket.emit('error', { message: 'Not authorized' });
      }

      socket.to(chatId).emit('user-typing', { userId: socket.userId, chatId });
      // console.log(`✅ [BACKEND] user-typing event broadcast`);
    });

    socket.on('stop-typing', ({ chatId }) => {
      // console.log(`🛑 [BACKEND] RECEIVED stop-typing event from user ${socket.userId} in chat ${chatId}`);
      // console.log(`📢 [BACKEND] Broadcasting user-stop-typing to other users in chat ${chatId}`);
      socket.to(chatId).emit('user-stop-typing', { userId: socket.userId, chatId });
      // console.log(`✅ [BACKEND] user-stop-typing event broadcast`);
    });

    // Mark messages as read
    socket.on('mark-as-read', async ({ chatId }) => {
      try {
        // console.log(`📖 [BACKEND] RECEIVED mark-as-read event for chat ${chatId} from user ${socket.userId}`);

        const chat = await Chat.findById(chatId);
        if (!chat) {
          // console.log(`❌ [BACKEND] Chat ${chatId} not found`);
          return;
        }

        if (!chat.participants.includes(socket.userId)) {
          return socket.emit('error', { message: 'Not authorized' });
        }

        // Update messages as read for this user
        await chat.markMessagesAsRead(socket.userId);

        // console.log(`✅ [BACKEND] Messages marked as read for user ${socket.userId} in chat ${chatId}`);
        // console.log(`📢 [BACKEND] Broadcasting messages-read to other users in chat ${chatId}`);

        // Broadcast read status to all users in the chat (including sender)
        io.to(chatId).emit('messages-read', { chatId, userId: socket.userId });
        // console.log(`✅ [BACKEND] messages-read event broadcast`);

      } catch (err) {
        console.error('Error marking messages as read:', err);
      }
    });

    // User online/offline
    socket.on('set-online', async () => {
      try {
        await User.findByIdAndUpdate(socket.userId, { isOnline: true, lastActive: null });
        io.emit('user-status', { userId: socket.userId, isOnline: true });
      } catch (error) {
        console.error('Error setting user online:', error);
      }
    });

    socket.on('disconnect', async () => {
      // console.log(`❌ User disconnected: ${socket.userId}`);
      try {
        await User.findByIdAndUpdate(socket.userId, { isOnline: false, lastActive: new Date() });
        io.emit('user-status', { userId: socket.userId, isOnline: false, lastActive: new Date() });
      } catch (error) {
        console.error('Error on disconnect:', error);
      }
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};
