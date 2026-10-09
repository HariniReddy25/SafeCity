import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  getResponderEmergencyByIdApi,
  acceptEmergencyApi,
  startEmergencyResponseApi,
  resolveEmergencyApi,
  addResponseNoteApi,
  getReportResourcesAdminApi,
  getEvidenceUrl,
} from '../services/api';
import {
  Ambulance,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Image as ImageIcon,
  MessageSquare,
  Send,
  Zap,
  Play,
  Check,
  History,
  Truck,
  User,
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import SlaBadge from '../components/SlaBadge';
import EmergencyIntelligencePanel from '../components/EmergencyIntelligencePanel';

const STATUS_STEPS = [
  { key: 'SUBMITTED', label: 'Submitted' },
  { key: 'UNDER_REVIEW', label: 'Under Review' },
  { key: 'VERIFIED', label: 'Verified' },
  { key: 'ASSIGNED', label: 'Assigned' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'RESOLVED', label: 'Resolved' },
  { key: 'CLOSED', label: 'Closed' },
];

const ResponderEmergencyDetailsPage = () => {
  const { id } = useParams();

  const [emergency, setEmergency] = useState(null);
  const [dispatchedResources, setDispatchedResources] = useState([]);
  const [loadingResources, setLoadingResources] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Response notes state
  const [newNoteText, setNewNoteText] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  // Action states
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  const fetchEmergencyDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getResponderEmergencyByIdApi(id);
      setEmergency(data);

      // Fetch dispatched physical resources
      setLoadingResources(true);
      try {
        const resources = await getReportResourcesAdminApi(id);
        setDispatchedResources(resources || []);
      } catch (rErr) {
        console.warn('Could not fetch resources for report', rErr);
      } finally {
        setLoadingResources(false);
      }
    } catch (err) {
      if (err.response?.status === 403) {
        setError('Access Denied: You are not assigned to this emergency report.');
      } else {
        setError(err.response?.data?.message || err.message || 'Emergency incident not found.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmergencyDetails();
  }, [id]);

  const handleAcceptOrStart = async () => {
    setUpdatingStatus(true);
    setActionMessage('');
    setError('');
    try {
      const updated = await acceptEmergencyApi(id);
      setEmergency(updated);
      setActionMessage('Assignment accepted! Response status updated to IN_PROGRESS.');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update response status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleResolveEmergency = async () => {
    if (!window.confirm('Are you sure you want to mark this emergency incident as RESOLVED?')) {
      return;
    }

    setUpdatingStatus(true);
    setActionMessage('');
    setError('');
    try {
      const updated = await resolveEmergencyApi(id);
      setEmergency(updated);
      setActionMessage('Emergency incident marked as RESOLVED successfully.');
      // Refresh resources list as backend automatically releases resources on resolution
      try {
        const resources = await getReportResourcesAdminApi(id);
        setDispatchedResources(resources || []);
      } catch (rErr) {}
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to resolve emergency incident.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    setSubmittingNote(true);
    setActionMessage('');
    setError('');

    try {
      const savedNote = await addResponseNoteApi(id, newNoteText.trim());
      setEmergency((prev) => ({
        ...prev,
        notes: [...(prev.notes || []), savedNote],
      }));
      setNewNoteText('');
      setActionMessage('Operational response note added successfully.');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to add response note.');
    } finally {
      setSubmittingNote(false);
    }
  };

  const getCurrentStepIndex = () => {
    if (!emergency) return 0;
    const index = STATUS_STEPS.findIndex((step) => step.key === emergency.status);
    return index !== -1 ? index : 0;
  };

  return (
    <div style={{ maxWidth: '920px', margin: '1rem auto 3rem auto' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/responder/emergencies">
          <Button variant="outline" size="sm" icon={ArrowLeft}>
            Back to Assigned Emergencies
          </Button>
        </Link>
        <span className="badge badge-mint">RESPONDER ACTION CENTER</span>
      </div>

      {loading ? (
        <LoadingState message="Fetching assigned emergency incident..." />
      ) : error ? (
        <ErrorState title="Incident Access Error" message={error} onRetry={fetchEmergencyDetails} />
      ) : emergency ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Action Notification Banner */}
          {actionMessage && (
            <div
              style={{
                backgroundColor: 'var(--pastel-mint)',
                color: '#14532D',
                border: '1.5px solid #86EFAC',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.9rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <CheckCircle2 size={20} style={{ color: '#15803D' }} />
              <span>{actionMessage}</span>
            </div>
          )}

          {/* Action Error Message */}
          {error && (
            <div
              style={{
                backgroundColor: 'var(--pastel-pink)',
                color: '#881337',
                border: '1.5px solid #FDA4AF',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.9rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <AlertTriangle size={20} style={{ color: '#E11D48' }} />
              <span>{error}</span>
            </div>
          )}

          {/* Header Card */}
          <Card pastelBg="mint" hoverEffect={false}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                  <span className="badge badge-mint">ASSIGNED INCIDENT</span>
                  <span style={{ fontSize: '0.85rem', color: '#14532D' }}>
                    Category: <strong>{emergency.categoryDisplayName}</strong>
                  </span>
                </div>
                <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#14532D', margin: 0 }}>
                  {emergency.reportId}
                </h1>
              </div>

              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <span className="badge badge-mint">{emergency.statusDisplayName}</span>
                <span className={`badge ${emergency.priority === 'CRITICAL' ? 'badge-pink' : 'badge-yellow'}`}>
                  Priority: {emergency.priority}
                </span>
                <SlaBadge report={emergency} />
              </div>
            </div>
          </Card>

          {/* Emergency Response Intelligence Panel (Read-only for Responder) */}
          <EmergencyIntelligencePanel reportId={emergency.id} role="RESPONDER" />

          {/* RESPONDER DISPATCH ACTION CONTROLS PANEL */}
          <Card pastelBg="peach" hoverEffect={false}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#7C2D12', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Zap size={20} style={{ color: '#9A3412' }} /> Operational Incident Response Controls
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              {emergency.status === 'ASSIGNED' && (
                <Button
                  variant="primary"
                  size="lg"
                  icon={Play}
                  onClick={handleAcceptOrStart}
                  disabled={updatingStatus}
                  style={{ backgroundColor: '#EA580C', color: '#FFFFFF' }}
                >
                  {updatingStatus ? 'Updating Status...' : 'Accept Assignment & Start Response (ASSIGNED → IN_PROGRESS)'}
                </Button>
              )}

              {emergency.status === 'IN_PROGRESS' && (
                <Button
                  variant="mint"
                  size="lg"
                  icon={CheckCircle2}
                  onClick={handleResolveEmergency}
                  disabled={updatingStatus}
                  style={{ backgroundColor: '#15803D', color: '#FFFFFF' }}
                >
                  {updatingStatus ? 'Resolving...' : 'Mark Emergency Resolved (IN_PROGRESS → RESOLVED)'}
                </Button>
              )}

              {emergency.status === 'RESOLVED' && (
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#14532D', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Check size={22} /> Incident Successfully Resolved
                </div>
              )}
            </div>
          </Card>

          {/* READ-ONLY DISPATCHED PHYSICAL RESOURCES SECTION (REQUIREMENT 9) */}
          <Card pastelBg="blue" hoverEffect={false}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1E3A8A', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Truck size={20} style={{ color: '#2563EB' }} /> Dispatched Physical Resources (Read-Only)
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#3B82F6', marginBottom: '1rem' }}>
              Physical equipment and tactical units assigned to assist with this emergency response.
            </p>

            {loadingResources ? (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', padding: '0.5rem 0' }}>
                Checking dispatched physical resources...
              </div>
            ) : dispatchedResources.length === 0 ? (
              <div style={{ backgroundColor: '#FFFFFF', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px dashed #93C5FD', textAlign: 'center', fontSize: '0.85rem', color: '#64748B' }}>
                No physical resources currently dispatched to this emergency incident.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                {dispatchedResources.map((res) => (
                  <div
                    key={res.id}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.85rem 1rem',
                      border: '1.5px solid #93C5FD',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.4rem',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span className="badge badge-blue">{res.resourceCode}</span>
                      <span className="badge badge-mint">{res.statusDisplayName || res.status}</span>
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      {res.name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Type: <strong>{res.typeDisplayName || res.type}</strong>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Station: <strong>{res.stationLocation || 'N/A'}</strong>
                    </div>
                    {res.assignedOperatorName && (
                      <div style={{ fontSize: '0.8rem', color: '#15803D', fontWeight: 600, marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <User size={14} /> Operator: {res.assignedOperatorName}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* VISUAL RESOLUTION TIMELINE */}
          <Card hoverEffect={false}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--text-main)' }}>
              Emergency Incident Resolution Progress Timeline
            </h3>

            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', flexWrap: 'wrap', gap: '1rem' }}>
              {STATUS_STEPS.map((step, idx) => {
                const currentIndex = getCurrentStepIndex();
                const isCompleted = idx <= currentIndex;
                const isCurrent = idx === currentIndex;

                return (
                  <div
                    key={step.key}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.5rem',
                      flex: 1,
                      minWidth: '90px',
                    }}
                  >
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: isCompleted ? 'var(--pastel-mint)' : 'var(--border-light)',
                        border: isCurrent ? '2px solid #15803D' : '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        color: isCompleted ? '#14532D' : 'var(--text-muted)',
                      }}
                    >
                      {isCompleted ? '✓' : idx + 1}
                    </div>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: isCurrent ? 800 : 600,
                        color: isCurrent ? '#14532D' : 'var(--text-muted)',
                        textAlign: 'center',
                      }}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* AUDIT STATUS HISTORY TIMELINE SECTION (PHASE 4D) */}
          {emergency.statusHistory && emergency.statusHistory.length > 0 && (
            <Card hoverEffect={false}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <History size={20} style={{ color: 'var(--primary-accent)' }} /> Audit Status History Log
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {emergency.statusHistory.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.85rem 1rem',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.35rem',
                      fontSize: '0.875rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="badge badge-mint">{item.newStatusDisplayName}</span>
                        {item.previousStatusDisplayName && (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            (from {item.previousStatusDisplayName})
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                        {new Date(item.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <div style={{ color: 'var(--text-main)', fontWeight: 600 }}>
                      {item.reasonNote}
                    </div>

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Operator: <strong>{item.changedByName}</strong> ({item.changedByRole})
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* DETAILS & LOCATION GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            <Card hoverEffect={false}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-main)' }}>
                Citizen Description
              </h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {emergency.description}
              </p>

              <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div><strong>Reporting Citizen:</strong> {emergency.citizenName}</div>
                <div><strong>Incident Date/Time:</strong> {new Date(emergency.incidentDateTime).toLocaleString()}</div>
                <div><strong>Submitted On:</strong> {new Date(emergency.createdAt).toLocaleString()}</div>
              </div>
            </Card>

            <Card hoverEffect={false}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={20} style={{ color: 'var(--danger-accent)' }} /> Location & GPS Coordinates
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block' }}>Address / Landmark:</span>
                  <strong>{emergency.address || 'Address not specified'}</strong>
                </div>

                {emergency.latitude && emergency.longitude ? (
                  <div
                    style={{
                      backgroundColor: 'var(--pastel-mint)',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.85rem',
                      color: '#14532D',
                    }}
                  >
                    <div><strong>Latitude:</strong> {emergency.latitude}</div>
                    <div><strong>Longitude:</strong> {emergency.longitude}</div>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    GPS coordinates unavailable for this report.
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Evidence Image Preview */}
          {emergency.evidencePath && (
            <Card hoverEffect={false}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ImageIcon size={20} style={{ color: 'var(--primary-accent)' }} /> Attached Evidence Photo
              </h3>

              <div>
                <img
                  src={getEvidenceUrl(emergency.evidencePath)}
                  alt="Incident Evidence"
                  style={{
                    maxHeight: '360px',
                    width: 'auto',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                />
              </div>
            </Card>
          )}

          {/* CHRONOLOGICAL RESPONSE LOG NOTES SECTION */}
          <Card hoverEffect={false}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageSquare size={20} style={{ color: 'var(--primary-accent)' }} /> Responder Log Notes
            </h3>

            {/* Note Submission Form */}
            <form onSubmit={handleAddNote} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <textarea
                rows={3}
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Log operational update (e.g. Arrived on scene, deploying assistance, medical triage clear...)"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--border-subtle)',
                  fontSize: '0.9rem',
                  fontFamily: 'var(--font-body)',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="primary" size="sm" icon={Send} type="submit" disabled={submittingNote}>
                  {submittingNote ? 'Saving Note...' : 'Add Response Note'}
                </Button>
              </div>
            </form>

            {/* Chronological Notes Timeline */}
            {emergency.notes && emergency.notes.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {emergency.notes.map((note) => (
                  <div
                    key={note.id}
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.85rem 1rem',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.875rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                      <strong style={{ color: '#1E3A8A', fontSize: '0.85rem' }}>{note.responderName}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                        {new Date(note.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div style={{ color: 'var(--text-main)', lineHeight: 1.5 }}>
                      {note.noteText}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>
                No response notes logged for this incident yet.
              </div>
            )}
          </Card>
        </div>
      ) : null}
    </div>
  );
};

export default ResponderEmergencyDetailsPage;
