import React, { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { useGeolocation } from '../../hooks/useGeolocation';
import TacticalMapContainer from '../Map/MapContainer';
import AssignedEmergency from './AssignedEmergency';
import MessagePanel from '../Communication/MessagePanel';
import {
  Box,
  Paper,
  Typography,
  AppBar,
  Toolbar,
  Button,
  Chip,
  IconButton,
  Grid,
  Card,
  CardContent,
  Alert
} from '@mui/material';
import {
  Logout as LogoutIcon,
  MyLocation as MyLocationIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import axios from 'axios';

const NodeDashboard = () => {
  const { user, logout } = useAuth();
  const { units, emergencies, connected, updateEmergencyStatus } = useSocket();
  const { position, error: geoError } = useGeolocation(true, 10000); // Update every 10 seconds
  const [myUnit, setMyUnit] = useState(null);
  const [assignedEmergency, setAssignedEmergency] = useState(null);
  const [nearbyResources, setNearbyResources] = useState([]);

  useEffect(() => {
    // Get own unit data
    const fetchUnitData = async () => {
      try {
        if (user?.unit?.unitId) {
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/api/units/${user.unit.unitId}`
          );
          setMyUnit(response.data);

          if (response.data.assignedEmergency) {
            const emergencyResponse = await axios.get(
              `${process.env.REACT_APP_API_URL}/api/emergencies/${response.data.assignedEmergency.emergencyId}`
            );
            setAssignedEmergency(emergencyResponse.data);
          }
        }
      } catch (error) {
        console.error('Error fetching unit data:', error);
      }
    };

    fetchUnitData();
  }, [user]);

  useEffect(() => {
    // Listen for nearby resources updates (from socket)
    // This would be set up in the SocketContext
  }, []);

  const handleStatusUpdate = async (status) => {
    try {
      if (myUnit) {
        await axios.patch(
          `${process.env.REACT_APP_API_URL}/api/units/${myUnit.unitId}/status`,
          { status }
        );
      }
    } catch (error) {
      console.error('Status update error:', error);
    }
  };

  const handleEmergencyUpdate = (status, notes) => {
    if (assignedEmergency) {
      updateEmergencyStatus(assignedEmergency.emergencyId, status, notes);
      
      if (status === 'resolved') {
        setAssignedEmergency(null);
        handleStatusUpdate('available');
      }
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* App Bar */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Field Unit - {myUnit?.unitId || user?.name}
          </Typography>
          <Chip
            label={connected ? 'Connected' : 'Disconnected'}
            color={connected ? 'success' : 'error'}
            sx={{ mr: 2 }}
          />
          <Chip
            label={myUnit?.status || 'Unknown'}
            color={myUnit?.status === 'available' ? 'success' : 'warning'}
            sx={{ mr: 2 }}
          />
          <IconButton color="inherit" onClick={logout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        {/* Left Panel - Unit Info */}
        <Paper sx={{ width: 350, overflow: 'auto', p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Unit Information
          </Typography>

          {myUnit && (
            <Box>
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Unit ID
                  </Typography>
                  <Typography variant="h6">{myUnit.unitId}</Typography>

                  <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                    Unit Type
                  </Typography>
                  <Typography>{myUnit.unitType}</Typography>

                  <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                    Status
                  </Typography>
                  <Chip
                    label={myUnit.status}
                    color={myUnit.status === 'available' ? 'success' : 'warning'}
                  />
                </CardContent>
              </Card>

              {myUnit.resources && (
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Resources
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Fuel
                        </Typography>
                        <Typography variant="h6">
                          {myUnit.resources.fuel}%
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Personnel
                        </Typography>
                        <Typography variant="h6">
                          {myUnit.resources.personnel}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              )}

              {position && (
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      Current Location
                    </Typography>
                    <Typography variant="body2">
                      Lat: {position.latitude.toFixed(6)}
                    </Typography>
                    <Typography variant="body2">
                      Lng: {position.longitude.toFixed(6)}
                    </Typography>
                    <Typography variant="caption" color="success.main" sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <MyLocationIcon fontSize="small" sx={{ mr: 0.5 }} />
                      GPS tracking active
                    </Typography>
                  </CardContent>
                </Card>
              )}

              {geoError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  GPS Error: {geoError}
                </Alert>
              )}

              <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
                <Button
                  variant="outlined"
                  color="success"
                  onClick={() => handleStatusUpdate('available')}
                  disabled={myUnit.status === 'available'}
                  fullWidth
                >
                  Mark Available
                </Button>
                <Button
                  variant="outlined"
                  color="warning"
                  onClick={() => handleStatusUpdate('busy')}
                  disabled={myUnit.status === 'busy'}
                  fullWidth
                >
                  Mark Busy
                </Button>
              </Box>
            </Box>
          )}
        </Paper>

        {/* Center - Map */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ flexGrow: 1 }}>
            <TacticalMapContainer
              units={units}
              emergencies={emergencies}
              center={position ? [position.latitude, position.longitude] : undefined}
              showUserLocation={true}
              userPosition={position}
            />
          </Box>

          {/* Bottom Panel - Assignment */}
          {assignedEmergency && (
            <Paper sx={{ height: '200px', overflow: 'auto' }}>
              <AssignedEmergency
                emergency={assignedEmergency}
                onStatusUpdate={handleEmergencyUpdate}
                nearbyResources={nearbyResources}
              />
            </Paper>
          )}

          {!assignedEmergency && (
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography color="text.secondary">
                No active assignment. Waiting for command...
              </Typography>
            </Paper>
          )}
        </Box>

        {/* Right Panel - Communications */}
        <Paper sx={{ width: 350, overflow: 'auto' }}>
          <MessagePanel />
        </Paper>
      </Box>
    </Box>
  );
};

export default NodeDashboard;