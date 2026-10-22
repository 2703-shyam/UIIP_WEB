import React, { useCallback, useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap, useMapEvents } from 'react-leaflet';
import {
  LocateFixed,
  Search,
  Layers,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Crosshair,
  X,
  Compass,
  Check,
  Navigation
} from 'lucide-react';
import L from 'leaflet';
import { searchPlaces, reverseGeocode } from '../../utils/geocoding';

// Default custom marker icon
const customIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Quick Area Presets for Gujarat / Local Municipalities
export const REGION_PRESETS = [
  { name: 'Anand', lat: 22.5586, lng: 72.9627, label: 'Anand City' },
  { name: 'V.V. Nagar', lat: 22.5398, lng: 72.9289, label: 'Vallabh Vidyanagar' },
  { name: 'Bakrol', lat: 22.5447, lng: 72.9056, label: 'Bakrol' },
  { name: 'Nadiad', lat: 22.6916, lng: 72.8634, label: 'Nadiad' },
  { name: 'Vadodara', lat: 22.3072, lng: 73.1812, label: 'Vadodara' },
  { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714, label: 'Ahmedabad' }
];

function MapClickHandler({ onSelect }) {
  useMapEvents({
    click(event) {
      onSelect(event.latlng);
    }
  });
  return null;
}

function MapController({ targetPosition, targetZoom }) {
  const map = useMap();

  useEffect(() => {
    if (targetPosition && targetPosition[0] != null && targetPosition[1] != null) {
      const zoom = targetZoom || Math.max(map.getZoom(), 16);
      map.flyTo(targetPosition, zoom, { duration: 1.2 });
    }
  }, [map, targetPosition, targetZoom]);

  return null;
}

