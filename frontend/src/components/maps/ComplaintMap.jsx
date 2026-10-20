import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { StatusBadge } from '../common/StatusBadge';
import L from 'leaflet';

const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

export const ComplaintMap = ({ complaints = [], center = [20.5937, 78.9629], zoom = 6 }) => {
  return (
    <div className="map-wrapper" style={{ height: '500px', width: '100%', borderRadius: '12px' }}>
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {complaints
          .filter((complaint) => complaint.location?.latitude != null && complaint.location?.longitude != null)
          .map((complaint) => {
            const { latitude: lat, longitude: lng } = complaint.location;
            return (
              <Marker key={complaint._id || complaint.id} position={[lat, lng]} icon={defaultIcon}>
                <Popup>
                  <div className="map-popup-content">
                    <h4>{complaint.title || complaint.issueType || 'Infrastructure Issue'}</h4>
                    <p className="popup-id">ID: {complaint._id || complaint.id}</p>
                    <div className="popup-badges">
                      <StatusBadge status={complaint.status} type="status" />
                      {complaint.priority && (
                        <StatusBadge status={complaint.priority} type="priority" />
                      )}
                    </div>
                    <p className="popup-desc">{complaint.description}</p>
                  </div>
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>
    </div>
  );
};
