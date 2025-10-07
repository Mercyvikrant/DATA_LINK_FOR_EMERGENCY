import React from 'react';
import { Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';

const getSeverityColor = (severity) => {
  const colors = {
    low: '#4CAF50',
    medium: '#FF9800',
    high: '#FF5722',
    critical: '#F44336'
  };
  return colors[severity] || '#2196F3';
};

const getEmergencyIcon = (type, severity) => {
  const icons = {
    medical: '🏥',
    fire: '🔥',
    crime: '🚨',
    accident: '⚠️',
    disaster: '💥'
  };

  const color = getSeverityColor(severity);

  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 0 15px ${color};
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        animation: pulse 2s infinite;
      ">
        ${icons[type] || '❗'}
      </div>
      <style>
        @keyframes pulse {
          0% { box-shadow: 0 0 15px ${color}; }
          50% { box-shadow: 0 0 30px ${color}; }
          100% { box-shadow: 0 0 15px ${color}; }
        }
      </style>
    `,
    className: 'custom-emergency-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });
};

const EmergencyMarker = ({ emergency, onClick }) => {
  if (!emergency?.location?.latitude || !emergency?.location?.longitude) {
    return null;
  }

  const position = [emergency.location.latitude, emergency.location.longitude];

  return (
    <>
      <Marker
        position={position}
        icon={getEmergencyIcon(emergency.type, emergency.severity)}
        eventHandlers={{
          click: () => onClick && onClick(emergency)
        }}
      >
        <Popup>
          <div style={{ minWidth: '250px' }}>
            <h3 style={{ 
              margin: '0 0 10px 0',
              color: getSeverityColor(emergency.severity)
            }}>
              {emergency.title}
            </h3>
            <p><strong>ID:</strong> {emergency.emergencyId}</p>
            <p><strong>Type:</strong> {emergency.type}</p>
            <p><strong>Severity:</strong> 
              <span style={{
                color: getSeverityColor(emergency.severity),
                fontWeight: 'bold',
                marginLeft: '5px'
              }}>
                {emergency.severity.toUpperCase()}
              </span>
            </p>
            <p><strong>Status:</strong> {emergency.status}</p>
            <p style={{ marginTop: '10px' }}>{emergency.description}</p>
            {emergency.location.address && (
              <p><strong>Location:</strong> {emergency.location.address}</p>
            )}
            {emergency.assignedUnits && emergency.assignedUnits.length > 0 && (
              <p><strong>Assigned Units:</strong> {emergency.assignedUnits.length}</p>
            )}
          </div>
        </Popup>
      </Marker>

      {/* Circle to show emergency radius */}
      <Circle
        center={position}
        radius={500}
        pathOptions={{
          color: getSeverityColor(emergency.severity),
          fillColor: getSeverityColor(emergency.severity),
          fillOpacity: 0.1
        }}
      />
    </>
  );
};

export default EmergencyMarker;