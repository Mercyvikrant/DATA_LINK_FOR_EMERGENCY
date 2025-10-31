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
          },
          isOnline: true
        },
        { new: true }
      ).populate('userId', 'name');

      if (unit) {
        // Broadcast position to all clients
        io.emit('position_updated', {
          _id: unit._id,
          unitId: unit.unitId,
          unitType: unit.unitType,
          position: unit.position,
          status: unit.status,
          isOnline: unit.isOnline,
          resources: unit.resources
        });

        console.log(`📍 Position updated for ${unitId}: [${latitude}, ${longitude}]`);
      } else {
        console.log(`❌ Unit ${unitId} not found for position update`);
      }
    } catch (error) {
      console.error('Position update error:', error);
      socket.emit('error', { message: 'Failed to update position' });
    }
  });

  // Request all unit positions (for command center)
  socket.on('request_all_positions', async () => {
    try {
      console.log('📊 Fetching all units from database...');
      
      const units = await Unit.find({})
        .populate('userId', 'name email')
        .populate('assignedEmergency')
        .lean();
      
      console.log(`✅ Found ${units.length} units in database`);
      
      // Send all units to the requesting client
      socket.emit('all_positions', units);
      
      console.log('📤 Sent all positions to client');
    } catch (error) {
      console.error('❌ Error fetching positions:', error);
      socket.emit('error', { message: 'Failed to fetch positions' });
    }
  });
};