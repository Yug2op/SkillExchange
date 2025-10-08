import { api } from './client.js';

class ChatAPI {
  // Get user's chats with pagination
  async getChats(page = 1, limit = 20) {
    try {
      const response = await api.get(`/api/chat?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching chats:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch chats');
    }
  }

  // Search chats by participant name
  async searchChats(query) {
    try {
      const response = await api.get(`/api/chat/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Error searching chats:', error);
      throw new Error(error.response?.data?.message || 'Failed to search chats');
    }
  }

  // Get specific chat by ID
  async getChatById(chatId) {
    try {
      const response = await api.get(`/api/chat/${chatId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching chat:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch chat');
    }
  }

  // Create or get existing chat between two users
  async createOrGetChat(participantId, exchangeId = null) {
    try {
      console.log("Creating chat with participant");
      const response = await api.post('/api/chat/create', {
        participantId,
        exchangeId
      });
      return response.data;
    } catch (error) {
      console.error('Error creating/getting chat:', error);
      throw new Error(error.response?.data?.message || 'Failed to create chat 1');
    }
  }

  // Send message via HTTP (fallback when Socket.IO is not available)
  async sendMessage(chatId, text, messageType = 'text', fileData = null) {
    try {
      const payload = {
        text,
        messageType,
        ...(fileData && { fileData })
      };

      const response = await api.post(`/api/chat/${chatId}/message`, payload);
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error(error.response?.data?.message || 'Failed to send message');
    }
  }

  // Get unread message counts
  async getUnreadCount() {
    try {
      const response = await api.get('/api/chat/unread/count');
      return response.data;
    } catch (error) {
      console.error('Error fetching unread counts:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch unread counts');
    }
  }

  // Mark messages as read
  async markMessagesAsRead(chatId) {
    try {
      const response = await api.put(`/api/chat/${chatId}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw new Error(error.response?.data?.message || 'Failed to mark messages as read');
    }
  }

  // Delete chat (soft delete)
  async deleteChat(chatId) {
    try {
      const response = await api.delete(`/api/chat/${chatId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting chat:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete chat');
    }
  }

  // Upload file for chat message (if needed)
  async uploadFile(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/api/chat/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error(error.response?.data?.message || 'Failed to upload file');
    }
  }
}

const chatApi = new ChatAPI();
export default chatApi;

// Export individual functions for backward compatibility
export const getChats = (page, limit) => chatApi.getChats(page, limit);
export const searchChats = (query) => chatApi.searchChats(query);
export const getChat = (chatId) => chatApi.getChatById(chatId);
export const createOrGetChat = (participantId, exchangeId) => chatApi.createOrGetChat(participantId, exchangeId);
export const sendMessage = (chatId, text, messageType, fileData) => chatApi.sendMessage(chatId, text, messageType, fileData);
export const getUnreadCount = () => chatApi.getUnreadCount();
export const markMessagesAsRead = (chatId) => chatApi.markMessagesAsRead(chatId);
export const deleteChat = (chatId) => chatApi.deleteChat(chatId);
export const uploadFile = (file) => chatApi.uploadFile(file);