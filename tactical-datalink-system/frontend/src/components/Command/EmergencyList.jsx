import React, { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Chip,
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DoneIcon from '@mui/icons-material/Done';
import PendingIcon from '@mui/icons-material/Pending';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

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

  // Calculate distance between two points (Haversine formula)
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

    // Compute distances for all available units
    const distances = {};
    units
      .filter((u) => u.status === 'available')
      .forEach((unit) => {
        const distance = calculateDistance(
          emergency.location.latitude,
          emergency.location.longitude,
          unit.position.latitude,
          unit.position.longitude
        );
        distances[unit.unitId] = distance.toFixed(2);
      });

    setUnitDistances(distances);
    setAssignDialogOpen(true);
  };

  const availableUnits = units.filter((u) => u.status === 'available');

  // Sort units by distance (closest first)
  const sortedUnits = [...availableUnits].sort((a, b) => {
    const distA = parseFloat(unitDistances[a.unitId] || 999);
    const distB = parseFloat(unitDistances[b.unitId] || 999);
    return distA - distB;
  });

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Active Emergencies ({emergencies.filter((e) => e.status !== 'resolved').length})
      </Typography>

      <List>
        {emergencies.map((emergency) => (
          <ListItem
            key={emergency.id}
            sx={{
              border: '1px solid #ddd',
              borderRadius: 2,
              mb: 1,
              bgcolor:
                selectedEmergency && selectedEmergency.id === emergency.id
                  ? 'action.selected'
                  : 'background.paper',
            }}
            onClick={() => onEmergencySelect(emergency)}
            secondaryAction={
              <ListItemSecondaryAction>
                {emergency.status === 'pending' && (
                  <IconButton color="primary" onClick={() => handleAssignClick(emergency)}>
                    <AssignmentIcon />
                  </IconButton>
                )}
                {emergency.status === 'assigned' && (
                  <IconButton
                    color="warning"
                    onClick={() => onStatusChange(emergency, 'in-progress')}
                  >
                    <DirectionsRunIcon />
                  </IconButton>
                )}
                {emergency.status === 'in-progress' && (
                  <IconButton
                    color="success"
                    onClick={() => onStatusChange(emergency, 'resolved')}
                  >
                    <CheckCircleIcon />
                  </IconButton>
                )}
              </ListItemSecondaryAction>
            }
          >
            <ListItemText
              primary={emergency.title}
              secondary={
                <>
                  {emergency.description}
                  <br />
                  <Chip
                    size="small"
                    label={emergency.status.toUpperCase()}
                    color={
                      emergency.status === 'resolved'
                        ? 'success'
                        : emergency.status === 'in-progress'
                        ? 'warning'
                        : emergency.status === 'assigned'
                        ? 'info'
                        : 'default'
                    }
                    sx={{ mt: 0.5 }}
                  />
                </>
              }
            />
          </ListItem>
        ))}
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
                Location: {selectedEmergency.location.latitude.toFixed(4)}, {selectedEmergency.location.longitude.toFixed(4)}
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
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <span>{unit.unitId} - {unit.unitType}</span>
                    <Chip
                      label={`${unitDistances[unit.unitId] || 'N/A'} km`}
                      size="small"
                      color={parseFloat(unitDistances[unit.unitId]) < 2 ? 'success' : 'default'}
                    />
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {selectedUnit && unitDistances[selectedUnit] && (
            <Box sx={{ p: 2, bgcolor: 'info.light', borderRadius: 1, mb: 2 }}>
              <Typography variant="body2">
                <strong>Distance:</strong> {unitDistances[selectedUnit]} km
              </Typography>
              <Typography variant="body2">
                <strong>Estimated Time:</strong>{' '}
                {Math.round((parseFloat(unitDistances[selectedUnit]) / 40) * 60)} minutes
              </Typography>
            </Box>
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
            <Typography color="error" sx={{ mt: 2 }}>
              No available units to assign
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              if (selectedEmergency && selectedUnit) {
                const unit = units.find((u) => u.unitId === selectedUnit);
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
