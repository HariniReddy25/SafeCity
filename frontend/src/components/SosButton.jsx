import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from './Button';
import { triggerSosApi } from '../services/notificationService';
import { AlertOctagon, AlertTriangle, CheckCircle2, Loader2, MapPin, X, Ambulance } from 'lucide-react';

const SosButton = ({ variant = 'navbar' }) => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [coords, setCoords] = useState(null);
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [sosSuccess, setSosSuccess] = useState(null);
  const [error, setError] = useState('');

  const handleOpenSos = () => {
    setShowModal(true);
    setSosSuccess(null);
    setError('');

    // Attempt ONE-TIME geolocation capture if permitted
    if (navigator.geolocation) {
      setLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setAddress(`GPS: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
          setLocating(false);
        },
        () => {
          setLocating(false);
        },
        { timeout: 8000 }
      );
    }
  };

  const handleConfirmSos = async () => {
    setError('');

    if (!coords && !address.trim()) {
      setError('GPS location is unavailable. Please enter a valid landmark or street address below to send your SOS signal.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        latitude: coords ? coords.latitude : null,
        longitude: coords ? coords.longitude : null,
        address: address.trim() || (coords ? `GPS: ${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}` : ''),
        note: note.trim() || 'Immediate distress SOS signal requested by citizen.',
      };

      const response = await triggerSosApi(payload);
      setSosSuccess(response);
    } catch (err) {
      console.error('SOS dispatch failed:', err);
      setError(err.response?.data?.message || err.message || 'Failed to dispatch SOS alert. Please call emergency services (112/100/101).');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {variant === 'navbar' ? (
        <button
          onClick={handleOpenSos}
          style={{
            backgroundColor: '#DC2626',
            color: '#FFFFFF',
            fontWeight: 900,
            fontSize: '0.825rem',
            padding: '0.45rem 0.9rem',
            borderRadius: 'var(--radius-full)',
            border: 'none',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            boxShadow: '0 2px 8px rgba(220, 38, 38, 0.35)',
            letterSpacing: '0.04em',
            animation: 'pulse 2s infinite',
          }}
        >
          <AlertOctagon size={16} /> SOS DISTRESS
        </button>
      ) : (
        <Button variant="danger" size="lg" icon={AlertOctagon} onClick={handleOpenSos} style={{ width: '100%', backgroundColor: '#DC2626' }}>
          🚨 ACTIVATING EMERGENCY SOS SIGNAL
        </Button>
      )}

      {/* CONFIRMATION & DISPATCH MODAL */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(6px)',
            zIndex: 1100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              padding: '2rem',
              maxWidth: '500px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            {!sosSuccess ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #FEE2E2', paddingBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 900, color: '#991B1B', fontSize: '1.2rem' }}>
                    <AlertOctagon size={24} style={{ color: '#DC2626' }} />
                    <span>CONFIRM EMERGENCY SOS</span>
                  </div>
                  <button onClick={() => setShowModal(false)} disabled={loading} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#991B1B' }}>
                    <X size={20} />
                  </button>
                </div>

                <div style={{ backgroundColor: '#FEF2F2', border: '1.5px solid #FCA5A5', padding: '1rem', borderRadius: 'var(--radius-md)', color: '#991B1B', fontSize: '0.875rem', lineHeight: 1.45 }}>
                  <strong>⚠️ WARNING:</strong> Activating SOS will immediately dispatch a <strong>CRITICAL priority incident alert</strong> to all nearby First Responders and Admins with your location coordinates.
                </div>

                {locating && (
                  <div style={{ fontSize: '0.8rem', color: '#2563EB', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Loader2 size={16} className="animate-spin" /> Capturing one-time GPS coordinates...
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                    Emergency Address / Landmark:
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter street or landmark reference..."
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border-subtle)', fontSize: '0.875rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                    Distress Note (Optional):
                  </label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g. Trapped in car, Immediate police needed..."
                    style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border-subtle)', fontSize: '0.875rem' }}
                  />
                </div>

                {error && <div style={{ color: '#DC2626', fontSize: '0.825rem', fontWeight: 700 }}>{error}</div>}

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
                  <Button variant="outline" size="md" onClick={() => setShowModal(false)} disabled={loading}>
                    Cancel
                  </Button>
                  <Button variant="danger" size="md" icon={AlertOctagon} onClick={handleConfirmSos} disabled={loading} style={{ backgroundColor: '#DC2626' }}>
                    {loading ? 'Dispatching SOS Signal...' : 'CONFIRM & DISPATCH SOS'}
                  </Button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '9999px', backgroundColor: '#DC2626', color: '#FFF', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <AlertOctagon size={36} />
                </div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#991B1B', margin: '0 0 0.5rem 0' }}>
                  🚨 SOS DISTRESS DISPATCHED!
                </h2>
                <p style={{ fontSize: '0.9rem', color: '#7F1D1D', marginBottom: '1rem' }}>
                  Critical priority report reference: <strong>{sosSuccess.reportId}</strong>
                </p>
                <div style={{ backgroundColor: '#FEF2F2', padding: '0.85rem', borderRadius: 'var(--radius-md)', fontSize: '0.825rem', color: '#991B1B', marginBottom: '1.25rem' }}>
                  📞 If you need immediate telephone emergency assistance, call:
                  <div style={{ fontWeight: 800, marginTop: '0.35rem', fontSize: '0.9rem' }}>
                    National Dispatch: 112 | Police: 100 | Ambulance: 108
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Link to="/citizen/safety-map" onClick={() => setShowModal(false)}>
                    <Button variant="outline" size="md" icon={Ambulance}>
                      View Nearby Services
                    </Button>
                  </Link>
                  <Button variant="primary" size="md" onClick={() => setShowModal(false)} style={{ backgroundColor: '#1E3A8A' }}>
                    Close Notification
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default SosButton;
