const Emergency = require('../models/Emergency');
const Unit = require('../models/Unit');

module.exports = (io, socket) => {
  // Report new emergency
  socket.on('report_emergency', async (data) => {
    try {
      const emergencyId = `EMG-${Date.now()}`;
      
      const emergency = new Emergency({
        emergencyId,
        ...data,
        status: 'pending'
      });

      await emergency.save();

      // Notify command center immediately
      io.emit('new_emergency', emergency);

      console.log(`New emergency reported: ${emergencyId}`);
    } catch (error) {
      console.error('Emergency report error:', error);
      socket.emit('error', { message: 'Failed to report emergency' });
    }
  });

  // Assign unit to emergency (command only)
  socket.on('assign_unit', async (data) => {
    try {
      const { emergencyId, unitId, role } = data;

      // Find emergency and unit
      const emergency = await Emergency.findOne({ emergencyId });
      const unit = await Unit.findOne({ unitId });

      if (!emergency || !unit) {
        throw new Error('Emergency or Unit not found');
      }

      // Update emergency with assigned unit
      emergency.assignedUnits.push({
        unit: unit._id,
        role: role || 'primary'
      });
      emergency.status = 'assigned';
      await emergency.save();

      // Update unit status
      unit.status = 'busy';
      unit.assignedEmergency = emergency._id;
      await unit.save();

      // Notify the assigned unit
      if (unit.socketId) {
        io.to(unit.socketId).emit('emergency_assigned', {
          emergency: emergency,
          role: role
        });
      }

      // Notify command center
      io.emit('unit_assigned', {
        emergencyId,
        unitId,
        role
      });

      // Send nearby resources to assigned unit
      const nearbyUnits = await findNearbyUnits(
        emergency.location.latitude,
        emergency.location.longitude,
        unit._id
      );

      if (unit.socketId) {
        io.to(unit.socketId).emit('nearby_resources', nearbyUnits);
      }

      console.log(`Unit ${unitId} assigned to ${emergencyId}`);
    } catch (error) {
      console.error('Unit assignment error:', error);
      socket.emit('error', { message: 'Failed to assign unit' });
    }
  });

  // Update emergency status
  socket.on('update_emergency_status', async (data) => {
    try {
      const { emergencyId, status, notes } = data;

      const emergency = await Emergency.findOne({ emergencyId });
      
      if (!emergency) {
        throw new Error('Emergency not found');
      }

      emergency.status = status;
      if (notes) {
        emergency.notes.push(notes);
      }

      if (status === 'resolved') {
        emergency.resolvedAt = new Date();
        
        // Free up assigned units
        for (const assignedUnit of emergency.assignedUnits) {
          await Unit.findByIdAndUpdate(assignedUnit.unit, {
            status: 'available',
            assignedEmergency: null
          });
        }
      }

      await emergency.save();

      // Broadcast status update
      io.emit('emergency_status_updated', {
        emergencyId,
        status,
        resolvedAt: emergency.resolvedAt
      });

      console.log(`Emergency ${emergencyId} status updated to ${status}`);
    } catch (error) {
      console.error('Emergency status update error:', error);
      socket.emit('error', { message: 'Failed to update emergency status' });
    }
  });
};

// Helper function to find nearby units
async function findNearbyUnits(latitude, longitude, excludeUnitId, radiusKm = 5) {
  try {
    const units = await Unit.find({
      _id: { $ne: excludeUnitId },
      status: 'available',
      isOnline: true
    });

    const nearbyUnits = units.filter(unit => {
      const distance = calculateDistance(
        latitude,
        longitude,
        unit.position.latitude,
        unit.position.longitude
      );
      return distance <= radiusKm;
    }).map(unit => ({
      unitId: unit.unitId,
      unitType: unit.unitType,
      position: unit.position,
      distance: calculateDistance(
        latitude,
        longitude,
        unit.position.latitude,
        unit.position.longitude
      ).toFixed(2)
    }));

    return nearbyUnits;
  } catch (error) {
    console.error('Error finding nearby units:', error);
    return [];
  }
}

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}