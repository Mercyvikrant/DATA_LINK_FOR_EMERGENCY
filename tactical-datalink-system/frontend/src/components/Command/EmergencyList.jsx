import React, { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Typography,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider
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

  const handleAssignClick = (emergency) => {
    onEmergencySelect(emergency);
    setAssignDialogOpen(true);
  };

  const handleAssignConfirm = () => {
    if (selectedEmergency && selectedUnit) {
      const unit = units.find(u => u.unitId === selectedUnit);
      onAssignUnit(selectedEmergency, unit, assignmentRole);
      setAssignDialogOpen(false);
      setSelectedUnit('');
      setAssignmentRole('primary');
    }
  };

  const availableUnits = units.filter(u => u.status === 'available');

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
            </Box>
          )}

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Select Unit</InputLabel>
            <Select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              label="Select Unit"
            >
              {availableUnits.map((unit) => (
                <MenuItem key={unit.unitId} value={unit.unitId}>
                  {unit.unitId} - {unit.unitType} ({unit.status})
                </MenuItem>
              ))}
            </Select>
          </FormControl>

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
            onClick={handleAssignConfirm}
            variant="contained"
            disabled={!selectedUnit}
          >
            Assign
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmergencyList;