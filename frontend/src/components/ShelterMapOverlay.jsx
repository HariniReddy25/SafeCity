import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const createShelterIcon = (status) => {
  let color = '#16A34A'; // Green for AVAILABLE
  if (status === 'FULL') color = '#D97706'; // Amber/Orange for FULL
  else if (status === 'EMERGENCY_ONLY') color = '#7C3AED'; // Purple
  else if (status === 'CLOSED' || status === 'MAINTENANCE') color = '#DC2626'; // Red

  const svgHtml = `
    <div style="
      background-color: ${color};
      width: 34px;
      height: 34px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid white;
      box-shadow: 0 3px 8px rgba(0,0,0,0.35);
    ">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    </div>
  `;

  return L.divIcon({
    html: svgHtml,
    className: 'custom-shelter-icon',
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -34],
  });
};

const ShelterMapOverlay = ({ shelters = [] }) => {
  if (!shelters || shelters.length === 0) return null;

  return (
    <>
      {shelters.map((shelter) => {
        if (
          shelter.latitude === null ||
          shelter.latitude === undefined ||
          shelter.longitude === null ||
          shelter.longitude === undefined
        ) {
          return null;
        }

        const icon = createShelterIcon(shelter.status);
        const occupancyRatio = shelter.capacity > 0 ? (shelter.currentOccupancy / shelter.capacity) * 100 : 0;

        return (
          <Marker
            key={shelter.id || shelter.shelterCode}
            position={[shelter.latitude, shelter.longitude]}
            icon={icon}
          >
            <Popup minWidth={240}>
              <div style={{ fontFamily: 'sans-serif', padding: '0.2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <strong style={{ fontSize: '0.75rem', color: '#6B7280', letterSpacing: '0.04em' }}>
                    {shelter.shelterCode}
                  </strong>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '10px',
                      backgroundColor:
                        shelter.status === 'AVAILABLE'
                          ? '#DCFCE7'
                          : shelter.status === 'FULL'
                          ? '#FEF3C7'
                          : shelter.status === 'EMERGENCY_ONLY'
                          ? '#F3E8FF'
                          : '#FEE2E2',
                      color:
                        shelter.status === 'AVAILABLE'
                          ? '#15803D'
                          : shelter.status === 'FULL'
                          ? '#92400E'
                          : shelter.status === 'EMERGENCY_ONLY'
                          ? '#6B21A8'
                          : '#991B1B',
                    }}
                  >
                    {shelter.statusDisplayName || shelter.status}
                  </span>
                </div>

                <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem', fontWeight: 800, color: '#111827' }}>
                  {shelter.name}
                </h4>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.78rem', color: '#4B5563' }}>
                  {shelter.address}
                </p>

                {/* Capacity Meter */}
                <div style={{ margin: '0.5rem 0', padding: '0.4rem 0.5rem', backgroundColor: '#F9FAFB', borderRadius: '6px', border: '1px solid #E5E7EB' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.2rem' }}>
                    <span>Occupancy:</span>
                    <span style={{ color: shelter.availableSlots > 0 ? '#16A34A' : '#DC2626' }}>
                      {shelter.currentOccupancy} / {shelter.capacity} ({shelter.availableSlots} slots left)
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '6px', backgroundColor: '#E5E7EB', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${Math.min(100, occupancyRatio)}%`,
                        height: '100%',
                        backgroundColor: occupancyRatio >= 100 ? '#EF4444' : occupancyRatio >= 80 ? '#F59E0B' : '#22C55E',
                        borderRadius: '3px',
                      }}
                    />
                  </div>
                </div>

                {shelter.facilities && (
                  <div style={{ fontSize: '0.72rem', color: '#374151', marginTop: '0.35rem' }}>
                    <strong>Facilities:</strong> {shelter.facilities}
                  </div>
                )}

                {shelter.contactPhone && (
                  <div style={{ fontSize: '0.72rem', color: '#2563EB', marginTop: '0.2rem', fontWeight: 600 }}>
                    📞 Helpline: {shelter.contactPhone}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
};

export default ShelterMapOverlay;
