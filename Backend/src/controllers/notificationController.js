import Notification from '../models/Notification.js';

// Get user's notifications
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ 
      recipient: req.user.id 
    })
    .populate('sender', 'name profilePic')
    .sort({ createdAt: -1 })
    .limit(50);

    const unreadCount = await Notification.countDocuments({
      recipient: req.user.id,
      read: false
    });

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
};

// Mark specific notification as read
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id },
      { read: true, readAt: new Date() },
      { new: true }
    ).populate('data');

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Return navigation info for frontend
    let redirectTo = null;
    switch (notification.type) {
      case 'exchange_request':
      case 'exchange_rejected':
      case 'exchange_accepted':
      case 'exchange_completed':
        redirectTo = '/exchanges';
        break;
      case 'message':
        redirectTo = '/chat';
        break;
      default:
        redirectTo = '/notifications';
    }

    res.json({
      success: true,
      data: { 
        notification,
        redirectTo 
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read'
    });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, read: false },
      { read: true }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read'
    });
  }
};

// Clean up old notifications (for manual cleanup or cron jobs)
export const cleanupOldNotifications = async (req, res) => {
  try {
    // Delete notifications older than 1 days
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 10);
    
    const deletedCount = await Notification.deleteMany({
      createdAt: { $lt: cutoffDate }
    });

    res.json({
      success: true,
      message: `Cleaned up ${deletedCount.deletedCount} old notifications`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup notifications'
    });
  }
};