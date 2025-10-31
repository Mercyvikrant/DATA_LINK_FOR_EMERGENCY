const express = require('express');
const auth = require('../middleware/auth');
const Message = require('../models/Message');

const router = express.Router();

// Get messages for user
router.get('/', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { from: req.user._id },
        { to: req.user._id },
        { to: null } // Broadcast messages
      ]
    })
    .populate('from', 'name role')
    .populate('to', 'name role')
    .sort({ createdAt: -1 })
    .limit(100);

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark message as read
router.patch('/:messageId/read', auth, async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.messageId,
      { isRead: true },
      { new: true }
    );

    res.json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clear all messages (command only)
router.delete('/clear', auth, async (req, res) => {
  try {
    // Only command can clear all messages
    if (req.user.role !== 'command') {
      return res.status(403).json({ error: 'Only command center can clear messages' });
    }

    // Delete all messages
    const result = await Message.deleteMany({});

    console.log(`🗑️ Cleared ${result.deletedCount} messages from database`);

    res.json({ 
      success: true, 
      deletedCount: result.deletedCount,
      message: 'All messages cleared successfully' 
    });
  } catch (error) {
    console.error('Clear messages error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;