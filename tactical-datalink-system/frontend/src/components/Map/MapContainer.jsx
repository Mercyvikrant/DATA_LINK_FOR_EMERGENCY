import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import UnitMarker from './UnitMarker';
import EmergencyMarker from './EmergencyMarker';

// Fix for default marker icons in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const MapUpdater = ({ center }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);

  return null;
};

const TacticalMapContainer = ({ 
  units = [], 
  emergencies = [], 
  center = [30.7333, 76.7794], // Chandigarh coordinates
  zoom = 12,
  onEmergencyClick,
  onUnitClick,
  showUserLocation = false,
  userPosition = null
}) => {
  const mapRef = useRef();

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapUpdater center={center} />

        {/* Render unit markers */}
        {units.map((unit) => (
          <UnitMarker
            key={unit.unitId || unit._id}
            unit={unit}
            onClick={() => onUnitClick && onUnitClick(unit)}
          />
        ))}

        {/* Render emergency markers */}
        {emergencies.map((emergency) => (
          <EmergencyMarker
            key={emergency.emergencyId || emergency._id}
            emergency={emergency}
            onClick={() => onEmergencyClick && onEmergencyClick(emergency)}
          />
        ))}

        {/* Show user's current location */}
        {showUserLocation && userPosition && (
          <Marker
            position={[userPosition.latitude, userPosition.longitude]}
            icon={L.icon({
              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41]
            })}
          >
            <Popup>
              <strong>Your Location</strong>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default TacticalMapContainer;