export const LocationPicker = ({
  value,
  onChange,
  onAddressSelect,
  defaultCenter = [22.5586, 72.9627] // Anand, Gujarat
}) => {
  const initialPosition = value?.lat != null && value?.lng != null ? [value.lat, value.lng] : null;
  const [position, setPosition] = useState(initialPosition);
  const [flyTarget, setFlyTarget] = useState(initialPosition || defaultCenter);
  const [flyZoom, setFlyZoom] = useState(initialPosition ? 17 : 14);
  const [accuracy, setAccuracy] = useState(value?.accuracy ?? null);
  const [locating, setLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState('');
  const [layerType, setLayerType] = useState('street'); // 'street' | 'satellite'

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchTimeoutRef = useRef(null);

  // Address state
  const [resolvedAddress, setResolvedAddress] = useState(value?.address || '');
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);
  const [addressApplied, setAddressApplied] = useState(false);

  // ISP IP Warning state (for desktop users where ISP IP is routed to Mumbai/Delhi)
  const [ispWarning, setIspWarning] = useState(null);

  // Manual Coordinates modal/toggle
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');
  const [manualError, setManualError] = useState('');

  const searchBoxRef = useRef(null);

  // Sync external value changes
  useEffect(() => {
    if (value?.lat != null && value?.lng != null) {
      const newPos = [value.lat, value.lng];
      setPosition(newPos);
      if (value.accuracy !== undefined) setAccuracy(value.accuracy);
      if (value.address) setResolvedAddress(value.address);
    }
  }, [value]);

  // Reverse geocode whenever position changes manually
  const fetchAddressForPosition = useCallback(async (lat, lng) => {
    setIsResolvingAddress(true);
    try {
      const res = await reverseGeocode(lat, lng);
      if (res && res.formattedAddress) {
        setResolvedAddress(res.formattedAddress);
        return res.formattedAddress;
      }
    } catch {
      // ignore geocode error
    } finally {
      setIsResolvingAddress(false);
    }
    return '';
  }, []);

  // Update position and notify parent
  const commitPosition = async (lat, lng, reportedAccuracy = null, explicitAddress = null) => {
    const nextPos = [lat, lng];
    setPosition(nextPos);
    setFlyTarget(nextPos);
    setAccuracy(reportedAccuracy);
    setAddressApplied(false);
    setIspWarning(null);

    let finalAddress = explicitAddress;
    if (!finalAddress) {
      finalAddress = await fetchAddressForPosition(lat, lng);
    } else {
      setResolvedAddress(finalAddress);
    }

    onChange?.({
      lat,
      lng,
      accuracy: reportedAccuracy ?? undefined,
      address: finalAddress || undefined
    });
  };

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle Search Input with debounce & regional bias (Anand, Gujarat)
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (!query.trim() || query.trim().length < 2) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      // Use current pin or Anand coords as search bias
      const bias = position ? { lat: position[0], lng: position[1] } : { lat: 22.5586, lng: 72.9627 };
      const results = await searchPlaces(query, bias);
      setSearchResults(results);
      setShowSearchDropdown(results.length > 0);
      setIsSearching(false);
    }, 350);
  };

  const handleSelectSearchResult = (item) => {
    setSearchQuery(item.title);
    setShowSearchDropdown(false);
    setFlyZoom(18);
    setLocationMessage(`📍 Selected: ${item.title}`);
    commitPosition(item.lat, item.lng, null, item.fullAddress);
  };

  // Handle Geolocation with Desktop ISP IP Detection
  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage('Location services are not supported by this browser. Use place search or select Anand.');
      return;
    }

    setLocating(true);
    setIspWarning(null);
    setLocationMessage('Contacting location provider…');

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const { latitude, longitude, accuracy: acc } = coords;
        setLocating(false);

        // Check if this is an inaccurate ISP IP Geolocation estimate (typical on Windows/Desktop)
        // On laptops/desktops without hardware GPS, public IPv4 routes through Mumbai/Delhi ISP gateways with acc > 1000m
        if (acc > 1000) {
          const detected = await reverseGeocode(latitude, longitude);
          const detectedCity = detected?.city || 'Mumbai';

          setIspWarning({
            detectedCity,
            accuracyKm: Math.round(acc / 1000),
            lat: latitude,
            lng: longitude
          });
          setLocationMessage('');
          return;
        }

        // Real GPS fix (mobile phone or high precision Wi-Fi AP)
        setFlyZoom(acc <= 35 ? 18 : 16);
        if (acc <= 30) {
          setLocationMessage(`🎯 Real GPS locked with precision ±${Math.round(acc)}m.`);
        } else {
          setLocationMessage(`📍 Location fix acquired (±${Math.round(acc)}m). You can fine-tune the pin.`);
        }

        await commitPosition(latitude, longitude, acc);
      },
      (error) => {
        setLocating(false);
        const msgs = {
          1: 'Location permission was denied in browser. Please search your street or click Anand below.',
          2: 'Unable to acquire location fix. Search your street name or choose Anand below.',
          3: 'Location request timed out. Please try again or search your area.'
        };
        setLocationMessage(msgs[error.code] || 'Could not retrieve your location.');
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
  };

  // Jump to predefined municipality/region
  const handleJumpToRegion = (preset) => {
    setFlyTarget([preset.lat, preset.lng]);
    setFlyZoom(16);
    setLocationMessage(`📍 Centered on ${preset.label}, Gujarat. Drag the marker or search your street.`);
    commitPosition(preset.lat, preset.lng, null, `${preset.label}, Gujarat, India`);
  };

  // Handle Map Click
  const handleMapClick = (latlng) => {
    setLocationMessage('');
    commitPosition(latlng.lat, latlng.lng, null);
  };

  // Handle Marker Drag
  const handleMarkerDragEnd = (event) => {
    const latlng = event.target.getLatLng();
    setLocationMessage('');
    commitPosition(latlng.lat, latlng.lng, null);
  };

  // Handle Manual Coordinates Submit
  const handleManualCoordsSubmit = (e) => {
    e.preventDefault();
    setManualError('');

    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);

    if (isNaN(lat) || lat < -90 || lat > 90) {
      setManualError('Latitude must be a valid number between -90 and 90');
      return;
    }
    if (isNaN(lng) || lng < -180 || lng > 180) {
      setManualError('Longitude must be a valid number between -180 and 180');
      return;
    }

    setFlyZoom(18);
    setLocationMessage(`📍 Custom GPS coordinates set: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    commitPosition(lat, lng, 1);
    setShowManualInput(false);
  };

  // Apply Address to Parent form
  const handleApplyAddressToForm = () => {
    if (resolvedAddress && onAddressSelect) {
      onAddressSelect(resolvedAddress);
      setAddressApplied(true);
      setTimeout(() => setAddressApplied(false), 3000);
    }
  };

  return (
    <div className="location-picker-card">
      {/* Search & Actions Bar */}
      <div className="location-picker-topbar">
        {/* Place Search Input */}
        <div className="location-search-wrapper" ref={searchBoxRef}>
          <div className="location-search-input-group">
            <Search size={17} className="search-icon" />
            <input
              type="text"
              className="location-search-input"
              placeholder="Search street, society, landmark in Anand/Gujarat…"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => {
                if (searchResults.length > 0) setShowSearchDropdown(true);
              }}
            />
            {isSearching && <Loader2 size={16} className="animate-spin text-muted" />}
            {searchQuery && !isSearching && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                  setShowSearchDropdown(false);
                }}
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Search Dropdown */}
          {showSearchDropdown && searchResults.length > 0 && (
            <div className="location-search-dropdown">
              {searchResults.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className="location-search-result-item"
                  onClick={() => handleSelectSearchResult(item)}
                >
                  <MapPin size={16} className="item-icon" />
                  <div className="item-text">
                    <span className="item-title">{item.title}</span>
                    {item.subtitle && <span className="item-subtitle">{item.subtitle}</span>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="location-action-buttons">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleCurrentLocation}
            disabled={locating}
            title="Locate via device GPS"
          >
            <LocateFixed size={15} />
            {locating ? 'Acquiring GPS…' : 'My Location'}
          </button>

          <button
            type="button"
            className={`btn btn-sm ${layerType === 'satellite' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setLayerType(layerType === 'street' ? 'satellite' : 'street')}
            title="Toggle high-resolution satellite imagery"
          >
            <Layers size={15} />
            {layerType === 'satellite' ? 'Street View' : 'Satellite View'}
          </button>

          <button
            type="button"
            className={`btn btn-sm ${showManualInput ? 'btn-dark' : 'btn-secondary'}`}
            onClick={() => {
              if (!showManualInput && position) {
                setManualLat(position[0].toFixed(6));
                setManualLng(position[1].toFixed(6));
              }
              setShowManualInput(!showManualInput);
            }}
            title="Type or paste exact coordinates"
          >
            <Compass size={15} />
            Lat/Lng
          </button>
        </div>
      </div>

      {/* Quick Region Presets Bar */}
      <div className="quick-region-bar">
        <span className="quick-region-label">
          <Navigation size={13} /> Quick City:
        </span>
        {REGION_PRESETS.map((preset) => (
          <button
            key={preset.name}
            type="button"
            className="quick-region-chip"
            onClick={() => handleJumpToRegion(preset)}
            title={`Center map on ${preset.label}`}
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* Desktop ISP IP Warning Dialog (When browser routes via Mumbai ISP) */}
      {ispWarning && (
        <div className="isp-warning-box">
          <div className="isp-warning-header">
            <AlertTriangle size={18} className="text-warning-icon" />
            <div>
              <strong>Desktop Network Routed via {ispWarning.detectedCity} (~{ispWarning.accuracyKm} km away)</strong>
              <p className="isp-warning-sub">
                Desktop and laptop browsers lack GPS hardware. Your internet connection (broadband/fiber) is routed through your provider's regional gateway in {ispWarning.detectedCity}. We prevented jumping your pin to {ispWarning.detectedCity}.
              </p>
            </div>
          </div>
          <div className="isp-warning-actions">
            <button
              type="button"
              className="btn btn-primary btn-xs"
              onClick={() => handleJumpToRegion(REGION_PRESETS[0])}
            >
              <MapPin size={13} /> Center on Anand, Gujarat
            </button>
            <button
              type="button"
              className="btn btn-outline btn-xs"
              onClick={() => {
                if (searchBoxRef.current) {
                  const input = searchBoxRef.current.querySelector('input');
                  if (input) input.focus();
                }
              }}
            >
              <Search size={13} /> Search My Street / Society
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-xs"
              onClick={() => {
                commitPosition(ispWarning.lat, ispWarning.lng, ispWarning.accuracyKm * 1000);
                setIspWarning(null);
              }}
            >
              Use {ispWarning.detectedCity} anyway
            </button>
            <button
              type="button"
              className="btn btn-outline btn-xs"
              onClick={() => setIspWarning(null)}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Manual Coordinates Input Form (Toggleable) */}
      {showManualInput && (
        <form onSubmit={handleManualCoordsSubmit} className="manual-coords-bar">
          <span className="manual-coords-label">Enter Exact GPS:</span>
          <div className="coords-inputs">
            <input
              type="text"
              placeholder="Latitude (e.g. 22.5586)"
              value={manualLat}
              onChange={(e) => setManualLat(e.target.value)}
              className="coord-input"
            />
            <input
              type="text"
              placeholder="Longitude (e.g. 72.9627)"
              value={manualLng}
              onChange={(e) => setManualLng(e.target.value)}
              className="coord-input"
            />
            <button type="submit" className="btn btn-primary btn-sm">
              Set Pin
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setShowManualInput(false)}
            >
              Cancel
            </button>
          </div>
          {manualError && <span className="manual-error-text">{manualError}</span>}
        </form>
      )}

      {/* Accuracy Status & Messages */}
      {locationMessage && (
        <div
          className={`location-feedback-alert ${
            accuracy && accuracy > 120
              ? 'alert-warning'
              : accuracy && accuracy <= 30
              ? 'alert-success'
              : 'alert-info'
          }`}
        >
          {accuracy && accuracy > 120 ? (
            <AlertTriangle size={16} />
          ) : accuracy && accuracy <= 30 ? (
            <CheckCircle2 size={16} />
          ) : (
            <Compass size={16} />
          )}
          <span>{locationMessage}</span>
        </div>
      )}

      {/* Map Container */}
      <div className="map-view-container">
        <MapContainer
          center={position || defaultCenter}
          zoom={position ? 17 : 15}
          maxZoom={19}
          scrollWheelZoom
          zoomControl
          style={{ height: '370px', width: '100%', borderRadius: '10px' }}
        >
          {layerType === 'street' ? (
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
            />
          ) : (
            <TileLayer
              attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={19}
            />
          )}

          <MapController targetPosition={flyTarget} targetZoom={flyZoom} />
          <MapClickHandler onSelect={handleMapClick} />

          {/* Accuracy radius visualization */}
          {position && accuracy != null && accuracy > 5 && (
            <Circle
              center={position}
              radius={accuracy}
              pathOptions={{
                color: accuracy <= 30 ? '#10b981' : accuracy <= 100 ? '#f59e0b' : '#ef4444',
                fillColor: accuracy <= 30 ? '#10b981' : accuracy <= 100 ? '#f59e0b' : '#ef4444',
                fillOpacity: 0.14,
                weight: 1.5,
                dashArray: '4, 4'
              }}
            />
          )}

          {/* Draggable pinpoint marker */}
          {position && (
            <Marker
              position={position}
              icon={customIcon}
              draggable
              eventHandlers={{
                dragend: handleMarkerDragEnd
              }}
            />
          )}
        </MapContainer>

        {/* Map Overlay Helper Pill */}
        <div className="map-overlay-hint">
          <Crosshair size={13} />
          <span>Click anywhere or drag the red marker to fine-tune exact spot</span>
        </div>

        {/* Layer Badge on Map */}
        <div className="map-layer-indicator">
          {layerType === 'satellite' ? '🛰️ Esri Satellite Imagery' : '🗺️ OpenStreetMap'}
        </div>
      </div>

      {/* Selected Location Details Card */}
      {position && (
        <div className="location-detail-card">
          <div className="detail-coords-row">
            <div className="coords-info">
              <span className="coords-badge">
                <MapPin size={13} /> Lat: {position[0].toFixed(6)}, Lng: {position[1].toFixed(6)}
              </span>
              {accuracy != null && (
                <span
                  className={`accuracy-badge ${
                    accuracy <= 30
                      ? 'accuracy-high'
                      : accuracy <= 100
                      ? 'accuracy-medium'
                      : 'accuracy-low'
                  }`}
                  title="Estimated accuracy radius from device/network"
                >
                  ±{Math.round(accuracy)}m {accuracy <= 30 ? 'High Accuracy' : accuracy <= 100 ? 'Moderate' : 'Low (Refine on map)'}
                </span>
              )}
            </div>

            {/* Re-center button */}
            <button
              type="button"
              className="btn btn-outline btn-xs"
              onClick={() => {
                setFlyTarget([position[0], position[1]]);
                setFlyZoom(18);
              }}
              title="Center map on pin"
            >
              <Crosshair size={13} /> Re-center
            </button>
          </div>

          {/* Resolved Address and Apply button */}
          <div className="detail-address-row">
            <div className="address-text">
              <strong>Resolved Address:</strong>{' '}
              {isResolvingAddress ? (
                <span className="text-muted">Resolving street address…</span>
              ) : resolvedAddress ? (
                <span>{resolvedAddress}</span>
              ) : (
                <span className="text-muted">Address not found (coordinates recorded)</span>
              )}
            </div>

            {resolvedAddress && onAddressSelect && (
              <button
                type="button"
                className={`btn btn-xs ${addressApplied ? 'btn-success' : 'btn-outline-primary'}`}
                onClick={handleApplyAddressToForm}
                title="Fill this address into the report form address field"
              >
                {addressApplied ? (
                  <>
                    <Check size={13} /> Applied to Form
                  </>
                ) : (
                  'Use as Form Address'
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
