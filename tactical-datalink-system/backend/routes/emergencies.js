
const express = require('express');
const auth = require('../middleware/auth');
const Emergency = require('../models/Emergency');

const router = express.Router();

// Get all emergencies
router.get('/', auth, async (req, res) => {
  try {
    const { status } = req.query;
    
    const filter = {};
    if (status) filter.status = status;

    const emergencies = await Emergency.find(filter)
      .populate('assignedUnits.unit')
      .sort({ createdAt: -1 });

    res.json(emergencies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get specific emergency
router.get('/:emergencyId', auth, async (req, res) => {
  try {
    const emergency = await Emergency.findOne({ 
      emergencyId: req.params.emergencyId 
    }).populate('assignedUnits.unit');

    if (!emergency) {
      return res.status(404).json({ error: 'Emergency not found' });
    }

    res.json(emergency);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

// Add this route to routes/emergencies.js

// Public emergency reporting (no auth required)
router.post('/public-report', async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      severity,
      location,
      reporterName,
      reporterPhone,
      reporterEmail,
      photos
    } = req.body;

    const emergencyId = `EMG-${Date.now()}`;

    const emergency = new Emergency({
      emergencyId,
      title,
      description,
      type,
      severity,
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address
      },
      status: 'pending',
      reporterContact: {
        name: reporterName,
        phone: reporterPhone,
        email: reporterEmail
      },
      photos: photos || []
    });

    await emergency.save();

    // Broadcast to command center via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('new_emergency', emergency);
    }

    res.status(201).json({
      success: true,
      emergencyId: emergency.emergencyId,
      message: 'Emergency reported successfully'
    });
  } catch (error) {
    console.error('Public emergency report error:', error);
    res.status(500).json({ error: 'Failed to report emergency' });
  }
});

// Get emergency by ID (public access for tracking)
router.get('/:emergencyId', async (req, res) => {
  try {
    const emergency = await Emergency.findOne({ 
      emergencyId: req.params.emergencyId 
    })
    .populate('assignedUnits.unit', 'unitId unitType status position');

    if (!emergency) {
      return res.status(404).json({ error: 'Emergency not found' });
    }

    res.json(emergency);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;