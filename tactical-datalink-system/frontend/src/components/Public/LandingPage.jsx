import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Paper
} from '@mui/material';
import {
  Report as ReportIcon,
  Search as SearchIcon,
  Login as LoginIcon,
  Dashboard as DashboardIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <Box>
      {/* Hero Section */}
      <Paper
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 8,
          mb: 6
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h2" gutterBottom fontWeight="bold">
              🚨 Tactical Data Link System
            </Typography>
            <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
              Real-time Emergency Response Coordination
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/report')}
                sx={{
                  bgcolor: 'error.main',
                  '&:hover': { bgcolor: 'error.dark' },
                  px: 4,
                  py: 1.5
                }}
                startIcon={<ReportIcon />}
              >
                Report Emergency
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/login')}
                sx={{
                  color: 'white',
                  borderColor: 'white',
                  '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
                  px: 4,
                  py: 1.5
                }}
                startIcon={<LoginIcon />}
              >
                Staff Login
              </Button>
            </Box>
          </Box>
        </Container>
      </Paper>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Typography variant="h4" align="center" gutterBottom fontWeight="bold">
          How It Works
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
          Our system connects emergency responders with people in need
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', textAlign: 'center' }}>
              <CardContent>
                <Box sx={{ fontSize: 60, mb: 2 }}>📍</Box>
                <Typography variant="h6" gutterBottom>
                  Report Emergency
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Share your location and describe the emergency. Our system instantly notifies command center.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', textAlign: 'center' }}>
              <CardContent>
                <Box sx={{ fontSize: 60, mb: 2 }}>🚑</Box>
                <Typography variant="h6" gutterBottom>
                  Units Dispatched
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Command center assigns the nearest available unit to respond to your emergency.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', textAlign: 'center' }}>
              <CardContent>
                <Box sx={{ fontSize: 60, mb: 2 }}>📊</Box>
                <Typography variant="h6" gutterBottom>
                  Track Response
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Track the status of your emergency and see units responding in real-time.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Quick Actions */}
      <Container maxWidth="md" sx={{ mb: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom align="center">
            Quick Actions
          </Typography>
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="contained"
                color="error"
                size="large"
                startIcon={<ReportIcon />}
                onClick={() => navigate('/report')}
              >
                Report New Emergency
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="outlined"
                color="primary"
                size="large"
                startIcon={<SearchIcon />}
                onClick={() => {
                  const id = prompt('Enter Emergency ID to track:');
                  if (id) navigate(`/track/${id}`);
                }}
              >
                Track Emergency
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="outlined"
                size="large"
                startIcon={<LoginIcon />}
                onClick={() => navigate('/login')}
              >
                Login (Staff)
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="outlined"
                color="error"
                size="large"
                startIcon={<PhoneIcon />}
                href="tel:112"
              >
                Call 112 (Emergency)
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Container>

      {/* Statistics Section */}
      <Box sx={{ bgcolor: 'background.default', py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} sx={{ textAlign: 'center' }}>
            <Grid item xs={12} sm={3}>
              <Typography variant="h3" color="primary" fontWeight="bold">
                24/7
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Always Available
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography variant="h3" color="primary" fontWeight="bold">
                &lt;5 min
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avg Response Time
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography variant="h3" color="primary" fontWeight="bold">
                100%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Coverage Area
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography variant="h3" color="primary" fontWeight="bold">
                Real-time
              </Typography>
              <Typography variant="body2" color="text.secondary">
                GPS Tracking
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 4, mt: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Tactical Data Link System
              </Typography>
              <Typography variant="body2">
                Modern emergency response coordination system for faster and more efficient emergency management.
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="h6" gutterBottom>
                Quick Links
              </Typography>
              <Typography variant="body2" sx={{ cursor: 'pointer' }} onClick={() => navigate('/report')}>
                Report Emergency
              </Typography>
              <Typography variant="body2" sx={{ cursor: 'pointer' }} onClick={() => navigate('/login')}>
                Staff Login
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="h6" gutterBottom>
                Emergency Contact
              </Typography>
              <Typography variant="body2">
                Phone: 112 (Emergency)
              </Typography>
              <Typography variant="body2">
                Email: emergency@tdls.com
              </Typography>
            </Grid>
          </Grid>
          <Box sx={{ textAlign: 'center', mt: 4, pt: 2, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
            <Typography variant="body2">
              © 2024 Tactical Data Link System. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;