import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  Paper
} from '@mui/material';
import {
  Menu as MenuIcon,
  Report as ReportIcon,
  Search as SearchIcon,
  Login as LoginIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';

const drawerWidth = 240;

const LandingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const menuItems = [
    { icon: <ReportIcon />, text: 'Report Emergency', path: '/report' },
    { icon: <SearchIcon />, text: 'Track Emergency', path: '/track' },
    { icon: <LoginIcon />, text: 'Staff Login', path: '/login' },
    { icon: <PhoneIcon />, text: 'Call 112 (Emergency)', path: 'tel:112', external: true }
  ];

  const drawer = (
    <Box sx={{ bgcolor: '#1a237e', color: 'white', height: '100%', p: 2 }}>
      <Typography variant="h6" align="center" sx={{ mb: 3, fontWeight: 'bold' }}>
        🚨 Tactical Data Link
      </Typography>

      <List>
        {menuItems.map((item, index) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <ListItem disablePadding key={index} sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => {
                  if (item.external) {
                    window.location.href = item.path;
                  } else if (item.path === '/track') {
                    const id = prompt('Enter Emergency ID to track:');
                    if (id) navigate(`/track/${id}`);
                  } else {
                    navigate(item.path);
                  }
                }}
                sx={{
                  borderRadius: '30px',
                  transition: 'all 0.3s ease',
                  bgcolor: isActive ? 'rgba(255, 255, 255, 0.25)' : 'transparent',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    transform: 'translateX(5px)',
                    borderRadius: '50px',
                  },
                  '&:active': {
                    bgcolor: 'rgba(255, 255, 255, 0.3)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <ListItem sx={{ mt: 4 }}>
        <Typography
          variant="body2"
          color="rgba(255,255,255,0.6)"
          align="center"
          sx={{ width: '100%' }}
        >
          Version 1.0.0
        </Typography>
      </ListItem>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar for Mobile */}
      <AppBar position="fixed" sx={{ display: { md: 'none' }, bgcolor: '#1a237e' }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={handleDrawerToggle}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            Tactical Data Link System
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { width: drawerWidth }
          }}
        >
          {drawer}
        </Drawer>

        {/* Permanent Drawer for Desktop */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' }
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: { xs: 7, md: 0 } }}>
        {/* Hero Section */}
        <Paper
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            py: { xs: 6, md: 8 },
            mb: 6,
            borderRadius: 3,
            boxShadow: 4,
            textAlign: 'center',
          }}
        >
          <Container maxWidth="md">
            <Typography variant="h3" gutterBottom fontWeight="bold">
              🚨 Tactical Data Link System
            </Typography>
            <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
              Real-time Emergency Response Coordination
            </Typography>
          </Container>
        </Paper>

        {/* Features Section */}
        <Container maxWidth="lg" sx={{ mb: 8 }}>
          <Typography variant="h4" align="center" gutterBottom fontWeight="bold">
            How It Works
          </Typography>
          <Grid container spacing={4}>
            {[
              { icon: '📍', title: 'Report Emergency', text: 'Share your location and describe the emergency.' },
              { icon: '🚑', title: 'Units Dispatched', text: 'Nearest available units are assigned instantly.' },
              { icon: '📊', title: 'Track Response', text: 'View live status and unit locations in real-time.' }
            ].map((item, i) => (
              <Grid item xs={12} md={4} key={i}>
                <Card
                  sx={{
                    height: '100%',
                    textAlign: 'center',
                    transition: '0.3s',
                    '&:hover': { transform: 'translateY(-5px)', boxShadow: 6 },
                  }}
                >
                  <CardContent>
                    <Box sx={{ fontSize: 60, mb: 2 }}>{item.icon}</Box>
                    <Typography variant="h6" gutterBottom>{item.title}</Typography>
                    <Typography variant="body2" color="text.secondary">{item.text}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>

        {/* Statistics Section */}
        <Box sx={{ bgcolor: 'background.default', py: 6, borderRadius: 3 }}>
          <Container maxWidth="lg">
            <Grid container spacing={4} sx={{ textAlign: 'center' }}>
              {[
                { num: '24/7', text: 'Always Available' },
                { num: '<5 min', text: 'Avg Response Time' },
                { num: '100%', text: 'Coverage Area' },
                { num: 'Real-time', text: 'GPS Tracking' }
              ].map((stat, i) => (
                <Grid item xs={12} sm={3} key={i}>
                  <Typography variant="h3" color="primary" fontWeight="bold">
                    {stat.num}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.text}
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* Footer */}
        <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 4, mt: 8, borderRadius: 2 }}>
          <Container maxWidth="lg">
            <Typography variant="body2" align="center">
              © 2025 Tactical Data Link System — All rights reserved.
            </Typography>
          </Container>
        </Box>
      </Box>
    </Box>
  );
};

export default LandingPage;
