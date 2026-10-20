import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { MapPin } from 'lucide-react';
import L from 'leaflet';

// Custom marker icon to prevent default Leaflet missing icon issue
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

function LocationMarker({ position }) {
  return position ? <Marker position={position} icon={defaultIcon} /> : null;
}

function MapCenterUpdater({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.setView(position, 15);
    }
  }, [map, position]);

  return null;
}

export const LocationPicker = ({ value, onChange, defaultCenter = [20.5937, 78.9629] }) => {
  const [position, setPosition] = useState(
    value?.lat && value?.lng ? [value.lat, value.lng] : null
  );

  useEffect(() => {
    if (value?.lat && value?.lng) {
      setPosition([value.lat, value.lng]);
    }
  }, [value]);

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setPosition([lat, lng]);
          if (onChange) onChange({ lat, lng });
        },
        () => alert('Could not get current location. Please allow location access and try again.')
      );
    } else {
      alert('Location services are not available in this browser.');
    }
  };

  return (
    <div className="location-picker-container">
      <div className="location-picker-actions">
        <button type="button" className="btn btn-secondary btn-sm" onClick={handleCurrentLocation}>
          <MapPin size={16} /> Use My Current Location
        </button>
        {position && (
          <span className="location-coords">
            Lat: {position[0].toFixed(5)}, Lng: {position[1].toFixed(5)}
          </span>
        )}
      </div>

      <div className="map-wrapper" style={{ height: '300px', width: '100%', marginTop: '10px' }}>
        <MapContainer
          center={position || defaultCenter}
          zoom={position ? 15 : 5}
          dragging={false}
          touchZoom={false}
          scrollWheelZoom={false}
          doubleClickZoom={false}
          boxZoom={false}
          keyboard={false}
          zoomControl={false}
          style={{ height: '100%', width: '100%', borderRadius: '8px' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapCenterUpdater position={position} />
          <LocationMarker position={position} />
        </MapContainer>
      </div>
    </div>
  );
};
