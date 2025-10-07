const express = require('express');
const auth = require('../middleware/auth');
const Unit = require('../models/Unit');

const router = express.Router();

// Get all units (command only)
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'command') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const units = await Unit.find().populate('userId', 'name email');
    res.json(units);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get specific unit
router.get('/:unitId', auth, async (req, res) => {
  try {
    const unit = await Unit.findOne({ unitId: req.params.unitId })
      .populate('userId', 'name email')
      .populate('assignedEmergency');
    
    if (!unit) {
      return res.status(404).json({ error: 'Unit not found' });
    }

    res.json(unit);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update unit status
router.patch('/:unitId/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    
    const unit = await Unit.findOneAndUpdate(
      { unitId: req.params.unitId },
      { status },
      { new: true }
    );

    res.json(unit);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;