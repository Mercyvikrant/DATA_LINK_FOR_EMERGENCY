import React, { useState } from 'react';
import { Polyline } from 'react-leaflet';
import {
  Box,
  Typography,
  Chip,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert
} from '@mui/material';
import {
  CheckCircle,
  Warning
} from '@mui/icons-material';

const AssignedEmergency = ({ emergency, onStatusUpdate, nearbyResources = [], routeInfo, distance, eta }) => {
  const [notes, setNotes] = useState('');

  const getSeverityColor = (severity) => {
    const colors = {
      low: 'success',
      medium: 'warning',
      high: 'error',
      critical: 'error'
    };
    return colors[severity] || 'default';
  };

  const handleStatusUpdate = (status) => {
    onStatusUpdate(status, notes);
    setNotes('');
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Assigned Emergency
        </Typography>
        <Chip
          label={emergency.severity}
          color={getSeverityColor(emergency.severity)}
          icon={<Warning />}
        />
      </Box>

      {/* Emergency Details */}
      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="subtitle2">{emergency.title}</Typography>
        <Typography variant="body2">{emergency.description}</Typography>
        <Typography variant="caption">
          ID: {emergency.emergencyId} | Type: {emergency.type}
        </Typography>
      </Alert>

      {/* Navigation Info (New Feature) */}
      {distance && eta && (
        <Box sx={{ mb: 2, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            📍 Navigation Info
          </Typography>
          <Typography variant="body2">
            <strong>Distance:</strong> {distance} km
          </Typography>
          <Typography variant="body2">
            <strong>Estimated Time:</strong> {eta} minutes
          </Typography>
          <Button
            variant="outlined"
            size="small"
            sx={{ mt: 1 }}
            onClick={() => {
              window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${emergency.location.latitude},${emergency.location.longitude}`,
                '_blank'
              );
            }}
          >
            Open in Google Maps
          </Button>
        </Box>
      )}

      {/* Location Info */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Location
        </Typography>
        <Typography variant="body2">
          Lat: {emergency.location.latitude.toFixed(6)}, Lng: {emergency.location.longitude.toFixed(6)}
        </Typography>
        {emergency.location.address && (
          <Typography variant="body2" color="text.secondary">
            {emergency.location.address}
          </Typography>
        )}
      </Box>

      {/* Nearby Resources */}
      {nearbyResources.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Nearby Resources
          </Typography>
          <List dense>
            {nearbyResources.map((resource, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={`${resource.unitId} (${resource.unitType})`}
                  secondary={`Distance: ${resource.distance} km`}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      <Divider sx={{ my: 2 }} />

      {/* Notes and Status Controls */}
      <Box>
        <TextField
          fullWidth
          multiline
          rows={2}
          label="Status Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes about the situation..."
          sx={{ mb: 2 }}
        />

        <Box sx={{ display: 'flex', gap: 1 }}>
          {emergency.status === 'assigned' && (
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={() => handleStatusUpdate('in-progress')}
            >
              Start Response
            </Button>
          )}

          {emergency.status === 'in-progress' && (
            <Button
              fullWidth
              variant="contained"
              color="success"
              startIcon={<CheckCircle />}
              onClick={() => handleStatusUpdate('resolved')}
            >
              Mark Resolved
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

/* ✅ Route Polyline Component (New Feature)
   Use this in your Map component to visualize path */
export const RoutePolyline = ({ from, to }) => {
  if (!from || !to) return null;

  const positions = [
    [from.lat, from.lng],
    [to.lat, to.lng]
  ];

  return (
    <Polyline
      positions={positions}
      color="blue"
      weight={3}
      opacity={0.7}
      dashArray="10, 10"
    />
  );
};

export default AssignedEmergency;
