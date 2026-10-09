import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  AlertTriangle,
  MapPin,
  Camera,
  Calendar,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  Compass,
  FileText,
  X,
  Sparkles,
  Check,
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import { submitReportApi } from '../services/api';
import { postAiReportAssistApi } from '../services/aiService';

const CATEGORIES = [
  { value: 'ROAD_ACCIDENT', label: 'Road Accident', icon: '🚗' },
  { value: 'FIRE', label: 'Fire Emergency', icon: '🔥' },
  { value: 'MEDICAL_EMERGENCY', label: 'Medical Emergency', icon: '🚑' },
  { value: 'CRIME', label: 'Crime / Theft', icon: '🛡️' },
  { value: 'SUSPICIOUS_ACTIVITY', label: 'Suspicious Activity', icon: '👁️' },
  { value: 'MISSING_PERSON', label: 'Missing Person', icon: '🔍' },
  { value: 'PUBLIC_SAFETY_HAZARD', label: 'Public Safety Hazard', icon: '⚠️' },
  { value: 'NATURAL_DISASTER', label: 'Natural Disaster', icon: '🌊' },
  { value: 'HARASSMENT', label: 'Harassment', icon: '📢' },
  { value: 'OTHER', label: 'Other Public Hazard', icon: '🚨' },
];

const PRIORITIES = [
  { value: 'LOW', label: 'Low', badgeClass: 'badge-blue' },
  { value: 'MEDIUM', label: 'Medium', badgeClass: 'badge-yellow' },
  { value: 'HIGH', label: 'High', badgeClass: 'badge-peach' },
  { value: 'CRITICAL', label: 'Critical', badgeClass: 'badge-pink' },
];

const ReportEmergencyPage = () => {
  const navigate = useNavigate();

  const [category, setCategory] = useState('ROAD_ACCIDENT');
  const [priority, setPriority] = useState('MEDIUM');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [incidentDateTime, setIncidentDateTime] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });

  // AI Assistance State (Phase 6)
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [showAiModal, setShowAiModal] = useState(false);

  const handleAiAssist = async () => {
    if (!description.trim()) return;
    setAiLoading(true);
    try {
      const response = await postAiReportAssistApi(description);
      setAiSuggestion(response);
      setShowAiModal(true);
    } catch (err) {
      console.error('AI assist failed:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleApplyAiSuggestion = () => {
    if (aiSuggestion) {
      if (aiSuggestion.enhancedDescription) {
        setDescription(aiSuggestion.enhancedDescription);
      }
      if (aiSuggestion.suggestedCategory) {
        setCategory(aiSuggestion.suggestedCategory.name || aiSuggestion.suggestedCategory);
      }
      if (aiSuggestion.suggestedPriority) {
        setPriority(aiSuggestion.suggestedPriority.name || aiSuggestion.suggestedPriority);
      }
    }
    setShowAiModal(false);
  };

  // Location state
  const [coords, setCoords] = useState(null); // { latitude, longitude }
  const [locating, setLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');

  // Evidence state
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Form submission state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successReport, setSuccessReport] = useState(null);

  // Geolocation API handler
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser. Please enter address manually.');
      return;
    }

    setLocating(true);
    setLocationStatus('Requesting GPS location permissions...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationStatus('GPS Coordinates captured successfully!');
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationStatus('Location permission denied. Please type your street address below.');
        } else {
          setLocationStatus('Unable to retrieve GPS coordinates. Please enter address manually.');
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Evidence file handler
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPG, PNG, or WEBP).');
      return;
    }

    // Validate size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image file size must be less than 5MB.');
      return;
    }

    setError('');
    setEvidenceFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const removeEvidence = () => {
    setEvidenceFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!description.trim()) {
      setError('Please describe the emergency incident.');
      return;
    }

    setSubmitting(true);

    try {
      const reportData = {
        category,
        priority,
        description: description.trim(),
        address: address.trim() || null,
        latitude: coords?.latitude || null,
        longitude: coords?.longitude || null,
        incidentDateTime: incidentDateTime ? new Date(incidentDateTime).toISOString() : null,
      };

      const result = await submitReportApi(reportData, evidenceFile);
      setSuccessReport(result);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to submit emergency report. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '780px', margin: '1rem auto 3rem auto' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Link to="/citizen/dashboard" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          Dashboard
        </Link>
        <span style={{ color: 'var(--text-muted)' }}>/</span>
        <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)' }}>
          Report Emergency
        </span>
      </div>

      <Card pastelBg="pink" hoverEffect={false}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(0, 0, 0, 0.08)', paddingBottom: '1.25rem' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <AlertTriangle size={28} style={{ color: '#9F1239' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#881337', margin: 0 }}>
              Report Public Emergency
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#9F1239', margin: '0.25rem 0 0 0' }}>
              Submit an emergency report to notify municipal authorities and dispatch first responders.
            </p>
          </div>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              color: '#881337',
              border: '1.5px solid #FCA5A5',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.9rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <AlertCircle size={20} style={{ color: 'var(--danger-accent)' }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* SECTION 1: INCIDENT CATEGORY & PRIORITY */}
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#881337', marginBottom: '0.75rem' }}>
              1. Incident Classification
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-main)' }}>
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid var(--border-subtle)',
                    fontSize: '0.95rem',
                    backgroundColor: '#FFFFFF',
                    outline: 'none',
                    fontWeight: 600,
                  }}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-main)' }}>
                  Initial Priority Level *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.35rem' }}>
                  {PRIORITIES.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setPriority(p.value)}
                      style={{
                        padding: '0.65rem 0.25rem',
                        borderRadius: 'var(--radius-md)',
                        border: priority === p.value ? '2px solid #881337' : '1px solid var(--border-subtle)',
                        backgroundColor: priority === p.value ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        color: priority === p.value ? '#881337' : 'var(--text-muted)',
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: DESCRIPTION & INCIDENT TIME */}
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#881337', marginBottom: '0.75rem' }}>
              2. Incident Description & Date/Time
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                    Detailed Emergency Description *
                  </label>
                  <Button
                    variant="outline"
                    type="button"
                    size="sm"
                    icon={Sparkles}
                    onClick={handleAiAssist}
                    disabled={aiLoading || !description.trim()}
                    style={{ fontSize: '0.775rem', borderColor: '#7C3AED', color: '#7C3AED' }}
                  >
                    {aiLoading ? 'Analyzing...' : 'Improve with AI'}
                  </Button>
                </div>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what happened, any visible hazards, or immediate assistance needed..."
                  required
                  style={{
                    width: '100%',
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid var(--border-subtle)',
                    fontSize: '0.95rem',
                    fontFamily: 'var(--font-body)',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-main)' }}>
                  Incident Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={incidentDateTime}
                  onChange={(e) => setIncidentDateTime(e.target.value)}
                  style={{
                    padding: '0.7rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid var(--border-subtle)',
                    fontSize: '0.95rem',
                    fontFamily: 'var(--font-body)',
                    backgroundColor: '#FFFFFF',
                  }}
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: LOCATION CAPTURE */}
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#881337', marginBottom: '0.75rem' }}>
              3. Location Coordinates & Address
            </h3>

            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={20} style={{ color: 'var(--danger-accent)' }} />
                  <span style={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    Browser Geolocation Service
                  </span>
                </div>

                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  icon={Compass}
                  onClick={handleGetLocation}
                  disabled={locating}
                >
                  {locating ? 'Capturing GPS...' : 'Use My Current Location'}
                </Button>
              </div>

              {locationStatus && (
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: coords ? '#15803D' : 'var(--text-muted)' }}>
                  {locationStatus}
                </div>
              )}

              {coords && (
                <div
                  style={{
                    backgroundColor: 'var(--pastel-mint)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    fontSize: '0.875rem',
                    color: '#14532D',
                  }}
                >
                  <div><strong>Latitude:</strong> {coords.latitude.toFixed(6)}</div>
                  <div><strong>Longitude:</strong> {coords.longitude.toFixed(6)}</div>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-main)' }}>
                  Street Address / Landmark Details
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 5th Avenue & Main Street, near City Park"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid var(--border-subtle)',
                    fontSize: '0.95rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: OPTIONAL EVIDENCE UPLOAD */}
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#881337', marginBottom: '0.75rem' }}>
              4. Evidence Upload (Optional Image)
            </h3>

            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                border: '1px dashed var(--border-subtle)',
                textAlign: 'center',
              }}
            >
              {previewUrl ? (
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <img
                    src={previewUrl}
                    alt="Evidence Preview"
                    style={{
                      maxHeight: '180px',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={removeEvidence}
                    style={{
                      position: 'absolute',
                      top: '-8px',
                      right: '-8px',
                      backgroundColor: 'var(--danger-accent)',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                  <Camera size={32} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary-accent)' }}>
                    Click to select an evidence photo
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Supports JPG, PNG, WEBP (Max 5MB)
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                </label>
              )}
            </div>
          </div>

          <Button
            type="submit"
            variant="danger"
            size="lg"
            icon={Send}
            disabled={submitting}
            style={{ width: '100%', marginTop: '0.5rem' }}
          >
            {submitting ? 'Submitting Emergency Report...' : 'Submit Emergency Report'}
          </Button>
        </form>
      </Card>

      {/* SUCCESS MODAL DIALOG */}
      {successReport && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
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
              maxWidth: '480px',
              width: '100%',
              boxShadow: 'var(--shadow-lg)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--pastel-mint)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}
            >
              <CheckCircle2 size={36} style={{ color: '#15803D' }} />
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              Report Submitted Successfully!
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Emergency dispatchers have been notified. Keep your Report ID for reference.
            </p>

            <div
              style={{
                backgroundColor: 'var(--pastel-blue)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1E40AF', textTransform: 'uppercase' }}>
                Unique Report ID
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1E3A8A', letterSpacing: '0.05em', marginTop: '0.25rem' }}>
                {successReport.reportId}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#1E40AF', marginTop: '0.25rem' }}>
                Category: <strong>{successReport.categoryDisplayName}</strong> | Initial Status: <strong>SUBMITTED</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <Link to={`/citizen/reports/${successReport.id}`}>
                <Button variant="primary" size="md">
                  View Report Details
                </Button>
              </Link>
              <Link to="/citizen/my-reports">
                <Button variant="outline" size="md">
                  My Reports List
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* AI SUGGESTIONS REVIEW MODAL */}
      {showAiModal && aiSuggestion && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
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
              maxWidth: '560px',
              width: '100%',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: '#581C87', fontSize: '1.1rem' }}>
                <Sparkles size={20} style={{ color: '#7C3AED' }} />
                <span>Review AI Report Suggestions</span>
              </div>
              <button onClick={() => setShowAiModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ backgroundColor: '#F3E8FF', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.825rem', color: '#6B21A8', fontWeight: 600 }}>
              ℹ️ Please review AI suggestions carefully. Click "Apply AI Suggestions" to accept or "Discard" to keep your original entry. AI will never submit a report automatically.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
              <div>
                <strong style={{ color: '#0F172A', display: 'block', marginBottom: '0.2rem' }}>Enhanced Description Preview:</strong>
                <div style={{ backgroundColor: '#F8FAFC', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid #E2E8F0', whiteSpace: 'pre-line', fontSize: '0.85rem', color: '#334155' }}>
                  {aiSuggestion.enhancedDescription}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <strong style={{ color: '#0F172A', display: 'block', marginBottom: '0.2rem' }}>Suggested Category:</strong>
                  <span className="badge badge-blue" style={{ fontSize: '0.8rem' }}>
                    {aiSuggestion.suggestedCategoryLabel || aiSuggestion.suggestedCategory}
                  </span>
                </div>

                <div>
                  <strong style={{ color: '#0F172A', display: 'block', marginBottom: '0.2rem' }}>Suggested Priority:</strong>
                  <span className="badge badge-pink" style={{ fontSize: '0.8rem' }}>
                    {aiSuggestion.suggestedPriority}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '0.75rem', borderTop: '1px solid #E2E8F0' }}>
              <Button variant="outline" size="md" onClick={() => setShowAiModal(false)}>
                Discard AI Suggestions
              </Button>
              <Button variant="primary" size="md" icon={Check} onClick={handleApplyAiSuggestion} style={{ backgroundColor: '#7C3AED' }}>
                Apply AI Suggestions
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportEmergencyPage;
