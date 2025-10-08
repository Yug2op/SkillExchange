import http from 'http';
import dotenv from 'dotenv';
dotenv.config();

import app from './src/app.js';
import connectDB from './src/config/database.js';
import { initializeSocket } from './src/config/socket.js';

const PORT = process.env.PORT || 8080;

// Connect to MongoDB
connectDB();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = initializeSocket(server);

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  io.close();
  server.close(() => console.log('Process terminated'));
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  io.close();
  server.close(() => console.log('Process terminated'));
});
