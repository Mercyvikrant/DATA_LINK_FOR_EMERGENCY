import React from 'react';
import { Marker, Popup, Tooltip } from 'react-leaflet';
import L from 'leaflet';

const getUnitIcon = (unitType, status) => {
  const colors = {
    available: 'green',
    busy: 'orange',
    offline: 'grey'
  };

  const icons = {
    ambulance: '🚑',
    fire: '🚒',
    police: '🚓',
    rescue: '🚐'
  };

  const color = colors[status] || 'blue';
  
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 0 10px rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
      ">
        ${icons[unitType] || '📍'}
      </div>
    `,
    className: 'custom-unit-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
};

const UnitMarker = ({ unit, onClick }) => {
  if (!unit?.position?.latitude || !unit?.position?.longitude) {
    return null;
  }

  return (
    <Marker
      position={[unit.position.latitude, unit.position.longitude]}
      icon={getUnitIcon(unit.unitType, unit.status)}
      eventHandlers={{
        click: () => onClick && onClick(unit)
      }}
    >
      <Tooltip direction="top" offset={[0, -15]} opacity={0.9}>
        <strong>{unit.unitId}</strong>
      </Tooltip>
      <Popup>
        <div style={{ minWidth: '200px' }}>
          <h3 style={{ margin: '0 0 10px 0' }}>{unit.unitId}</h3>
          <p><strong>Type:</strong> {unit.unitType}</p>
          <p><strong>Status:</strong> 
            <span style={{
              color: unit.status === 'available' ? 'green' : 
                     unit.status === 'busy' ? 'orange' : 'grey',
              fontWeight: 'bold',
              marginLeft: '5px'
            }}>
              {unit.status.toUpperCase()}
            </span>
          </p>
          {unit.resources && (
            <>
              <p><strong>Fuel:</strong> {unit.resources.fuel}%</p>
              <p><strong>Personnel:</strong> {unit.resources.personnel}</p>
            </>
          )}
          {unit.assignedEmergency && (
            <p style={{ color: 'red' }}>
              <strong>Assigned to Emergency</strong>
            </p>
          )}
        </div>
      </Popup>
    </Marker>
  );
};

export default UnitMarker;