import React, { useState, useEffect } from 'react';
import {
  getAllBroadcastsAdminApi,
  createBroadcastAdminApi,
  cancelBroadcastAdminApi,
} from '../services/api';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import SafeCityMap from '../components/SafeCityMap';
import {
  Radio,
  Plus,
  Ban,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Info,
  MapPin,
  Clock,
  Send,
  RefreshCw,
  Search,
  Filter,
} from 'lucide-react';

const CATEGORY_OPTIONS = [
  { value: 'PUBLIC_SAFETY_HAZARD', label: 'Public Safety Hazard' },
  { value: 'FIRE', label: 'Fire & Explosion' },
  { value: 'NATURAL_DISASTER', label: 'Natural Disaster' },
  { value: 'ROAD_ACCIDENT', label: 'Road Accident' },
  { value: 'CRIME', label: 'Crime / Active Threat' },
  { value: 'MEDICAL_EMERGENCY', label: 'Medical Crisis' },
  { value: 'HARASSMENT', label: 'Harassment / Safety Threat' },
  { value: 'SUSPICIOUS_ACTIVITY', label: 'Suspicious Activity' },
  { value: 'MISSING_PERSON', label: 'Missing Person' },
  { value: 'OTHER', label: 'Other Emergency' },
];

const AdminBroadcastCenterPage = () => {
  const [broadcasts, setBroadcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Form State
  const [form, setForm] = useState({
    title: '',
    message: '',
    severity: 'WARNING',
    category: 'PUBLIC_SAFETY_HAZARD',
    centerLatitude: '17.3850',
    centerLongitude: '78.4867',
    radiusKm: '5.0',
  });

  const [submitting, setSubmitting] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('ALL');

  const fetchBroadcasts = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllBroadcastsAdminApi();
      setBroadcasts(data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load emergency broadcasts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBroadcasts();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleMapClick = (lat, lon) => {
    setForm((prev) => ({
      ...prev,
      centerLatitude: lat.toFixed(6),
      centerLongitude: lon.toFixed(6),
    }));
  };

  const handleCreateBroadcast = async (e) => {
    e.preventDefault();
    setActionSuccess('');
    setError('');

    const latNum = parseFloat(form.centerLatitude);
    const lonNum = parseFloat(form.centerLongitude);
    const radNum = parseFloat(form.radiusKm);

    if (isNaN(latNum) || latNum < -90 || latNum > 90) {
      setError('Please enter a valid center latitude between -90.0 and 90.0.');
      return;
    }
    if (isNaN(lonNum) || lonNum < -180 || lonNum > 180) {
      setError('Please enter a valid center longitude between -180.0 and 180.0.');
      return;
    }
    if (isNaN(radNum) || radNum <= 0) {
      setError('Broadcast radius must be greater than zero.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: form.title.trim(),
        message: form.message.trim(),
        severity: form.severity,
        category: form.category,
        centerLatitude: latNum,
        centerLongitude: lonNum,
        radiusKm: radNum,
      };

      const newBroadcast = await createBroadcastAdminApi(payload);
      setActionSuccess(`Emergency Civil Defense Broadcast "${newBroadcast.title}" issued successfully!`);
      setForm({
        title: '',
        message: '',
        severity: 'WARNING',
        category: 'PUBLIC_SAFETY_HAZARD',
        centerLatitude: '17.3850',
        centerLongitude: '78.4867',
        radiusKm: '5.0',
      });
      fetchBroadcasts();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to issue emergency broadcast.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelBroadcast = async (id, title) => {
    if (!window.confirm(`Are you sure you want to CANCEL civil defense broadcast "${title}"? Citizens will no longer receive active alerts for this broadcast.`)) {
      return;
    }

    setCancellingId(id);
    setActionSuccess('');
    setError('');
    try {
      await cancelBroadcastAdminApi(id);
      setActionSuccess(`Civil defense broadcast "${title}" marked as CANCELLED.`);
      fetchBroadcasts();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to cancel broadcast.');
    } finally {
      setCancellingId(null);
    }
  };

  const filteredBroadcasts = broadcasts.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.senderName && b.senderName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSeverity = filterSeverity === 'ALL' || b.severity === filterSeverity;
    return matchesSearch && matchesSeverity;
  });

  return (
    <div style={{ maxWidth: '1100px', margin: '1rem auto 3rem auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
            <span className="badge badge-purple">CIVIL DEFENSE COMMAND</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>FEATURE 6 — PUBLIC SAFETY WARNING SYSTEM</span>
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Radio size={32} style={{ color: '#9333EA' }} /> Civil Defense Emergency Broadcast Center
          </h1>
        </div>

        <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchBroadcasts} disabled={loading}>
          Refresh List
        </Button>
      </div>

      {/* Action Banners */}
      {actionSuccess && (
        <div
          style={{
            backgroundColor: 'var(--pastel-mint)',
            color: '#14532D',
            border: '1.5px solid #86EFAC',
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            fontWeight: 700,
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <CheckCircle2 size={20} style={{ color: '#15803D' }} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {error && (
        <div
          style={{
            backgroundColor: 'var(--pastel-pink)',
            color: '#881337',
            border: '1.5px solid #FDA4AF',
            padding: '0.85rem 1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            fontWeight: 700,
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <AlertTriangle size={20} style={{ color: '#E11D48' }} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Form & List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* CREATE BROADCAST FORM */}
        <Card pastelBg="purple" hoverEffect={false}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#581C87', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={22} style={{ color: '#9333EA' }} /> Issue Civil Defense Warning
          </h3>

          <form onSubmit={handleCreateBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Title */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#581C87', marginBottom: '0.3rem' }}>
                Broadcast Title *
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleInputChange}
                placeholder="e.g. CIVIL DEFENSE ALERT: Chemical Hazard Emergency"
                required
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid #C084FC',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
            </div>

            {/* Severity & Category Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#581C87', marginBottom: '0.3rem' }}>
                  Severity Level *
                </label>
                <select
                  name="severity"
                  value={form.severity}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid #C084FC',
                    fontSize: '0.9rem',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  <option value="CRITICAL">CRITICAL (Crisis)</option>
                  <option value="WARNING">WARNING (High Alert)</option>
                  <option value="INFO">INFO (Notice)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#581C87', marginBottom: '0.3rem' }}>
                  Incident Category
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid #C084FC',
                    fontSize: '0.9rem',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  {CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Message Body */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#581C87', marginBottom: '0.3rem' }}>
                Public Safety Instructions & Message *
              </label>
              <textarea
                name="message"
                rows={3}
                value={form.message}
                onChange={handleInputChange}
                placeholder="e.g. Hazardous chemical fumes detected. All residents inside 5.0 km radius stay indoors with windows sealed."
                required
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid #C084FC',
                  fontSize: '0.9rem',
                  fontFamily: 'inherit',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* Lat / Lon / Radius Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#581C87', marginBottom: '0.2rem' }}>
                  Center Lat *
                </label>
                <input
                  type="number"
                  step="any"
                  name="centerLatitude"
                  value={form.centerLatitude}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.65rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid #C084FC',
                    fontSize: '0.85rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#581C87', marginBottom: '0.2rem' }}>
                  Center Lon *
                </label>
                <input
                  type="number"
                  step="any"
                  name="centerLongitude"
                  value={form.centerLongitude}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.65rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid #C084FC',
                    fontSize: '0.85rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#581C87', marginBottom: '0.2rem' }}>
                  Radius (km) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  name="radiusKm"
                  value={form.radiusKm}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.65rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid #C084FC',
                    fontSize: '0.85rem',
                  }}
                />
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              icon={Send}
              type="submit"
              disabled={submitting}
              style={{ backgroundColor: '#7E22CE', color: '#FFFFFF', marginTop: '0.5rem' }}
            >
              {submitting ? 'Transmitting Broadcast...' : 'Broadcast Emergency Warning'}
            </Button>
          </form>
        </Card>

        {/* MAP VISUALIZER FOR BROADCAST PICKER */}
        <Card hoverEffect={false}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <MapPin size={20} style={{ color: 'var(--primary-accent)' }} /> Geographic Center & Hazard Zone Visualizer
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.85rem' }}>
            Click anywhere on the map below to set the center latitude and longitude coordinates.
          </p>

          <SafeCityMap
            onLocationSelect={(lat, lon) => handleMapClick(lat, lon)}
            selectedLocation={
              form.centerLatitude && form.centerLongitude
                ? { latitude: parseFloat(form.centerLatitude), longitude: parseFloat(form.centerLongitude) }
                : null
            }
            height="340px"
          />
        </Card>
      </div>

      {/* BROADCAST INVENTORY ROSTER */}
      <Card hoverEffect={false}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              Civil Defense Broadcast History & Active Roster
            </h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Showing {filteredBroadcasts.length} of {broadcasts.length} total broadcasts
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Search input */}
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search title, message..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  paddingLeft: '2.2rem',
                  paddingRight: '0.75rem',
                  paddingTop: '0.45rem',
                  paddingBottom: '0.45rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--border-subtle)',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              />
            </div>

            {/* Severity Filter */}
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              style={{
                padding: '0.45rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--border-subtle)',
                fontSize: '0.85rem',
                backgroundColor: '#FFFFFF',
              }}
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="WARNING">WARNING</option>
              <option value="INFO">INFO</option>
            </select>
          </div>
        </div>

        {loading ? (
          <LoadingState message="Loading emergency broadcasts..." />
        ) : filteredBroadcasts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)', border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
            No emergency civil defense broadcasts match your criteria.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredBroadcasts.map((b) => {
              const isCritical = b.severity === 'CRITICAL';
              const isWarning = b.severity === 'WARNING';
              const badgeBg = isCritical ? 'badge-pink' : isWarning ? 'badge-yellow' : 'badge-blue';

              return (
                <div
                  key={b.id}
                  style={{
                    backgroundColor: b.active ? 'var(--bg-surface)' : '#F8FAFC',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.1rem 1.25rem',
                    border: b.active ? `1.5px solid ${isCritical ? '#F87171' : isWarning ? '#FBBF24' : '#60A5FA'}` : '1px solid var(--border-subtle)',
                    opacity: b.active ? 1 : 0.75,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.6rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span className={`badge ${badgeBg}`}>{b.severityDisplayName || b.severity}</span>
                      <span className={`badge ${b.active ? 'badge-mint' : 'badge-gray'}`}>
                        {b.active ? 'ACTIVE ALERT' : 'CANCELLED'}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                        Category: {b.categoryDisplayName || b.category || 'ALL'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Clock size={14} /> {new Date(b.createdAt).toLocaleString()}
                      </span>

                      {b.active && (
                        <Button
                          variant="outline"
                          size="sm"
                          icon={Ban}
                          onClick={() => handleCancelBroadcast(b.id, b.title)}
                          disabled={cancellingId === b.id}
                          style={{ color: '#DC2626', borderColor: '#FCA5A5' }}
                        >
                          {cancellingId === b.id ? 'Cancelling...' : 'Cancel Alert'}
                        </Button>
                      )}
                    </div>
                  </div>

                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                    {b.title}
                  </h4>

                  <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', margin: 0, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                    {b.message}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-light)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <div>
                      <Radio size={14} style={{ display: 'inline', marginRight: '0.3rem', verticalAlign: 'middle' }} />
                      Hazard Center: <strong>({b.centerLatitude}, {b.centerLongitude})</strong> — Radius: <strong>{b.radiusKm} km</strong>
                    </div>

                    {b.senderName && (
                      <div>
                        Sender: <strong>{b.senderName}</strong>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminBroadcastCenterPage;
