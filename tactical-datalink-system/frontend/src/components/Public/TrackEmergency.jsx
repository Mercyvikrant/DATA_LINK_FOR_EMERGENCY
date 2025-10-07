import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import {
  Container,
  Box,
  Paper,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  Card,
  CardContent,
  Grid,
  Button
} from '@mui/material';
import {
  CheckCircle,
  HourglassEmpty,
  LocalShipping,
  Phone
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

const TrackEmergency = () => {
  const { emergencyId } = useParams();
  const [emergency, setEmergency] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assignedUnits, setAssignedUnits] = useState([]);

  useEffect(() => {
    const fetchEmergency = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/emergencies/${emergencyId}`
        );
        setEmergency(response.data);
        
        if (response.data.assignedUnits) {
          // Fetch unit details
          const unitPromises = response.data.assignedUnits.map(async (au) => {
            const unitResponse = await axios.get(
              `${process.env.REACT_APP_API_URL}/api/units/${au.unit.unitId}`
            );
            return unitResponse.data;
          });
          const units = await Promise.all(unitPromises);
          setAssignedUnits(units);
        }
      } catch (err) {
        setError('Emergency not found or invalid ID');
      } finally {
        setLoading(false);
      }
    };

    fetchEmergency();

    // Set up real-time updates
    const socket = io(process.env.REACT_APP_SOCKET_URL);
    
    socket.on('emergency_status_updated', (data) => {
      if (data.emergencyId === emergencyId) {
        setEmergency(prev => ({ ...prev, status: data.status }));
      }
    });

    socket.on('unit_assigned', (data) => {
      if (data.emergencyId === emergencyId) {
        fetchEmergency(); // Refresh data
      }
    });

    return () => socket.close();
  }, [emergencyId]);

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

  const getStatusIcon = (status) => {
    const icons = {
      pending: <HourglassEmpty />,
      assigned: <LocalShipping />,
      'in-progress': <LocalShipping />,
      resolved: <CheckCircle />
    };
    return icons[status] || <HourglassEmpty />;
  };

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !emergency) {
    return (
      <Container>
        <Box sx={{ my: 4 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4">
              Track Emergency
            </Typography>
            <Chip
              label={emergency.status}
              color={getStatusColor(emergency.status)}
              icon={getStatusIcon(emergency.status)}
            />
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {emergency.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Emergency ID: {emergency.emergencyId}
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 2 }}>
                    {emergency.description}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Chip label={emergency.type} size="small" sx={{ mr: 1 }} />
                    <Chip label={emergency.severity} color="error" size="small" />
                  </Box>
                </CardContent>
              </Card>

              {/* Map */}
              <Box sx={{ height: '400px', mb: 3 }}>
                <MapContainer
                  center={[emergency.location.latitude, emergency.location.longitude]}
                  zoom={14}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[emergency.location.latitude, emergency.location.longitude]}>
                    <Popup>Emergency Location</Popup>
                  </Marker>
                  {assignedUnits.map((unit) => (
                    <Marker
                      key={unit._id}
                      position={[unit.position.latitude, unit.position.longitude]}
                    >
                      <Popup>{unit.unitId} - Responding</Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom>
                Response Timeline
              </Typography>
              
              <Timeline>
                <TimelineItem>
                  <TimelineSeparator>
                    <TimelineDot color="primary" />
                    <TimelineConnector />
                  </TimelineSeparator>
                  <TimelineContent>
                    <Typography variant="body2" fontWeight="bold">
                      Emergency Reported
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(emergency.createdAt).toLocaleString()}
                    </Typography>
                  </TimelineContent>
                </TimelineItem>

                {emergency.status !== 'pending' && (
                  <TimelineItem>
                    <TimelineSeparator>
                      <TimelineDot color="info" />
                      {emergency.status !== 'assigned' && <TimelineConnector />}
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography variant="body2" fontWeight="bold">
                        Unit Assigned
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {assignedUnits.length} unit(s) dispatched
                      </Typography>
                    </TimelineContent>
                  </TimelineItem>
                )}

                {emergency.status === 'in-progress' && (
                  <TimelineItem>
                    <TimelineSeparator>
                      <TimelineDot color="warning" />
                      <TimelineConnector />
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography variant="body2" fontWeight="bold">
                        Response In Progress
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Units on scene
                      </Typography>
                    </TimelineContent>
                  </TimelineItem>
                )}

                {emergency.status === 'resolved' && (
                  <TimelineItem>
                    <TimelineSeparator>
                      <TimelineDot color="success" />
                    </TimelineSeparator>
                    <TimelineContent>
                      <Typography variant="body2" fontWeight="bold">
                        Emergency Resolved
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {emergency.resolvedAt && new Date(emergency.resolvedAt).toLocaleString()}
                      </Typography>
                    </TimelineContent>
                  </TimelineItem>
                )}
              </Timeline>

              {assignedUnits.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Responding Units
                  </Typography>
                  {assignedUnits.map((unit) => (
                    <Card key={unit._id} sx={{ mb: 1 }}>
                      <CardContent sx={{ py: 1 }}>
                        <Typography variant="body2">
                          {unit.unitId} - {unit.unitType}
                        </Typography>
                        <Chip label={unit.status} size="small" color="warning" />
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}

              <Button
                fullWidth
                variant="outlined"
                startIcon={<Phone />}
                href="tel:112"
                sx={{ mt: 2 }}
              >
                Call Emergency Services
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
};

export default TrackEmergency;