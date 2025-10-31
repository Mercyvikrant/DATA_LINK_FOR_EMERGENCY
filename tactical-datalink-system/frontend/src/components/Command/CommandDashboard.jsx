import React, { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import TacticalMapContainer from '../Map/MapContainer';
import EmergencyList from './EmergencyList';
import UnitManagement from './UnitManagement';
import MessagePanel from '../Communication/MessagePanel';
import axios from 'axios';
import {
  Box,
  Grid,
  Paper,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Chip,
  Drawer
} from '@mui/material';
import {
  Menu as MenuIcon,
  Refresh as RefreshIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';

const CommandDashboard = () => {
  const { user, logout } = useAuth();
  const { units, emergencies, connected, assignUnit, updateEmergencyStatus, socket } = useSocket();

  const [allUnits, setAllUnits] = useState([]);
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [stats, setStats] = useState({
    totalUnits: 0,
    availableUnits: 0,
    activeEmergencies: 0,
    resolvedToday: 0
  });

  // Load units from API on mount
  useEffect(() => {
    const loadUnits = async () => {
      try {
        console.log('🔄 Loading units from API...');
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/units`);
        console.log('✅ Loaded units:', response.data);
        setAllUnits(response.data);
      } catch (error) {
        console.error('❌ Error loading units:', error);
      }
    };

    if (user?.role === 'command') {
      loadUnits();
    }
  }, [user]);

  // Update units from socket
  useEffect(() => {
    if (units.length > 0) {
      console.log('📡 Received units from socket:', units);
      setAllUnits(units);
    }
  }, [units]);

  // Calculate live statistics
  useEffect(() => {
    if (!emergencies || !Array.isArray(emergencies)) return;

    const availableCount = (allUnits || []).filter(u => u.status === 'available').length;

    // Normalize emergency statuses for robustness
    const normalizedEmergencies = emergencies.map(e => ({
      ...e,
      status: (e.status || '').toLowerCase()
    }));

    const activeEmergencyCount = normalizedEmergencies.filter(
      e => e.status === 'assigned' || e.status === 'in-progress' || e.status === 'active'
    ).length;

    const resolvedCount = normalizedEmergencies.filter(
      e => e.status === 'resolved' || e.status === 'completed' || e.status === 'closed'
    ).length;

    setStats({
      totalUnits: allUnits?.length || 0,
      availableUnits: availableCount,
      activeEmergencies: activeEmergencyCount,
      resolvedToday: resolvedCount
    });

    console.log('📊 Stats Updated:', {
      totalUnits: allUnits?.length,
      availableUnits: availableCount,
      activeEmergencyCount,
      resolvedCount
    });
  }, [allUnits, emergencies]);

  const handleAssignUnit = (emergency, unit, role = 'primary') => {
    assignUnit(emergency.emergencyId, unit.unitId, role);
    setSelectedEmergency(null);
  };

  const handleEmergencyStatusChange = (emergencyId, status) => {
    updateEmergencyStatus(emergencyId, status);
  };

  const handleRefresh = async () => {
    try {
      await axios.get(`${process.env.REACT_APP_API_URL}/api/units`);
      // Data will update via socket
    } catch (error) {
      console.error('Refresh error:', error);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* App Bar */}
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => setDrawerOpen(!drawerOpen)} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Command Center - {user?.name}
          </Typography>
          <Chip label={connected ? 'Connected' : 'Disconnected'} color={connected ? 'success' : 'error'} sx={{ mr: 2 }} />
          <IconButton color="inherit" onClick={handleRefresh}>
            <RefreshIcon />
          </IconButton>
          <IconButton color="inherit" onClick={logout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        {/* Side Panel */}
        <Drawer
          variant="persistent"
          anchor="left"
          open={drawerOpen}
          sx={{
            width: 350,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: 350,
              boxSizing: 'border-box',
              top: 64,
              height: 'calc(100% - 64px)'
            }
          }}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              System Statistics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">{stats.totalUnits}</Typography>
                  <Typography variant="body2">Total Units</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main">{stats.availableUnits}</Typography>
                  <Typography variant="body2">Available</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="error.main">{stats.activeEmergencies}</Typography>
                  <Typography variant="body2">Active</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="info.main">{stats.resolvedToday}</Typography>
                  <Typography variant="body2">Resolved</Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ p: 2 }}>
            <UnitManagement
              units={allUnits}  // use allUnits
              onUnitSelect={setSelectedUnit}
              selectedUnit={selectedUnit}
            />
          </Box>
        </Drawer>

        {/* Main Map Area */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ flexGrow: 1, position: 'relative' }}>
            <TacticalMapContainer
              units={allUnits}  // use allUnits
              emergencies={emergencies}
              onEmergencyClick={setSelectedEmergency}
              onUnitClick={setSelectedUnit}
            />
          </Box>

          {/* Bottom Panel - Emergencies */}
          <Paper sx={{ height: '250px', overflow: 'auto' }}>
            <EmergencyList
              emergencies={emergencies}
              units={allUnits}
              selectedEmergency={selectedEmergency}
              onEmergencySelect={setSelectedEmergency}
              onAssignUnit={handleAssignUnit}
              onStatusChange={handleEmergencyStatusChange}
            />
          </Paper>
        </Box>

        {/* Right Panel - Communications */}
        <Paper sx={{ width: 350, overflow: 'auto' }}>
          <MessagePanel />
        </Paper>
      </Box>
    </Box>
  );
};

export default CommandDashboard;
