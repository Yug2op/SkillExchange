import mongoose from 'mongoose';

const exchangeRequestSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skillOffered: {
    type: String,
    required: true
  },
  skillRequested: {
    type: String,
    required: true
  },
  message: {
    type: String,
    maxlength: 500
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  scheduledSessions: [{
    date: Date,
    startTime: String,
    endTime: String,
    type: {
      type: String,
      enum: ['online', 'offline']
    },
    location: String,
    meetingLink: String,
    completed: {
      type: Boolean,
      default: false
    }
  }],
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat'
  },
  completedAt: Date,
  rejectedAt: Date,
  rejectionReason: String
}, {
  timestamps: true
});

// Indexes
exchangeRequestSchema.index({ sender: 1, status: 1 });
exchangeRequestSchema.index({ receiver: 1, status: 1 });
exchangeRequestSchema.index({ status: 1, createdAt: -1 });

// Prevent duplicate pending requests
exchangeRequestSchema.index(
  { sender: 1, receiver: 1, status: 1 },
  { 
    unique: true, 
    partialFilterExpression: { status: 'pending' } 
  }
);

export default mongoose.model('ExchangeRequest', exchangeRequestSchema);
