import React, { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
 
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,

  InputLabel,
  FormControl,

  Divider,
  Alert
} from '@mui/material';
import { Warning, CheckCircle } from '@mui/icons-material';

const EmergencyList = ({
  emergencies,
  units,
  selectedEmergency,
  onEmergencySelect,
  onAssignUnit,
  onStatusChange
}) => {
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState('');
  const [assignmentRole, setAssignmentRole] = useState('primary');
  const [unitDistances, setUnitDistances] = useState({});

  const getSeverityColor = (severity) => {
    const colors = {
      low: 'success',
      medium: 'warning',
      high: 'error',
      critical: 'error'
    };
    return colors[severity] || 'default';
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      assigned: 'info',
      'in-progress': 'primary',
      resolved: 'success',
      cancelled: 'default'
    };
    return colors[status] || 'default';
  };

  // Calculate distance between two points
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleAssignClick = (emergency) => {
    onEmergencySelect(emergency);
    
    // Calculate distances for all available units
    const distances = {};
    units.filter(u => u.status === 'available' && u.position?.latitude && u.position?.longitude).forEach(unit => {
      const distance = calculateDistance(
        emergency.location.latitude,
        emergency.location.longitude,
        unit.position.latitude,
        unit.position.longitude
      );
      distances[unit.unitId] = distance.toFixed(2);
    });
    
    console.log('📏 Calculated distances:', distances);
    setUnitDistances(distances);
    setAssignDialogOpen(true);
  };

  const availableUnits = units.filter(u => u.status === 'available');

  // Sort units by distance (closest first)
  const sortedUnits = [...availableUnits].sort((a, b) => {
    const distA = parseFloat(unitDistances[a.unitId] || 999);
    const distB = parseFloat(unitDistances[b.unitId] || 999);
    return distA - distB;
  });

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Active Emergencies ({emergencies.filter(e => e.status !== 'resolved').length})
      </Typography>

      <List>
        {emergencies
          .filter(e => e.status !== 'resolved' && e.status !== 'cancelled')
          .map((emergency) => (
            <React.Fragment key={emergency.emergencyId || emergency._id}>
              <ListItem
                sx={{
                  border: selectedEmergency?.emergencyId === emergency.emergencyId ? '2px solid blue' : 'none',
                  borderRadius: 1,
                  mb: 1,
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: 'action.hover' }
                }}
                onClick={() => onEmergencySelect(emergency)}
              >
                <Box sx={{ width: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {emergency.title}
                    </Typography>
                    <Box>
                      <Chip
                        label={emergency.severity}
                        color={getSeverityColor(emergency.severity)}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Chip
                        label={emergency.status}
                        color={getStatusColor(emergency.status)}
                        size="small"
                      />
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {emergency.description}
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      ID: {emergency.emergencyId} | Type: {emergency.type}
                    </Typography>
                    <Box>
                      {emergency.status === 'pending' && (
                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAssignClick(emergency);
                          }}
                          disabled={availableUnits.length === 0}
                        >
                          Assign Unit
                        </Button>
                      )}
                      {emergency.status === 'assigned' && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={(e) => {
                            e.stopPropagation();
                            onStatusChange(emergency.emergencyId, 'in-progress');
                          }}
                        >
                          Mark In Progress
                        </Button>
                      )}
                      {emergency.status === 'in-progress' && (
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          startIcon={<CheckCircle />}
                          onClick={(e) => {
                            e.stopPropagation();
                            onStatusChange(emergency.emergencyId, 'resolved');
                          }}
                        >
                          Resolve
                        </Button>
                      )}
                    </Box>
                  </Box>

                  {emergency.assignedUnits && emergency.assignedUnits.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" color="primary">
                        Assigned Units: {emergency.assignedUnits.length}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}

        {emergencies.filter(e => e.status !== 'resolved' && e.status !== 'cancelled').length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            No active emergencies
          </Typography>
        )}
      </List>

      {/* Assign Unit Dialog */}
      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Unit to Emergency</DialogTitle>
        <DialogContent>
          {selectedEmergency && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Emergency: {selectedEmergency.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedEmergency.description}
              </Typography>
              <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                📍 Location: {selectedEmergency.location.latitude.toFixed(4)}, {selectedEmergency.location.longitude.toFixed(4)}
              </Typography>
            </Box>
          )}

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Select Unit (Sorted by Distance)</InputLabel>
            <Select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              label="Select Unit (Sorted by Distance)"
            >
              {sortedUnits.map((unit) => (
                <MenuItem key={unit.unitId} value={unit.unitId}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <span>{unit.unitId} - {unit.unitType}</span>
                    <Chip 
                      label={`${unitDistances[unit.unitId] || 'N/A'} km`} 
                      size="small" 
                      color={parseFloat(unitDistances[unit.unitId]) < 2 ? 'success' : parseFloat(unitDistances[unit.unitId]) < 5 ? 'warning' : 'default'}
                    />
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectedUnit && unitDistances[selectedUnit] && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>🚗 Distance:</strong> {unitDistances[selectedUnit]} km
              </Typography>
              <Typography variant="body2">
                <strong>⏱️ Estimated Time:</strong> {Math.round((parseFloat(unitDistances[selectedUnit]) / 40) * 60)} minutes (at 40 km/h avg)
              </Typography>
            </Alert>
          )}

          <FormControl fullWidth>
            <InputLabel>Assignment Role</InputLabel>
            <Select
              value={assignmentRole}
              onChange={(e) => setAssignmentRole(e.target.value)}
              label="Assignment Role"
            >
              <MenuItem value="primary">Primary Response</MenuItem>
              <MenuItem value="support">Support/Backup</MenuItem>
            </Select>
          </FormControl>

          {availableUnits.length === 0 && (
            <Alert severity="error" sx={{ mt: 2 }}>
              No available units to assign
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              if (selectedEmergency && selectedUnit) {
                const unit = units.find(u => u.unitId === selectedUnit);
                onAssignUnit(selectedEmergency, unit, assignmentRole);
                setAssignDialogOpen(false);
                setSelectedUnit('');
                setAssignmentRole('primary');
              }
            }}
            variant="contained"
            disabled={!selectedUnit}
          >
            Assign Unit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmergencyList;