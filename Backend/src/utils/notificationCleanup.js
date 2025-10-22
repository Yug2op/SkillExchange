import Notification from '../models/Notification.js';

export const cleanupOldNotifications = async () => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 10); // 10 days
    
    const deletedCount = await Notification.deleteMany({
      createdAt: { $lt: cutoffDate }
    });
    
    // console.log(`🧹 Cleaned up ${deletedCount.deletedCount} old notifications`);
    return deletedCount.deletedCount;
  } catch (error) {
    console.error('❌ Notification cleanup failed:', error);
    throw error;
  }
};
