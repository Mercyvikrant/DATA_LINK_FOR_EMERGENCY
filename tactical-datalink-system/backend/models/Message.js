const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  messageType: {
    type: String,
    enum: ['text', 'alert', 'assignment', 'system'],
    default: 'text'
  },
  content: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['normal', 'high', 'urgent'],
    default: 'normal'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  relatedEmergency: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Emergency'
  }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);