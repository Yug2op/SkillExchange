// Frontend/src/lib/socket.js
import { io } from 'socket.io-client';

export const connectSocket = (token) => {
  const socket = io(import.meta.env.VITE_API_URL, {
    auth: { token },
    withCredentials: true,
  });

  return socket;
};

// helpers
export const joinChat = (socket, chatId) => socket.emit('join-chat', chatId);
export const sendSocketMessage = (socket, { chatId, text, receiverId }) =>
  socket.emit('send-message', { chatId, text, receiverId });
export const typing = (socket, chatId) => socket.emit('typing', { chatId });
export const stopTyping = (socket, chatId) => socket.emit('stop-typing', { chatId });