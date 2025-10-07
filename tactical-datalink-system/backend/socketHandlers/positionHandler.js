const Unit = require('../models/Unit');

module.exports = (io, socket) => {
  // Update unit position
  socket.on('update_position', async (data) => {
    try {
      const { unitId, latitude, longitude } = data;

      const unit = await Unit.findOneAndUpdate(
        { unitId },
        {
          position: {
            latitude,
            longitude,
            lastUpdated: new Date()
          }
        },
        { new: true }
      );

      // Broadcast position to all connected clients (especially command)
      io.emit('position_updated', {
        unitId: unit.unitId,
        position: unit.position,
        status: unit.status
      });

      console.log(`Position updated for ${unitId}`);
    } catch (error) {
      console.error('Position update error:', error);
      socket.emit('error', { message: 'Failed to update position' });
    }
  });

  // Request all unit positions (for command center)
  socket.on('request_all_positions', async () => {
    try {
      const units = await Unit.find({ isOnline: true });
      socket.emit('all_positions', units);
    } catch (error) {
      console.error('Error fetching positions:', error);
    }
  });
};