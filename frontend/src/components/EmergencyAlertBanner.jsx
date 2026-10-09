import React, { useEffect, useState } from 'react';
import { getActiveBroadcastsPublicApi, getNearbyBroadcastsPublicApi } from '../services/api';
import { AlertTriangle, ShieldAlert, Info, X, MapPin, Radio, Clock } from 'lucide-react';

const EmergencyAlertBanner = ({ userLat, userLon, showAllActive = true }) => {
  const [broadcasts, setBroadcasts] = useState([]);
  const [dismissedIds, setDismissedIds] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBroadcasts = async () => {
    try {
      let data = [];
      if (userLat !== undefined && userLat !== null && userLon !== undefined && userLon !== null) {
        data = await getNearbyBroadcastsPublicApi(userLat, userLon);
      } else {
        data = await getActiveBroadcastsPublicApi();
      }
      setBroadcasts(data || []);
    } catch (err) {
      console.warn('Could not fetch active civil defense broadcasts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBroadcasts();
  }, [userLat, userLon]);

  const handleDismiss = (id) => {
    setDismissedIds((prev) => [...prev, id]);
  };

  const visibleBroadcasts = broadcasts.filter((b) => b.active && !dismissedIds.includes(b.id));

  if (loading || visibleBroadcasts.length === 0) return null;

  return (
    <div style={{ width: '100%', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {visibleBroadcasts.map((b) => {
        const isCritical = b.severity === 'CRITICAL';
        const isWarning = b.severity === 'WARNING';

        const bgColor = isCritical ? '#FEF2F2' : isWarning ? '#FFFBEB' : '#EFF6FF';
        const borderColor = isCritical ? '#F87171' : isWarning ? '#FBBF24' : '#60A5FA';
        const textColor = isCritical ? '#991B1B' : isWarning ? '#92400E' : '#1E40AF';
        const badgeBg = isCritical ? '#EF4444' : isWarning ? '#F59E0B' : '#3B82F6';
        const IconComponent = isCritical ? ShieldAlert : isWarning ? AlertTriangle : Info;

        return (
          <div
            key={b.id}
            style={{
              backgroundColor: bgColor,
              border: `1.5px solid ${borderColor}`,
              borderRadius: 'var(--radius-md, 10px)',
              padding: '1rem 1.25rem',
              color: textColor,
              boxShadow: 'var(--shadow-md, 0 4px 6px -1px rgba(0,0,0,0.1))',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              animation: 'slideDown 0.3s ease-out',
            }}
          >
            {/* Header row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <IconComponent size={22} style={{ color: badgeBg, flexShrink: 0 }} />
                <span
                  style={{
                    backgroundColor: badgeBg,
                    color: '#FFFFFF',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    padding: '0.2rem 0.55rem',
                    borderRadius: '4px',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  {b.severityDisplayName || b.severity}
                </span>

                <span style={{ fontSize: '0.8rem', fontWeight: 700, opacity: 0.85 }}>
                  {b.categoryDisplayName || b.category || 'CIVIL DEFENSE BROADCAST'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {b.distanceFromUserKm !== undefined && b.distanceFromUserKm !== null && (
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem', backgroundColor: 'rgba(255,255,255,0.7)', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                    <MapPin size={14} /> {b.distanceFromUserKm} km away
                  </span>
                )}

                <span style={{ fontSize: '0.75rem', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Clock size={13} /> {new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>

                <button
                  onClick={() => handleDismiss(b.id)}
                  title="Dismiss alert banner"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: textColor,
                    cursor: 'pointer',
                    padding: '0.2rem',
                    opacity: 0.7,
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Title & Body */}
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0 0 0.35rem 0', color: textColor }}>
                {b.title}
              </h4>
              <p style={{ fontSize: '0.9rem', margin: 0, lineHeight: 1.5, opacity: 0.95 }}>
                {b.message}
              </p>
            </div>

            {/* Radius info footer */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', opacity: 0.8, marginTop: '0.15rem' }}>
              <Radio size={14} />
              <span>Broadcast Hazard Radius: <strong>{b.radiusKm} km</strong> around ({b.centerLatitude}, {b.centerLongitude})</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default EmergencyAlertBanner;
