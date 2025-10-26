import mongoose from 'mongoose';

const chatSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    default: 'New Chat'
  },
  messages: [{
    id: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    metadata: {
      tokens: Number,
      model: String,
      responseTime: Number,
      language: String,
      inputType: {
        type: String,
        enum: ['text', 'voice', 'vision'],
        default: 'text'
      },
      attachments: [{
        type: String,
        url: String,
        filename: String,
        size: Number
      }]
    }
  }],
  settings: {
    model: {
      type: String,
      default: 'gpt-4-turbo-preview'
    },
    temperature: {
      type: Number,
      default: 0.7,
      min: 0,
      max: 2
    },
    maxTokens: {
      type: Number,
      default: 4000
    },
    language: {
      type: String,
      default: 'en'
    },
    persona: {
      type: String,
      default: 'Dwiju'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  totalMessages: {
    type: Number,
    default: 0
  },
  totalTokens: {
    type: Number,
    default: 0
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
chatSessionSchema.index({ userId: 1, createdAt: -1 });
chatSessionSchema.index({ sessionId: 1 });
chatSessionSchema.index({ isActive: 1 });
chatSessionSchema.index({ lastActivity: -1 });

// Pre-save middleware to update stats
chatSessionSchema.pre('save', function(next) {
  if (this.isModified('messages')) {
    this.totalMessages = this.messages.length;
    this.totalTokens = this.messages.reduce((total, msg) => {
      return total + (msg.metadata?.tokens || 0);
    }, 0);
    this.lastActivity = new Date();
    
    // Update title based on first user message if still default
    if (this.title === 'New Chat' && this.messages.length > 0) {
      const firstUserMessage = this.messages.find(msg => msg.role === 'user');
      if (firstUserMessage) {
        this.title = firstUserMessage.content.substring(0, 50) + 
                    (firstUserMessage.content.length > 50 ? '...' : '');
      }
    }
  }
  next();
});

// Method to add message
chatSessionSchema.methods.addMessage = function(message) {
  this.messages.push({
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    ...message
  });
  return this.save();
};

// Method to get recent messages
chatSessionSchema.methods.getRecentMessages = function(limit = 10) {
  return this.messages.slice(-limit);
};

// Static method to cleanup old sessions
chatSessionSchema.statics.cleanupOldSessions = function(daysOld = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  return this.updateMany(
    { lastActivity: { $lt: cutoffDate } },
    { isActive: false }
  );
};

export default mongoose.model('ChatSession', chatSessionSchema);
