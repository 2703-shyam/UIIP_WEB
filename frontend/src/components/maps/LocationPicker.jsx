import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { LocateFixed } from 'lucide-react';
import L from 'leaflet';

const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

function MapClickHandler({ onSelect }) {
  useMapEvents({
    click(event) {
      onSelect(event.latlng, null);
    }
  });
  return null;
}

function MapCenterUpdater({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) map.flyTo(position, Math.max(map.getZoom(), 16));
  }, [map, position]);

  return null;
}

export const LocationPicker = ({ value, onChange, defaultCenter = [20.5937, 78.9629] }) => {
  const initialPosition = value?.lat != null && value?.lng != null ? [value.lat, value.lng] : null;
  const [position, setPosition] = useState(initialPosition);
  const [accuracy, setAccuracy] = useState(null);
  const [locating, setLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState('');

  useEffect(() => {
    const nextPosition = value?.lat != null && value?.lng != null ? [value.lat, value.lng] : null;
    setPosition(nextPosition);
  }, [value]);

  const selectPosition = (latlng, reportedAccuracy) => {
    const nextPosition = [latlng.lat, latlng.lng];
    setPosition(nextPosition);
    setAccuracy(reportedAccuracy);
    setLocationMessage('');
    onChange?.({ lat: latlng.lat, lng: latlng.lng, accuracy: reportedAccuracy ?? undefined });
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage('Location services are not available in this browser. Select a point on the map instead.');
      return;
    }

    setLocating(true);
    setLocationMessage('Getting your location…');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        selectPosition({ lat: coords.latitude, lng: coords.longitude }, coords.accuracy);
        setLocationMessage(`GPS accuracy: about ${Math.round(coords.accuracy)} m. You can fine-tune the pin on the map.`);
        setLocating(false);
      },
      (error) => {
        const messages = {
          1: 'Location permission was denied. Allow location access in your browser, or select a point on the map.',
          2: 'Your location could not be determined. Try again near a window or select a point on the map.',
          3: 'Getting your location took too long. Try again or select a point on the map.'
        };
        setLocationMessage(messages[error.code] || 'Could not get your location. Select a point on the map instead.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
  };

  return (
    <div className="location-picker-container">
      <div className="location-picker-actions">
        <button type="button" className="btn btn-secondary btn-sm" onClick={handleCurrentLocation} disabled={locating}>
          <LocateFixed size={16} /> {locating ? 'Finding location…' : 'Use My Current Location'}
        </button>
        {position && (
          <span className="location-coords">
            Lat: {position[0].toFixed(6)}, Lng: {position[1].toFixed(6)}
            {accuracy != null && ` · ±${Math.round(accuracy)} m`}
          </span>
        )}
      </div>
      {locationMessage && <p className="location-picker-message" role="status">{locationMessage}</p>}
      <p className="location-picker-hint">Click the map or drag the pin to set the exact issue location. Use +/− to zoom.</p>

      <div className="map-wrapper" style={{ height: '350px', width: '100%', marginTop: '10px' }}>
        <MapContainer
          center={position || defaultCenter}
          zoom={position ? 16 : 5}
          scrollWheelZoom
          zoomControl
          style={{ height: '100%', width: '100%', borderRadius: '8px' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapCenterUpdater position={position} />
          <MapClickHandler onSelect={selectPosition} />
          {position && (
            <Marker
              position={position}
              icon={defaultIcon}
              draggable
              eventHandlers={{ dragend: (event) => selectPosition(event.target.getLatLng(), null) }}
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
};
