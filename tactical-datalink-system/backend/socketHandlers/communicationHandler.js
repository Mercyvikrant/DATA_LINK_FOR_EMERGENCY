const Message = require('../models/Message');

module.exports = (io, socket) => {
  // Send message
  socket.on('send_message', async (data) => {
    try {
      const { from, to, content, priority, messageType, relatedEmergency } = data;

      const message = new Message({
        from,
        to,
        content,
        priority: priority || 'normal',
        messageType: messageType || 'text',
        relatedEmergency
      });

      await message.save();

      // Populate sender info
      await message.populate('from', 'name role');

      // Send to specific user if direct message
      if (to) {
        const recipientUnit = await require('../models/Unit').findOne({ userId: to });
        if (recipientUnit?.socketId) {
          io.to(recipientUnit.socketId).emit('new_message', message);
        }
      } else {
        // Broadcast to all (command messages)
        io.emit('new_message', message);
      }

      // Confirm to sender
      socket.emit('message_sent', { messageId: message._id });

      console.log(`Message sent from ${from} to ${to || 'all'}`);
    } catch (error) {
      console.error('Send message error:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Voice call initiation
  socket.on('initiate_call', (data) => {
    const { from, to, callType } = data;
    
    // Forward call request to recipient
    io.emit('incoming_call', {
      from,
      callType,
      timestamp: new Date()
    });

    console.log(`Call initiated from ${from} to ${to}`);
  });

  // Call response
  socket.on('call_response', (data) => {
    const { from, to, accepted } = data;
    
    io.emit('call_response', {
      from,
      to,
      accepted
    });
  });
};