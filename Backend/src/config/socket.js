import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import Chat from '../models/Chat.js';
import User from '../models/User.js';

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
    console.log(`✅ User connected: ${socket.userId}`);

    // Join user's personal room
    socket.join(socket.userId);

    // Join chat room
    socket.on('join-chat', (chatId) => {
      console.log(`📨 [BACKEND] RECEIVED join-chat event from user ${socket.userId} for chat ${chatId}`);
      socket.join(chatId);
      console.log(`✅ [BACKEND] User ${socket.userId} joined chat room ${chatId}`);
      console.log(`📢 [BACKEND] Broadcasting join notification to chat ${chatId}`);
    });

    // Send message
    socket.on('send-message', async ({ chatId, text, receiverId }) => {
      try {
        console.log(`📨 [BACKEND] RECEIVED send-message event from user ${socket.userId} to chat ${chatId}`);
        console.log(`📝 [BACKEND] Message content: "${text.substring(0, 50)}..."`);

        const chat = await Chat.findById(chatId);
        if (!chat) {
          console.log(`❌ [BACKEND] Chat ${chatId} not found`);
          return socket.emit('error', { message: 'Chat not found' });
        }

        if (!chat.participants.includes(socket.userId)) {
          console.log(`❌ [BACKEND] User ${socket.userId} not authorized in chat ${chatId}`);
          return socket.emit('error', { message: 'Not authorized in this chat' });
        }

        const newMessage = {
          sender: socket.userId,
          text,
          timestamp: new Date(),
        };

        chat.messages.push(newMessage);
        chat.lastMessage = text;
        chat.lastMessageAt = new Date();
        await chat.save();

        console.log(`💾 [BACKEND] Message saved to database`);
        console.log(`📢 [BACKEND] Broadcasting new-message to chat ${chatId}`);

        // Emit to chat room (all users in the chat except sender)
        socket.to(chatId).emit('new-message', { chatId, message: newMessage });
        console.log(`✅ [BACKEND] new-message event broadcast to other users in chat ${chatId}`);

        // Notify receiver if online
        if (receiverId) {
          socket.to(receiverId).emit('message-notification', {
            chatId,
            senderId: socket.userId,
            text,
          });
          console.log(`🔔 [BACKEND] Sent notification to receiver ${receiverId}`);
        }

      } catch (error) {
        console.error('❌ [BACKEND] send-message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicators
    socket.on('typing', ({ chatId }) => {
      console.log(`⌨️ [BACKEND] RECEIVED typing event from user ${socket.userId} in chat ${chatId}`);
      console.log(`📢 [BACKEND] Broadcasting user-typing to other users in chat ${chatId}`);
      socket.to(chatId).emit('user-typing', { userId: socket.userId, chatId });
      console.log(`✅ [BACKEND] user-typing event broadcast`);
    });

    socket.on('stop-typing', ({ chatId }) => {
      console.log(`🛑 [BACKEND] RECEIVED stop-typing event from user ${socket.userId} in chat ${chatId}`);
      console.log(`📢 [BACKEND] Broadcasting user-stop-typing to other users in chat ${chatId}`);
      socket.to(chatId).emit('user-stop-typing', { userId: socket.userId, chatId });
      console.log(`✅ [BACKEND] user-stop-typing event broadcast`);
    });

       // Mark messages as read
       socket.on('mark-as-read', async ({ chatId }) => {
        try {
          console.log(`📖 [BACKEND] RECEIVED mark-as-read event for chat ${chatId} from user ${socket.userId}`);
  
          const chat = await Chat.findById(chatId);
          if (!chat) {
            console.log(`❌ [BACKEND] Chat ${chatId} not found`);
            return;
          }
  
          // Update messages as read for this user
          await chat.markMessagesAsRead(socket.userId);
  
          console.log(`✅ [BACKEND] Messages marked as read for user ${socket.userId} in chat ${chatId}`);
          console.log(`📢 [BACKEND] Broadcasting messages-read to other users in chat ${chatId}`);
  
          // Broadcast read status to all users in the chat (including sender)
          io.to(chatId).emit('messages-read', { chatId, userId: socket.userId });
          console.log(`✅ [BACKEND] messages-read event broadcast`);
  
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
      console.log(`❌ User disconnected: ${socket.userId}`);
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
