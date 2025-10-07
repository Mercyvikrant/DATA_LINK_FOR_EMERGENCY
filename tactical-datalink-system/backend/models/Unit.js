const mongoose = require('mongoose');

const unitSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  unitId: {
    type: String,
    required: true,
    unique: true
  },
  unitType: {
    type: String,
    enum: ['ambulance', 'fire', 'police', 'rescue'],
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'busy', 'offline'],
    default: 'available'
  },
  position: {
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  resources: {
    fuel: { type: Number, default: 100 },
    personnel: { type: Number, default: 4 },
    equipment: [String]
  },
  assignedEmergency: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Emergency',
    default: null
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  socketId: String
}, { timestamps: true });

module.exports = mongoose.model('Unit', unitSchema);