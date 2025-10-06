import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import Chat from '../models/Chat.js';
import User from '../models/User.js';

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      credentials: true
    }
  });

  // Socket authentication middleware 
  io.use(async (socket, next) => {
    console.log(`User ${socket.userId} connected`);
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
    socket.join(socket.userId);
    console.log(`User connected: ${socket.userId}`);

    // Join user's personal room

    // Join chat room
    socket.on('join-chat', (chatId) => {
      socket.join(chatId);
      console.log(`User ${socket.userId} joined chat ${chatId}`);
    });

    // Handle new message
    socket.on('send-message', async (data) => {
      console.log(`User ${socket.userId} sent message to chat ${data.chatId}`);
      const { chatId, text, receiverId } = data;

      try {
        const chat = await Chat.findById(chatId);

        if (!chat) {
          socket.emit('error', { message: 'Chat not found' });
          return;
        }

        const newMessage = {
          sender: socket.userId,
          text,
          timestamp: new Date()
        };

        chat.messages.push(newMessage);
        chat.lastMessage = text;
        chat.lastMessageAt = new Date();
        await chat.save();

        // Emit to both users
        io.to(chatId).emit('new-message', {
          chatId,
          message: newMessage
        });

        // Send notification to receiver if they're online
        io.to(receiverId).emit('message-notification', {
          chatId,
          senderId: socket.userId,
          text
        });

      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('typing', (data) => {
      console.log(`User ${socket.userId} typing in chat ${data.chatId}`);
      socket.to(data.chatId).emit('user-typing', {
        userId: socket.userId,
        chatId: data.chatId
      });
    });

    socket.on('stop-typing', (data) => {
      console.log(`User ${socket.userId} stopped typing in chat ${data.chatId}`);
      socket.to(data.chatId).emit('user-stop-typing', {
        userId: socket.userId,
        chatId: data.chatId
      });
    });

    // Handle marking messages as read
    socket.on('mark-as-read', async ({ chatId }) => {
      console.log(`User ${socket.userId} marked chat ${chatId} as read`);
      try {
        await Chat.updateOne(
          { _id: chatId },
          { $set: { 'messages.$[elem].read': true } },
          { arrayFilters: [{ 'elem.read': false }] }
        );

        io.to(chatId).emit('messages-read', { chatId });
      } catch (err) {
        console.error('Error marking messages as read:', err);
      }
    });


       // Handle online status
    socket.on('set-online', async () => {
      console.log(`User ${socket.userId} set online`);
      try {
        await User.findByIdAndUpdate(socket.userId, { isOnline: true, lastActive: null });
        // Notify all connected users about online status (since contacts field doesn't exist)
        io.emit('user-status', {
          userId: socket.userId,
          isOnline: true
        });
      } catch (error) {
        console.error('Error setting user online:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.userId}`);
      
      try {
        await User.findByIdAndUpdate(socket.userId, {
          isOnline: false,
          lastActive: new Date()
        });

        // Broadcast user offline status
        io.emit('user-status', {
          userId: socket.userId,
          isOnline: false,
          lastActive: new Date()
        });

      } catch (error) {
        console.error('Error handling disconnect:', error);
      }
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};