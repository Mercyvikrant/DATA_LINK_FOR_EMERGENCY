import React from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  Typography,
  Chip,
  Divider
} from '@mui/material';
import { Circle } from '@mui/icons-material';

const UnitManagement = ({ units, onUnitSelect, selectedUnit }) => {
  const getStatusColor = (status) => {
    const colors = {
      available: 'success',
      busy: 'warning',
      offline: 'default'
    };
    return colors[status] || 'default';
  };

  const getUnitIcon = (unitType) => {
    const icons = {
      ambulance: '🚑',
      fire: '🚒',
      police: '🚓',
      rescue: '🚐'
    };
    return icons[unitType] || '📍';
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Unit Status
      </Typography>

      <List>
        {units.map((unit) => (
          <React.Fragment key={unit.unitId || unit._id}>
            <ListItem
              button
              selected={selectedUnit?.unitId === unit.unitId}
              onClick={() => onUnitSelect(unit)}
              sx={{
                borderRadius: 1,
                mb: 0.5,
                '&.Mui-selected': {
                  backgroundColor: 'action.selected'
                }
              }}
            >
              <Box sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle2">
                    {getUnitIcon(unit.unitType)} {unit.unitId}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                    <Circle
                      sx={{
                        fontSize: 12,
                        color: unit.isOnline ? 'success.main' : 'error.main'
                      }}
                    />
                    <Chip
                      label={unit.status}
                      color={getStatusColor(unit.status)}
                      size="small"
                    />
                  </Box>
                </Box>

                <Typography variant="caption" color="text.secondary">
                  Type: {unit.unitType}
                </Typography>

                {unit.resources && (
                  <Box sx={{ mt: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      Fuel: {unit.resources.fuel}% | Personnel: {unit.resources.personnel}
                    </Typography>
                  </Box>
                )}

                {unit.assignedEmergency && (
                  <Chip
                    label="On Assignment"
                    color="info"
                    size="small"
                    sx={{ mt: 0.5 }}
                  />
                )}
              </Box>
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}

        {units.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
            No units available
          </Typography>
        )}
      </List>
    </Box>
  );
};

export default UnitManagement;