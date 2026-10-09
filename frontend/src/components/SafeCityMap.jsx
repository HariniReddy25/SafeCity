import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import HeatmapLayer from './HeatmapLayer';
import DangerZoneLayer from './DangerZoneLayer';
import BroadcastRadiusOverlay from './BroadcastRadiusOverlay';
import ShelterMapOverlay from './ShelterMapOverlay';

// Fix default Leaflet marker icons in Vite build environment
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Icon for Current User Location (Pulse Blue Ring Icon)
const currentLocationIcon = new L.DivIcon({
  className: 'custom-location-marker',
  html: `<div style="
    width: 22px;
    height: 22px;
    background-color: #2563EB;
    border: 3px solid #FFFFFF;
    border-radius: 50%;
    box-shadow: 0 0 0 8px rgba(37, 99, 235, 0.25), 0 4px 12px rgba(0,0,0,0.25);
  "></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

// Priority Visual Color & Symbol Configuration
const getPriorityBadgeConfig = (priorityStr) => {
  const p = (priorityStr || 'LOW').toUpperCase();
  switch (p) {
    case 'CRITICAL':
      return {
        bgColor: '#DC2626', // Crimson Red
        label: 'CRITICAL',
        symbol: '🚨',
        pulse: 'box-shadow: 0 0 0 6px rgba(220, 38, 38, 0.35), 0 4px 12px rgba(0,0,0,0.3);',
      };
    case 'HIGH':
      return {
        bgColor: '#EA580C', // Orange
        label: 'HIGH',
        symbol: '⚠️',
        pulse: 'box-shadow: 0 4px 10px rgba(234, 88, 12, 0.35);',
      };
    case 'MEDIUM':
      return {
        bgColor: '#D97706', // Amber / Gold
        label: 'MEDIUM',
        symbol: '⚡',
        pulse: 'box-shadow: 0 3px 8px rgba(217, 119, 6, 0.3);',
      };
    case 'LOW':
    default:
      return {
        bgColor: '#2563EB', // Royal Blue
        label: 'LOW',
        symbol: 'ℹ️',
        pulse: 'box-shadow: 0 3px 8px rgba(37, 99, 235, 0.25);',
      };
  }
};

// Create accessible priority-based custom Leaflet DivIcon for emergency reports
const createEmergencyMarkerIcon = (priorityStr) => {
  const config = getPriorityBadgeConfig(priorityStr);
  return new L.DivIcon({
    className: 'custom-emergency-marker',
    html: `
      <div style="
        display: inline-flex;
        align-items: center;
        gap: 4px;
        background-color: ${config.bgColor};
        color: #FFFFFF;
        padding: 4px 8px;
        border-radius: 12px;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.02em;
        border: 2px solid #FFFFFF;
        white-space: nowrap;
        cursor: pointer;
        ${config.pulse}
      ">
        <span style="font-size: 12px; line-height: 1;">${config.symbol}</span>
        <span>${config.label}</span>
      </div>
    `,
    iconSize: [85, 28],
    iconAnchor: [42, 14],
    popupAnchor: [0, -14],
  });
};

// Create distinct custom Leaflet DivIcon for Emergency Services (Hospitals, Police, Fire Stations)
const createServiceMarkerIcon = (serviceType) => {
  let bgColor = '#0284C7'; // Hospital Blue
  let label = 'HOSPITAL';
  let symbol = '🏥';

  if (serviceType === 'POLICE') {
    bgColor = '#1E3A8A'; // Police Navy
    label = 'POLICE';
    symbol = '👮';
  } else if (serviceType === 'FIRE_STATION') {
    bgColor = '#B91C1C'; // Fire Dark Red
    label = 'FIRE';
    symbol = '🚒';
  }

  return new L.DivIcon({
    className: 'custom-service-marker',
    html: `
      <div style="
        display: inline-flex;
        align-items: center;
        gap: 4px;
        background-color: ${bgColor};
        color: #FFFFFF;
        padding: 4px 8px;
        border-radius: 12px;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.02em;
        border: 2px solid #FFFFFF;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        white-space: nowrap;
        cursor: pointer;
      ">
        <span style="font-size: 12px; line-height: 1;">${symbol}</span>
        <span>${label}</span>
      </div>
    `,
    iconSize: [85, 28],
    iconAnchor: [42, 14],
    popupAnchor: [0, -14],
  });
};

// Validate latitude and longitude on frontend as an additional safety check
const isValidCoordinate = (lat, lng) => {
  if (lat === null || lat === undefined || lng === null || lng === undefined) return false;
  const numLat = Number(lat);
  const numLng = Number(lng);
  if (isNaN(numLat) || isNaN(numLng)) return false;
  return numLat >= -90 && numLat <= 90 && numLng >= -180 && numLng <= 180;
};

// Helper component to re-center map dynamically when props change
const RecenterMap = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom || map.getZoom(), { animate: true });
    }
  }, [center, zoom, map]);
  return null;
};

// Helper component for click-to-select-location
const MapClickHandler = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      if (onLocationSelect) {
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
};

const SafeCityMap = ({
  center = [17.3850, 78.4867],
  zoom = 13,
  markers = [],
  serviceMarkers = [],
  broadcasts = [],
  shelters = [],
  currentLocation = null,
  selectedLocation = null,
  onLocationSelect = null,
  showMarkers = true,
  showHeatmap = false,
  showDangerZones = false,
  showServices = true,
  height = '520px',
  style = {},
  className = '',
}) => {
  const mapCenter = selectedLocation
    ? [selectedLocation.latitude || selectedLocation.lat, selectedLocation.longitude || selectedLocation.lng]
    : currentLocation
    ? [currentLocation.lat, currentLocation.lng]
    : center;

  // Filter out markers with invalid coordinates to prevent map crash
  const validMarkers = markers.filter((marker) =>
    isValidCoordinate(marker.lat ?? marker.latitude, marker.lng ?? marker.longitude)
  );

  const validServiceMarkers = serviceMarkers.filter((service) =>
    isValidCoordinate(service.lat, service.lng)
  );

  return (
    <div
      style={{
        width: '100%',
        height: height,
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        border: '1.5px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-sm)',
        position: 'relative',
        zIndex: 1,
        ...style,
      }}
      className={className}
    >
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Dynamic Re-centering Hook */}
        <RecenterMap center={mapCenter} zoom={zoom} />

        {/* Map Click Event Handler for Location Selection */}
        {onLocationSelect && <MapClickHandler onLocationSelect={onLocationSelect} />}

        {/* OpenStreetMap Base Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Feature 6: Civil Defense Emergency Broadcast Radius Circles Overlay */}
        {broadcasts && broadcasts.length > 0 && <BroadcastRadiusOverlay broadcasts={broadcasts} />}

        {/* Feature 8: Evacuation & Emergency Shelter Map Overlay */}
        {shelters && shelters.length > 0 && <ShelterMapOverlay shelters={shelters} />}

        {/* Phase 5D: Canvas Heatmap Layer */}
        {showHeatmap && <HeatmapLayer points={validMarkers} />}

        {/* Phase 5D: Danger Zones Spatial Cluster Layer */}
        {showDangerZones && <DangerZoneLayer reports={validMarkers} />}

        {/* Selected Location Picker Marker */}
        {selectedLocation && isValidCoordinate(selectedLocation.latitude || selectedLocation.lat, selectedLocation.longitude || selectedLocation.lng) && (
          <Marker position={[selectedLocation.latitude || selectedLocation.lat, selectedLocation.longitude || selectedLocation.lng]}>
            <Popup>
              <div style={{ textAlign: 'center', padding: '0.2rem' }}>
                <strong style={{ color: '#7E22CE', display: 'block', fontSize: '0.85rem' }}>Selected Center Location</strong>
                <span style={{ fontSize: '0.75rem', color: '#475569' }}>
                  {(selectedLocation.latitude || selectedLocation.lat).toFixed(4)}, {(selectedLocation.longitude || selectedLocation.lng).toFixed(4)}
                </span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Current User Location Marker */}
        {currentLocation && isValidCoordinate(currentLocation.lat, currentLocation.lng) && (
          <Marker position={[currentLocation.lat, currentLocation.lng]} icon={currentLocationIcon}>
            <Popup>
              <div style={{ textAlign: 'center', padding: '0.25rem' }}>
                <strong style={{ color: '#1E3A8A', display: 'block', fontSize: '0.9rem' }}>Your Current Location</strong>
                <span style={{ fontSize: '0.75rem', color: '#475569' }}>
                  {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
                </span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Real Emergency Incident Markers */}
        {showMarkers &&
          validMarkers.map((marker) => {
            const lat = Number(marker.lat ?? marker.latitude);
            const lng = Number(marker.lng ?? marker.longitude);
            const priorityStr = marker.priority || 'LOW';
            const markerIcon = createEmergencyMarkerIcon(priorityStr);
            const config = getPriorityBadgeConfig(priorityStr);

            const formattedTime = marker.createdAt
              ? new Date(marker.createdAt).toLocaleString(undefined, {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })
              : null;

            return (
              <Marker key={marker.id || marker.reportId} position={[lat, lng]} icon={markerIcon}>
                <Popup>
                  <div style={{ padding: '0.35rem 0.2rem', minWidth: '200px', fontFamily: 'inherit' }}>
                    {/* POPUP HEADER */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '0.5rem',
                        paddingBottom: '0.4rem',
                        borderBottom: '1px solid #E2E8F0',
                      }}
                    >
                      <strong style={{ fontSize: '0.95rem', color: '#0F172A', fontWeight: 800 }}>
                        {marker.reportId || `Report #${marker.id}`}
                      </strong>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor: config.bgColor,
                          color: '#FFFFFF',
                          letterSpacing: '0.03em',
                        }}
                      >
                        {priorityStr}
                      </span>
                    </div>

                    {/* PUBLIC SAFETY INFORMATION ONLY - NO CITIZEN PII */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.825rem', color: '#334155' }}>
                      <div>
                        <strong style={{ color: '#0F172A' }}>Category:</strong>{' '}
                        {marker.categoryDisplayName || marker.category || 'Emergency'}
                      </div>

                      <div>
                        <strong style={{ color: '#0F172A' }}>Status:</strong>{' '}
                        <span
                          style={{
                            fontWeight: 700,
                            color:
                              marker.status === 'RESOLVED' || marker.status === 'CLOSED'
                                ? '#16A34A'
                                : marker.status === 'IN_PROGRESS'
                                ? '#2563EB'
                                : '#D97706',
                          }}
                        >
                          {marker.statusDisplayName || marker.status || 'Submitted'}
                        </span>
                      </div>

                      {marker.address && (
                        <div>
                          <strong style={{ color: '#0F172A' }}>Location:</strong> {marker.address}
                        </div>
                      )}

                      {formattedTime && (
                        <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.2rem' }}>
                          <strong style={{ color: '#475569' }}>Reported:</strong> {formattedTime}
                        </div>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

        {/* Real Emergency Service Markers (Hospitals, Police, Fire Stations) */}
        {showServices &&
          validServiceMarkers.map((service) => {
            const serviceIcon = createServiceMarkerIcon(service.type);
            return (
              <Marker key={service.id} position={[service.lat, service.lng]} icon={serviceIcon}>
                <Popup>
                  <div style={{ padding: '0.35rem 0.2rem', minWidth: '220px', fontFamily: 'inherit' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '0.5rem',
                        paddingBottom: '0.4rem',
                        borderBottom: '1px solid #E2E8F0',
                      }}
                    >
                      <strong style={{ fontSize: '0.95rem', color: '#0F172A', fontWeight: 800 }}>
                        {service.name}
                      </strong>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.825rem', color: '#334155' }}>
                      <div>
                        <strong style={{ color: '#0F172A' }}>Type:</strong>{' '}
                        <span className="badge badge-blue" style={{ fontSize: '0.75rem' }}>
                          {service.iconSymbol} {service.typeLabel}
                        </span>
                      </div>

                      {service.distanceFormatted && (
                        <div>
                          <strong style={{ color: '#0F172A' }}>Distance:</strong>{' '}
                          <span style={{ fontWeight: 700, color: '#2563EB' }}>
                            {service.distanceFormatted}
                          </span>
                        </div>
                      )}

                      {service.address && service.address !== 'Address unavailable' && (
                        <div>
                          <strong style={{ color: '#0F172A' }}>Address:</strong> {service.address}
                        </div>
                      )}

                      {service.phone && (
                        <div>
                          <strong style={{ color: '#0F172A' }}>Phone:</strong> {service.phone}
                        </div>
                      )}

                      {service.openingHours && (
                        <div style={{ fontSize: '0.75rem', color: '#16A34A', fontWeight: 600 }}>
                          <strong>Hours:</strong> {service.openingHours}
                        </div>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>
    </div>
  );
};

export default SafeCityMap;

