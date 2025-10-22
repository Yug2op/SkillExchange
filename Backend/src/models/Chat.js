  import mongoose from 'mongoose';

  // Message sub-schema for individual messages in a chat
  const messageSchema = new mongoose.Schema({
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    read: {
      type: Boolean,
      default: false
    },
    messageType: {
      type: String,
      enum: ['text', 'file', 'image'],
      default: 'text'
    },
    fileUrl: {
      type: String,
      default: null
    },
    fileName: {
      type: String,
      default: null
    }
  }, { _id: true });

  // Chat schema for the main chat document
  const chatSchema = new mongoose.Schema({
    // Array of user IDs participating in the chat
    participants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }],

    // Optional exchange request that initiated the chat
    exchange: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ExchangeRequest',
      default: null
    },

    // Array of messages in chronological order
    messages: [messageSchema],

    // Last message text for quick display
    lastMessage: {
      type: String,
      default: null
    },

    // Timestamp of the last message
    lastMessageAt: {
      type: Date,
      default: Date.now
    },

    // Chat status
    isActive: {
      type: Boolean,
      default: true
    },

    // Chat type for different contexts (exchange, general, support)
    chatType: {
      type: String,
      enum: ['exchange', 'general', 'support'],
      default: 'general'
    },

    // Optional chat name for group chats (future feature)
    name: {
      type: String,
      default: null
    },

    // Chat settings
    settings: {
      notifications: {
        type: Boolean,
        default: true
      },
      soundEnabled: {
        type: Boolean,
        default: true
      }
    }
  }, {
    timestamps: true
  });

  // Indexes for better query performance
  chatSchema.index({ participants: 1 }); // For finding chats between users
  chatSchema.index({ lastMessageAt: -1 }); // For sorting chats by recent activity
  chatSchema.index({ 'messages.sender': 1, 'messages.read': 1 }); // For unread message queries
  chatSchema.index({ exchange: 1 }); // For finding chats related to specific exchanges
  chatSchema.index({ isActive: 1, lastMessageAt: -1 }); // For active chat queries

  // Virtual for getting unread message count
  chatSchema.virtual('unreadCount').get(function() {
    if (!this.messages || this.messages.length === 0) return 0;
    
    return this.messages.filter(msg => !msg.read).length;
  });

  // Method to mark messages as read
  chatSchema.methods.markMessagesAsRead = function(userId) {
    let hasChanges = false;
    
    this.messages.forEach(message => {
      // Handle both populated (object with _id) and unpopulated (ObjectId) cases
      const senderId = message.sender?._id ? message.sender._id.toString() : message.sender?.toString();
      // console.log(senderId)
      
      if (senderId && senderId !== userId.toString() && !message.read) {
        message.read = true;
        hasChanges = true;
      }
    });

    if (hasChanges) {
      return this.save();
    }
    
    return Promise.resolve(this);
  };
  

  // Static method to find or create a chat between two users
  chatSchema.statics.findOrCreateChat = async function(participant1, participant2, exchangeId = null) {
    // Look for existing active chat between these participants
    let chat = await this.findOne({
      participants: { $all: [participant1, participant2] },
      isActive: true,
      ...(exchangeId && { exchange: exchangeId })
    });

    if (!chat) {
      // Create new chat if none exists
      chat = new this({
        participants: [participant1, participant2],
        exchange: exchangeId,
        chatType: exchangeId ? 'exchange' : 'general'
      });
      await chat.save();
    }

    return chat;
  };

  export default mongoose.model('Chat', chatSchema);