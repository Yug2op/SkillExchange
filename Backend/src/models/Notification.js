import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: ['exchange_request', 'exchange_rejected', 'exchange_accepted', 'exchange_completed', 'message', 'review_received', 'account_deactivated', 'account_activated', 'account_deleted', 'system'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed // For storing additional data (exchange ID, chat ID, etc.)
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 10 * 24 * 60 * 60 // Auto-delete after 10 days - This creates the TTL index automatically
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for efficient queries (but NOT TTL index since it's handled by expires above)
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, read: 1 });

// ❌ REMOVE THIS - It's creating a duplicate TTL index
// notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 10 * 24 * 60 * 60 });

export default mongoose.model('Notification', notificationSchema);
