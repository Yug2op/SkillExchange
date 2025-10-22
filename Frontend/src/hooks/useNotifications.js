import { useState, useEffect, useCallback } from 'react';
import socketService from '../../lib/socket.js';
import { api } from '../api/client.js';

const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  // Load notifications from backend API
  const loadNotifications = useCallback(async () => {
    try {
      const response = await api.get('/api/notifications'); // ✅ ADD /api prefix
      const { notifications: notificationsData, unreadCount: count } = response.data.data;
      setNotifications(notificationsData || []);
      setUnreadCount(count || 0);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await api.put(`/api/notifications/${notificationId}/read`); // ✅ ADD /api prefix

      setNotifications(prev =>
        prev.map(notif =>
          notif._id === notificationId
            ? { ...notif, read: true, readAt: new Date() }
            : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await api.put('/api/notifications/read-all'); // ✅ ADD /api prefix
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, read: true, readAt: new Date() }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }, []);

  // Socket event handlers for real-time notifications
  useEffect(() => {
    // Handle new exchange request notifications
    const handleExchangeRequest = (data) => {
      const notification = {
        _id: `temp_${Date.now()}`, // Temporary ID until refreshed from API
        type: 'exchange_request',
        title: 'New Exchange Request',
        message: `You have a new skill exchange request`,
        data: data.request,
        read: false,
        createdAt: new Date()
      };
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    // Handle exchange rejected notifications
    const handleExchangeRejected = (data) => {
      const notification = {
        _id: `temp_${Date.now()}`,
        type: 'exchange_rejected',
        title: 'Exchange Request Rejected',
        message: `Your exchange request was rejected`,
        data: data.exchange,
        read: false,
        createdAt: new Date()
      };
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    // Handle exchange accepted notifications
    const handleExchangeAccepted = (data) => {
      const notification = {
        _id: `temp_${Date.now()}`,
        type: 'exchange_accepted',
        title: 'Exchange Request Accepted',
        message: `${data.acceptedBy} accepted your exchange request`,
        data: data.exchange,
        read: false,
        createdAt: new Date()
      };
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    // Handle exchange completed notifications
    const handleExchangeCompleted = (data) => {
      const notification = {
        _id: `temp_${Date.now()}`,
        type: 'exchange_completed',
        title: 'Exchange Completed',
        message: `${data.completedBy} marked the exchange as completed`,
        data: data.exchange,
        read: false,
        createdAt: new Date()
      };
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    // Handle new message notifications
    const handleMessageNotification = (data) => {
      const notification = {
        _id: `temp_${Date.now()}`,
        type: 'message',
        title: 'New Message',
        message: `New message from ${data.senderName || 'someone'}`,
        data: { chatId: data.chatId, senderId: data.senderId },
        read: false,
        createdAt: new Date()
      };
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    // Handle new review notifications
    const handleNewReview = (data) => {
      const notification = {
        _id: `temp_${Date.now()}`,
        type: 'review_received',
        title: 'New Review Received',
        message: `${data.reviewerName} left you a ${data.rating}-star review`,
        data: { reviewId: data.review._id, rating: data.rating },
        read: false,
        createdAt: new Date()
      };
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    // Handle admin action notifications
    const handleAccountStatusChanged = (data) => {
      const notification = {
        _id: `temp_${Date.now()}`,
        type: data.status === 'deactivated' ? 'account_deactivated' : 'account_activated',
        title: `Account ${data.status === 'deactivated' ? 'Deactivated' : 'Activated'}`,
        message: data.message,
        data: { status: data.status },
        read: false,
        createdAt: new Date()
      };
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    // Handle session scheduled notifications
    const handleSessionScheduled = (data) => {
      const notification = {
        _id: `temp_${Date.now()}`,
        type: 'session_scheduled',
        title: 'Session Scheduled',
        message: `New ${data.sessionType} session scheduled for ${new Date(data.sessionDate).toLocaleDateString()}`,
        data: {
          exchangeId: data.exchangeId,
          sessionType: data.sessionType,
          sessionDate: data.sessionDate
        },
        read: false,
        createdAt: new Date()
      };
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    // Register socket listeners
    socketService.on('new-exchange-request', handleExchangeRequest);
    socketService.on('exchange-rejected', handleExchangeRejected);
    socketService.on('exchange-accepted', handleExchangeAccepted);
    socketService.on('exchange-completed', handleExchangeCompleted);
    socketService.on('message-notification', handleMessageNotification);
    socketService.on('new-review-notification', handleNewReview);
    socketService.on('account-status-changed', handleAccountStatusChanged);
    socketService.on('session-scheduled', handleSessionScheduled);

    // Load initial notifications
    loadNotifications();

    return () => {
      socketService.off('new-exchange-request', handleExchangeRequest);
      socketService.off('exchange-rejected', handleExchangeRejected);
      socketService.off('exchange-accepted', handleExchangeAccepted);
      socketService.off('exchange-completed', handleExchangeCompleted);
      socketService.off('message-notification', handleMessageNotification);
      socketService.off('new-review-notification', handleNewReview);
      socketService.off('account-status-changed', handleAccountStatusChanged);
      socketService.off('session-scheduled', handleSessionScheduled);
    };
  }, [loadNotifications]);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    loadNotifications
  };
};

export default useNotifications;
