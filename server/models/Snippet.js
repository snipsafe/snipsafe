const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const snippetSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    maxlength: 100000 // 100KB limit
  },
  language: {
    type: String,
    default: 'plaintext'
  },
  description: {
    type: String,
    maxlength: 1000
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  organization: {
    type: String,
    required: true
  },
  shareId: {
    type: String,
    unique: true,
    default: () => require('uuid').v4()
  },
  visibility: {
    type: String,
    enum: ['private', 'organization', 'public'],
    default: 'private'
  },
  tags: [{
    type: String,
    trim: true
  }],
  views: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sharedWith: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    email: String, // Store email for users not yet registered
    permissions: {
      type: String,
      enum: ['view', 'edit'],
      default: 'view'
    },
    sharedAt: {
      type: Date,
      default: Date.now
    },
    sharedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  currentViewers: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    lastSeen: {
      type: Date,
      default: Date.now
    },
    socketId: String // For real-time updates
  }]
}, {
  timestamps: true
});

snippetSchema.index({ author: 1, createdAt: -1 });
snippetSchema.index({ organization: 1, visibility: 1 });
snippetSchema.index({ shareId: 1 });

// Clean up old viewers (remove viewers inactive for more than 5 minutes)
snippetSchema.methods.cleanupViewers = function() {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  this.currentViewers = this.currentViewers.filter(
    viewer => viewer.lastSeen > fiveMinutesAgo
  );
  return this.save();
};

module.exports = mongoose.model('Snippet', snippetSchema);
