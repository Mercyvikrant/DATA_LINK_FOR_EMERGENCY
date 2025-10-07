const mongoose = require('mongoose');

const emergencySchema = new mongoose.Schema({
  emergencyId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['medical', 'fire', 'crime', 'accident', 'disaster'],
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true
  },
  location: {
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    },
    address: String
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in-progress', 'resolved', 'cancelled'],
    default: 'pending'
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reporterContact: {
    name: String,
    phone: String,
    email: String
  },
  assignedUnits: [{
    unit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Unit'
    },
    role: {
      type: String,
      enum: ['primary', 'support']
    },
    assignedAt: {
      type: Date,
      default: Date.now
    }
  }],
  photos: [String], // Base64 or URLs
  notes: [String],
  createdAt: {
    type: Date,
    default: Date.now
  },
  resolvedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Emergency', emergencySchema);