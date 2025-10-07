import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import {
  MyLocation as MyLocationIcon,
  PhotoCamera as PhotoCameraIcon,
  Phone as PhoneIcon,
  Send as SendIcon,
  Map as MapIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const EmergencyReport = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [emergencyId, setEmergencyId] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'medical',
    severity: 'medium',
    location: {
      latitude: 30.7333,
      longitude: 76.7794,
      address: ''
    },
    reporterName: '',
    reporterPhone: '',
    reporterEmail: '',
    photos: []
  });

  const [locationError, setLocationError] = useState('');
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);

  const steps = ['Emergency Details', 'Location', 'Contact Information', 'Review & Submit'];

  // Get current location
  const getCurrentLocation = () => {
    setLoading(true);
    setLocationError('');

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Reverse geocoding to get address
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          
          setFormData(prev => ({
            ...prev,
            location: {
              latitude,
              longitude,
              address: data.display_name || `${latitude}, ${longitude}`
            }
          }));
          setUseCurrentLocation(true);
          toast.success('Location captured successfully!');
        } catch (error) {
          setFormData(prev => ({
            ...prev,
            location: {
              latitude,
              longitude,
              address: `${latitude}, ${longitude}`
            }
          }));
          setUseCurrentLocation(true);
        }
        setLoading(false);
      },
      (error) => {
        setLocationError(error.message);
        setLoading(false);
        toast.error('Failed to get location');
      }
    );
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLocationChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value
      }
    }));
  };

  const handlePhotoUpload = (event) => {
    const files = Array.from(event.target.files);
    const photoPromises = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({
            file: file,
            preview: reader.result,
            name: file.name
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(photoPromises).then(photos => {
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, ...photos].slice(0, 5) // Max 5 photos
      }));
      toast.success(`${photos.length} photo(s) uploaded`);
    });
  };

  const validateStep = () => {
    switch (activeStep) {
      case 0: // Emergency Details
        if (!formData.title.trim()) {
          toast.error('Please provide an emergency title');
          return false;
        }
        if (!formData.description.trim()) {
          toast.error('Please provide a description');
          return false;
        }
        return true;

      case 1: // Location
        if (!formData.location.latitude || !formData.location.longitude) {
          toast.error('Please provide a location');
          return false;
        }
        return true;

      case 2: // Contact Information
        if (!formData.reporterName.trim()) {
          toast.error('Please provide your name');
          return false;
        }
        if (!formData.reporterPhone.trim()) {
          toast.error('Please provide your phone number');
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    try {
      // Create FormData for multipart upload if photos exist
      const submitData = {
        ...formData,
        photos: formData.photos.map(p => p.preview) // Send base64 for now
      };

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/emergencies/public-report`,
        submitData
      );

      setEmergencyId(response.data.emergencyId);
      toast.success('Emergency reported successfully!');
      setActiveStep(4); // Move to success step
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.response?.data?.error || 'Failed to submit emergency report');
    } finally {
      setSubmitting(false);
    }
  };

  // Map location picker
  const LocationPicker = () => {
    const map = useMapEvents({
      click: async (e) => {
        const { lat, lng } = e.latlng;
        
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );
          const data = await response.json();
          
          setFormData(prev => ({
            ...prev,
            location: {
              latitude: lat,
              longitude: lng,
              address: data.display_name || `${lat}, ${lng}`
            }
          }));
        } catch (error) {
          setFormData(prev => ({
            ...prev,
            location: {
              latitude: lat,
              longitude: lng,
              address: `${lat}, ${lng}`
            }
          }));
        }
      }
    });

    return formData.location.latitude ? (
      <Marker 
        position={[formData.location.latitude, formData.location.longitude]}
      />
    ) : null;
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0: // Emergency Details
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              What type of emergency are you reporting?
            </Typography>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Emergency Type</InputLabel>
              <Select
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
                label="Emergency Type"
              >
                <MenuItem value="medical">🏥 Medical Emergency</MenuItem>
                <MenuItem value="fire">🔥 Fire</MenuItem>
                <MenuItem value="crime">🚨 Crime/Security</MenuItem>
                <MenuItem value="accident">⚠️ Accident</MenuItem>
                <MenuItem value="disaster">💥 Natural Disaster</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Severity</InputLabel>
              <Select
                value={formData.severity}
                onChange={(e) => handleChange('severity', e.target.value)}
                label="Severity"
              >
                <MenuItem value="low">Low - Non-urgent</MenuItem>
                <MenuItem value="medium">Medium - Requires attention</MenuItem>
                <MenuItem value="high">High - Urgent</MenuItem>
                <MenuItem value="critical">Critical - Life threatening</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Brief Title"
              placeholder="e.g., Person collapsed on street"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Detailed Description"
              placeholder="Describe the emergency in detail..."
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
          </Box>
        );

      case 1: // Location
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Where is the emergency?
            </Typography>

            <Alert severity="info" sx={{ mb: 2 }}>
              Click on the map to select location or use your current location
            </Alert>

            <Button
              fullWidth
              variant="contained"
              startIcon={<MyLocationIcon />}
              onClick={getCurrentLocation}
              disabled={loading}
              sx={{ mb: 2 }}
            >
              {loading ? 'Getting Location...' : 'Use My Current Location'}
            </Button>

            {locationError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {locationError}
              </Alert>
            )}

            <Box sx={{ height: '400px', mb: 2, border: '1px solid #ccc', borderRadius: 1 }}>
              <MapContainer
                center={[formData.location.latitude, formData.location.longitude]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                <LocationPicker />
              </MapContainer>
            </Box>

            <TextField
              fullWidth
              label="Address"
              value={formData.location.address}
              onChange={(e) => handleLocationChange('address', e.target.value)}
              sx={{ mb: 1 }}
              multiline
              rows={2}
            />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Latitude"
                  type="number"
                  value={formData.location.latitude}
                  onChange={(e) => handleLocationChange('latitude', parseFloat(e.target.value))}
                  inputProps={{ step: 0.000001 }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Longitude"
                  type="number"
                  value={formData.location.longitude}
                  onChange={(e) => handleLocationChange('longitude', parseFloat(e.target.value))}
                  inputProps={{ step: 0.000001 }}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 2: // Contact Information
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Your Contact Information
            </Typography>

            <Alert severity="info" sx={{ mb: 2 }}>
              We need this information to contact you and provide updates
            </Alert>

            <TextField
              fullWidth
              label="Your Name"
              value={formData.reporterName}
              onChange={(e) => handleChange('reporterName', e.target.value)}
              sx={{ mb: 2 }}
              required
            />

            <TextField
              fullWidth
              label="Phone Number"
              type="tel"
              value={formData.reporterPhone}
              onChange={(e) => handleChange('reporterPhone', e.target.value)}
              sx={{ mb: 2 }}
              required
              placeholder="+91 98765 43210"
            />

            <TextField
              fullWidth
              label="Email Address (Optional)"
              type="email"
              value={formData.reporterEmail}
              onChange={(e) => handleChange('reporterEmail', e.target.value)}
              sx={{ mb: 2 }}
            />

            <Typography variant="subtitle2" gutterBottom sx={{ mt: 3 }}>
              Add Photos (Optional - Max 5)
            </Typography>

            <Button
              variant="outlined"
              component="label"
              startIcon={<PhotoCameraIcon />}
              fullWidth
              sx={{ mb: 2 }}
            >
              Upload Photos
              <input
                type="file"
                hidden
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
              />
            </Button>

            {formData.photos.length > 0 && (
              <Grid container spacing={1}>
                {formData.photos.map((photo, index) => (
                  <Grid item xs={4} key={index}>
                    <Card>
                      <img
                        src={photo.preview}
                        alt={`Upload ${index + 1}`}
                        style={{ width: '100%', height: '100px', objectFit: 'cover' }}
                      />
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        );

      case 3: // Review & Submit
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review Your Report
            </Typography>

            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Emergency Type
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {formData.type} - {formData.severity} severity
                </Typography>

                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                  Title
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {formData.title}
                </Typography>

                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                  Description
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {formData.description}
                </Typography>

                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                  Location
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {formData.location.address}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formData.location.latitude.toFixed(6)}, {formData.location.longitude.toFixed(6)}
                </Typography>

                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                  Contact Information
                </Typography>
                <Typography variant="body1">
                  {formData.reporterName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formData.reporterPhone}
                </Typography>
                {formData.reporterEmail && (
                  <Typography variant="body2" color="text.secondary">
                    {formData.reporterEmail}
                  </Typography>
                )}

                {formData.photos.length > 0 && (
                  <>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>
                      Photos Attached
                    </Typography>
                    <Chip label={`${formData.photos.length} photo(s)`} size="small" />
                  </>
                )}
              </CardContent>
            </Card>

            <Alert severity="warning">
              Please ensure all information is accurate. Emergency services will be dispatched based on this report.
            </Alert>
          </Box>
        );

      case 4: // Success
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircleIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Emergency Reported Successfully!
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Your emergency ID: <strong>{emergencyId}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Emergency services have been notified and will respond shortly.
              Please keep your phone nearby.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                startIcon={<PhoneIcon />}
                href={`tel:${formData.reporterPhone}`}
              >
                Call Reporter
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/track/' + emergencyId)}
              >
                Track Response
              </Button>
            </Box>

            <Button
              variant="text"
              onClick={() => window.location.reload()}
              sx={{ mt: 2 }}
            >
              Report Another Emergency
            </Button>
          </Box>
        );

      default:
        return null;
    }
  };

  if (activeStep === 4) {
    return (
      <Container maxWidth="md">
        <Box sx={{ my: 4 }}>
          <Paper elevation={3} sx={{ p: 4 }}>
            {renderStepContent()}
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" sx={{ flexGrow: 1 }}>
              🚨 Report Emergency
            </Typography>
            <Chip label="Public Access" color="primary" />
          </Box>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {renderStepContent()}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              startIcon={<ArrowBackIcon />}
            >
              Back
            </Button>

            {activeStep < 3 ? (
              <Button
                variant="contained"
                onClick={handleNext}
              >
                Next
              </Button>
            ) : (
              <Button
                variant="contained"
                color="error"
                onClick={handleSubmit}
                disabled={submitting}
                startIcon={submitting ? <CircularProgress size={20} /> : <SendIcon />}
              >
                {submitting ? 'Submitting...' : 'Submit Emergency Report'}
              </Button>
            )}
          </Box>
        </Paper>

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            For immediate life-threatening emergencies, call emergency services directly
          </Typography>
          <Button
            variant="outlined"
            color="error"
            startIcon={<PhoneIcon />}
            href="tel:112"
            sx={{ mt: 1 }}
          >
            Call 112 (Emergency)
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default EmergencyReport;