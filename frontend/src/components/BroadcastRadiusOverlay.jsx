import React from 'react';
import { Circle, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Custom broadcast center marker icon
const createBroadcastIcon = (severity) => {
  const color = severity === 'CRITICAL' ? '#EF4444' : severity === 'WARNING' ? '#F59E0B' : '#3B82F6';
  
  const svgHtml = `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="${color}" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  `;

  return L.divIcon({
    html: svgHtml,
    className: 'broadcast-center-icon',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });
};

const BroadcastRadiusOverlay = ({ broadcasts = [] }) => {
  if (!broadcasts || broadcasts.length === 0) return null;

  return (
    <>
      {broadcasts.map((b) => {
        if (!b.centerLatitude || !b.centerLongitude || !b.active) return null;

        const color = b.severity === 'CRITICAL' ? '#EF4444' : b.severity === 'WARNING' ? '#F59E0B' : '#3B82F6';
        const fillColor = b.severity === 'CRITICAL' ? '#FCA5A5' : b.severity === 'WARNING' ? '#FDE68A' : '#BFDBFE';
        const radiusMeters = (b.radiusKm || 1) * 1000;

        return (
          <React.Fragment key={b.id}>
            {/* Radius Circle Overlay */}
            <Circle
              center={[b.centerLatitude, b.centerLongitude]}
              radius={radiusMeters}
              pathOptions={{
                color: color,
                fillColor: fillColor,
                fillOpacity: 0.25,
                weight: 2,
                dashArray: b.severity === 'CRITICAL' ? '6, 6' : undefined,
              }}
            />

            {/* Center Marker */}
            <Marker
              position={[b.centerLatitude, b.centerLongitude]}
              icon={createBroadcastIcon(b.severity)}
            >
              <Popup>
                <div style={{ maxWidth: '240px', padding: '0.2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                    <span
                      style={{
                        backgroundColor: color,
                        color: '#FFFFFF',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        padding: '0.15rem 0.4rem',
                        borderRadius: '4px',
                      }}
                    >
                      {b.severityDisplayName || b.severity}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>
                      {b.categoryDisplayName || b.category || 'CIVIL DEFENSE'}
                    </span>
                  </div>

                  <strong style={{ fontSize: '0.95rem', color: '#1E293B', display: 'block', marginBottom: '0.3rem' }}>
                    {b.title}
                  </strong>

                  <p style={{ fontSize: '0.8rem', color: '#475569', margin: '0 0 0.5rem 0', lineHeight: 1.4 }}>
                    {b.message}
                  </p>

                  <div style={{ fontSize: '0.75rem', color: '#0F172A', fontWeight: 700, backgroundColor: '#F1F5F9', padding: '0.3rem 0.5rem', borderRadius: '4px' }}>
                    Affected Radius: {b.radiusKm} km ({radiusMeters} meters)
                  </div>
                </div>
              </Popup>
            </Marker>
          </React.Fragment>
        );
      })}
    </>
  );
};

export default BroadcastRadiusOverlay;
