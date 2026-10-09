import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  getAdminReportByIdApi,
  updateReportStatusAdminApi,
  updateReportPriorityAdminApi,
  getAdminRespondersApi,
  assignResponderAdminApi,
  getReportResourcesAdminApi,
  getAvailableResourcesAdminApi,
  dispatchResourceAdminApi,
  releaseResourceAdminApi,
  getEvidenceUrl,
} from '../services/api';
import {
  ShieldAlert,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Image as ImageIcon,
  User,
  ShieldCheck,
  Zap,
  Check,
  UserPlus,
  Phone,
  Mail,
  Activity,
  History,
  Truck,
  Send,
  Unlink,
  Filter,
  Sparkles,
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

const PRIORITIES = [
  { key: 'LOW', label: 'Low', badge: 'badge-blue' },
  { key: 'MEDIUM', label: 'Medium', badge: 'badge-yellow' },
  { key: 'HIGH', label: 'High', badge: 'badge-peach' },
  { key: 'CRITICAL', label: 'Critical', badge: 'badge-pink' },
];

const getRecommendedTypes = (category) => {
  switch (category) {
    case 'FIRE':
      return ['FIRE_ENGINE'];
    case 'MEDICAL_EMERGENCY':
      return ['AMBULANCE'];
    case 'TRAFFIC_ACCIDENT':
      return ['AMBULANCE', 'POLICE_PATROL'];
    case 'CRIME_SECURITY':
      return ['POLICE_PATROL'];
    case 'HAZARDOUS_MATERIALS':
      return ['HAZMAT_UNIT'];
    case 'NATURAL_DISASTER':
    case 'INFRASTRUCTURE_FAILURE':
      return ['RESCUE_SQUAD'];
    default:
      return ['RESCUE_SQUAD', 'AMBULANCE', 'POLICE_PATROL', 'FIRE_ENGINE', 'HAZMAT_UNIT'];
  }
};

const AdminReportDetailsPage = () => {
  const { id } = useParams();

  const [report, setReport] = useState(null);
  const [responders, setResponders] = useState([]);
  const [selectedResponderId, setSelectedResponderId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Action states
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingPriority, setUpdatingPriority] = useState(false);
  const [assigningResponder, setAssigningResponder] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  // Resource dispatch state
  const [dispatchedResources, setDispatchedResources] = useState([]);
  const [availableResources, setAvailableResources] = useState([]);
  const [loadingResources, setLoadingResources] = useState(false);
  const [resourceError, setResourceError] = useState('');
  const [resourceSuccess, setResourceSuccess] = useState('');
  const [dispatchModalResource, setDispatchModalResource] = useState(null);
  const [releaseModalResource, setReleaseModalResource] = useState(null);
  const [dispatchOperatorId, setDispatchOperatorId] = useState('');
  const [dispatching, setDispatching] = useState(false);
  const [releasing, setReleasing] = useState(false);
  const [filterRecommendedOnly, setFilterRecommendedOnly] = useState(true);

  const fetchResources = async () => {
    setLoadingResources(true);
    setResourceError('');
    try {
      const [dispatched, available] = await Promise.all([
        getReportResourcesAdminApi(id),
        getAvailableResourcesAdminApi(),
      ]);
      setDispatchedResources(dispatched || []);
      setAvailableResources(available || []);
    } catch (err) {
      setResourceError(err.response?.data?.message || err.message || 'Failed to load physical resources.');
    } finally {
      setLoadingResources(false);
    }
  };

  const fetchReportDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const [data, respondersList] = await Promise.all([
        getAdminReportByIdApi(id),
        getAdminRespondersApi(),
      ]);
      setReport(data);
      setResponders(respondersList || []);
      if (respondersList && respondersList.length > 0) {
        const available = respondersList.find((r) => r.enabled);
        if (available) setSelectedResponderId(available.id.toString());
      }
      await fetchResources();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Report not found or access denied.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportDetails();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    setActionMessage('');
    setError('');
    try {
      const updated = await updateReportStatusAdminApi(id, newStatus);
      setReport(updated);
      setActionMessage(`Report status updated to ${updated.statusDisplayName}`);
      // Refresh resources because if status changed to RESOLVED/CLOSED, backend releases resources
      await fetchResources();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update report status.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handlePriorityChange = async (newPriority) => {
    setUpdatingPriority(true);
    setActionMessage('');
    setError('');
    try {
      const updated = await updateReportPriorityAdminApi(id, newPriority);
      setReport(updated);
      setActionMessage(`Operational priority updated to ${updated.priority}`);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update priority level.');
    } finally {
      setUpdatingPriority(false);
    }
  };

  const handleAssignResponder = async (e) => {
    e.preventDefault();
    if (!selectedResponderId) {
      setError('Please select a first responder to assign.');
      return;
    }

    setAssigningResponder(true);
    setActionMessage('');
    setError('');

    try {
      const updated = await assignResponderAdminApi(id, parseInt(selectedResponderId, 10));
      setReport(updated);
      setActionMessage(`Responder assigned successfully. Report status updated to ASSIGNED.`);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to assign responder.');
    } finally {
      setAssigningResponder(false);
    }
  };

  const handleConfirmDispatch = async () => {
    if (!dispatchModalResource) return;
    setDispatching(true);
    setResourceError('');
    setResourceSuccess('');
    try {
      const payload = dispatchOperatorId ? { operatorId: parseInt(dispatchOperatorId, 10) } : null;
      await dispatchResourceAdminApi(id, dispatchModalResource.id, payload);
      setResourceSuccess(`Resource ${dispatchModalResource.resourceCode} (${dispatchModalResource.name}) dispatched successfully to report ${report.reportId}!`);
      setDispatchModalResource(null);
      setDispatchOperatorId('');
      await fetchResources();
    } catch (err) {
      setResourceError(err.response?.data?.message || err.message || 'Failed to dispatch resource.');
    } finally {
      setDispatching(false);
    }
  };

  const handleConfirmRelease = async () => {
    if (!releaseModalResource) return;
    setReleasing(true);
    setResourceError('');
    setResourceSuccess('');
    try {
      await releaseResourceAdminApi(id, releaseModalResource.id);
      setResourceSuccess(`Resource ${releaseModalResource.resourceCode} (${releaseModalResource.name}) released successfully!`);
      setReleaseModalResource(null);
      await fetchResources();
    } catch (err) {
      setResourceError(err.response?.data?.message || err.message || 'Failed to release resource.');
    } finally {
      setReleasing(false);
    }
  };

  const getCurrentStepIndex = () => {
    if (!report) return 0;
    const index = STATUS_STEPS.findIndex((step) => step.key === report.status);
    return index !== -1 ? index : 0;
  };

  const recommendedTypes = report ? getRecommendedTypes(report.category) : [];

  const filteredAvailableResources = availableResources.filter((res) => {
    if (!filterRecommendedOnly) return true;
    return recommendedTypes.includes(res.type);
  });

  return (
    <div style={{ maxWidth: '920px', margin: '1rem auto 3rem auto' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/admin/reports">
          <Button variant="outline" size="sm" icon={ArrowLeft}>
            Back to Admin Reports
          </Button>
        </Link>
        <span className="badge badge-lavender">ADMIN INSPECTION</span>
      </div>

      {loading ? (
        <LoadingState message="Fetching admin report record..." />
      ) : error ? (
        <ErrorState title="Admin Report Error" message={error} onRetry={fetchReportDetails} />
      ) : report ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Action Notification Message */}
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
              <AlertCircle size={20} style={{ color: '#E11D48' }} />
              <span>{error}</span>
            </div>
          )}

          {/* Header Card */}
          <Card pastelBg="lavender" hoverEffect={false}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                  <span className="badge badge-blue">{report.categoryDisplayName}</span>
                  <span style={{ fontSize: '0.85rem', color: '#581C87' }}>
                    Citizen ID: <strong>#{report.citizenId}</strong>
                  </span>
                </div>
                <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#581C87', margin: 0 }}>
                  {report.reportId}
                </h1>
              </div>

              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <span className="badge badge-mint">{report.statusDisplayName}</span>
                <span className={`badge ${report.priority === 'CRITICAL' ? 'badge-pink' : 'badge-yellow'}`}>
                  Priority: {report.priority}
                </span>
                <SlaBadge report={report} />
              </div>
            </div>
          </Card>

          {/* FEATURE 5: EMERGENCY RESPONSE INTELLIGENCE & DECISION SUPPORT PANEL */}
          <EmergencyIntelligencePanel reportId={report.id} role="ADMIN" />

          {/* ADMIN ACTION CONTROLS PANEL */}
          <Card pastelBg="yellow" hoverEffect={false}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#713F12', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Zap size={20} style={{ color: '#854D0E' }} /> Admin Operations & Review Workflow
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {/* STATUS REVIEW WORKFLOW */}
              <div style={{ backgroundColor: '#FFFFFF', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.75rem' }}>
                  1. Report Review Workflow Status
                </label>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {report.status === 'SUBMITTED' && (
                    <Button
                      variant="primary"
                      size="md"
                      icon={ShieldCheck}
                      onClick={() => handleStatusChange('UNDER_REVIEW')}
                      disabled={updatingStatus}
                      style={{ width: '100%' }}
                    >
                      {updatingStatus ? 'Updating...' : 'Start Review (SUBMITTED → UNDER_REVIEW)'}
                    </Button>
                  )}

                  {report.status === 'UNDER_REVIEW' && (
                    <Button
                      variant="mint"
                      size="md"
                      icon={CheckCircle2}
                      onClick={() => handleStatusChange('VERIFIED')}
                      disabled={updatingStatus}
                      style={{ width: '100%', backgroundColor: '#DDF7E3', color: '#14532D', border: '1px solid #86EFAC' }}
                    >
                      {updatingStatus ? 'Updating...' : 'Verify Report (UNDER_REVIEW → VERIFIED)'}
                    </Button>
                  )}

                  {report.status !== 'SUBMITTED' && report.status !== 'UNDER_REVIEW' && (
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#15803D', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Check size={18} /> Verified Lifecycle Status: <strong>{report.statusDisplayName}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* AUTHORITATIVE PRIORITY MANAGEMENT */}
              <div style={{ backgroundColor: '#FFFFFF', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.75rem' }}>
                  2. Operational Priority Level
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem' }}>
                  {PRIORITIES.map((p) => (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => handlePriorityChange(p.key)}
                      disabled={updatingPriority}
                      style={{
                        padding: '0.65rem 0.25rem',
                        borderRadius: 'var(--radius-md)',
                        border: report.priority === p.key ? '2px solid #581C87' : '1px solid var(--border-subtle)',
                        backgroundColor: report.priority === p.key ? 'var(--pastel-lavender)' : '#FFFFFF',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        color: report.priority === p.key ? '#581C87' : 'var(--text-muted)',
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* RESPONDER ASSIGNMENT PANEL */}
          {report.status === 'VERIFIED' && (
            <Card pastelBg="mint" hoverEffect={false}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#14532D', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserPlus size={20} style={{ color: '#15803D' }} /> Emergency Responder Assignment
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#15803D', marginBottom: '1.25rem' }}>
                This report is VERIFIED and eligible for first-responder assignment. Select an available personnel from the roster below.
              </p>

              <form onSubmit={handleAssignResponder} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <select
                  value={selectedResponderId}
                  onChange={(e) => setSelectedResponderId(e.target.value)}
                  style={{
                    flex: 1,
                    minWidth: '240px',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid var(--border-subtle)',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  {responders
                    .filter((r) => r.enabled)
                    .map((resp) => (
                      <option key={resp.id} value={resp.id}>
                        {resp.fullName} ({resp.email}) — Active Workload: {resp.activeAssignmentsCount}
                      </option>
                    ))}
                </select>

                <Button variant="mint" size="md" icon={UserPlus} type="submit" disabled={assigningResponder} style={{ backgroundColor: '#15803D', color: '#FFFFFF' }}>
                  {assigningResponder ? 'Assigning...' : 'Confirm Assignment'}
                </Button>
              </form>
            </Card>
          )}

          {/* ASSIGNED RESPONDER DETAILS CARD */}
          {report.assignedResponderName && (
            <Card pastelBg="mint" hoverEffect={false}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#14532D', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={20} style={{ color: '#15803D' }} /> Assigned First Responder
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#14532D' }}>
                    {report.assignedResponderName}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#15803D', display: 'flex', gap: '1rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                    <span>Email: <strong>{report.assignedResponderEmail}</strong></span>
                    <span>Phone: <strong>{report.assignedResponderPhone || 'N/A'}</strong></span>
                  </div>
                </div>

                <span className="badge badge-mint">ASSIGNED TO INCIDENT</span>
              </div>
            </Card>
          )}

          {/* FEATURE 4 PHASE 3: PHYSICAL RESOURCE DISPATCH PANEL */}
          <Card pastelBg="blue" hoverEffect={false}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1E3A8A', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Truck size={22} style={{ color: '#2563EB' }} /> Physical Emergency Resource Dispatch Panel
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#3B82F6', margin: '0.25rem 0 0 0' }}>
                  Coordinate emergency vehicles, specialized equipment, and tactical units for this report.
                </p>
              </div>

              {recommendedTypes.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setFilterRecommendedOnly(!filterRecommendedOnly)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.45rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      border: '1.5px solid #93C5FD',
                      backgroundColor: filterRecommendedOnly ? '#DBEAFE' : '#FFFFFF',
                      color: '#1E40AF',
                      cursor: 'pointer',
                    }}
                  >
                    <Sparkles size={14} style={{ color: '#2563EB' }} />
                    {filterRecommendedOnly ? 'Recommended Units Only' : 'Showing All Available Units'}
                  </button>
                </div>
              )}
            </div>

            {/* Category Recommendation Banner */}
            <div
              style={{
                backgroundColor: '#EFF6FF',
                border: '1px solid #BFDBFE',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem 1rem',
                fontSize: '0.85rem',
                color: '#1E40AF',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                flexWrap: 'wrap',
              }}
            >
              <Sparkles size={18} style={{ color: '#2563EB', flexShrink: 0 }} />
              <div>
                Category <strong>{report.categoryDisplayName}</strong> recommended resource types:{' '}
                {recommendedTypes.map((t) => (
                  <span key={t} className="badge badge-blue" style={{ marginLeft: '0.35rem', fontSize: '0.75rem' }}>
                    {t.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>

            {/* Resource Feedback Messages */}
            {resourceSuccess && (
              <div
                style={{
                  backgroundColor: 'var(--pastel-mint)',
                  color: '#14532D',
                  border: '1.5px solid #86EFAC',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '1rem',
                }}
              >
                <CheckCircle2 size={18} style={{ color: '#15803D' }} />
                <span>{resourceSuccess}</span>
              </div>
            )}

            {resourceError && (
              <div
                style={{
                  backgroundColor: 'var(--pastel-pink)',
                  color: '#881337',
                  border: '1.5px solid #FDA4AF',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '1rem',
                }}
              >
                <AlertCircle size={18} style={{ color: '#E11D48' }} />
                <span>{resourceError}</span>
              </div>
            )}

            {/* SECTION 1: CURRENTLY DISPATCHED RESOURCES */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1E3A8A', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={16} style={{ color: '#16A34A' }} /> Assigned Physical Resources ({dispatchedResources.length})
              </h4>

              {dispatchedResources.length === 0 ? (
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
                        padding: '1rem',
                        border: '1.5px solid #86EFAC',
                        display: 'flex',
                        flexDirection: 'column',
                        justify: 'space-between',
                        gap: '0.75rem',
                        boxShadow: 'var(--shadow-sm)',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                          <span className="badge badge-mint">{res.resourceCode}</span>
                          <span className="badge badge-mint">{res.statusDisplayName || res.status}</span>
                        </div>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                          {res.name}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
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

                      <Button
                        variant="danger"
                        size="sm"
                        icon={Unlink}
                        onClick={() => setReleaseModalResource(res)}
                        style={{ width: '100%', fontSize: '0.8rem', backgroundColor: '#FEE2E2', color: '#991B1B', border: '1px solid #FCA5A5' }}
                      >
                        Release Unit
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SECTION 2: AVAILABLE RESOURCES FOR DISPATCH */}
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1E3A8A', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Send size={16} style={{ color: '#2563EB' }} /> Available Roster Units for Dispatch ({filteredAvailableResources.length})
              </h4>

              {loadingResources ? (
                <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Loading available resource inventory...
                </div>
              ) : filteredAvailableResources.length === 0 ? (
                <div style={{ backgroundColor: '#FFFFFF', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px dashed #93C5FD', textAlign: 'center', fontSize: '0.85rem', color: '#64748B' }}>
                  {filterRecommendedOnly
                    ? 'No recommended units currently available. Click "Showing All Available Units" above to view full fleet roster.'
                    : 'No available resources found in inventory roster.'}
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                  {filteredAvailableResources.map((res) => {
                    const isRecommended = recommendedTypes.includes(res.type);
                    return (
                      <div
                        key={res.id}
                        style={{
                          backgroundColor: '#FFFFFF',
                          borderRadius: 'var(--radius-md)',
                          padding: '1rem',
                          border: isRecommended ? '2px solid #60A5FA' : '1px solid var(--border-subtle)',
                          display: 'flex',
                          flexDirection: 'column',
                          justify: 'space-between',
                          gap: '0.75rem',
                          boxShadow: 'var(--shadow-sm)',
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                            <span className="badge badge-blue">{res.resourceCode}</span>
                            {isRecommended && (
                              <span className="badge badge-mint" style={{ fontSize: '0.7rem' }}>
                                RECOMMENDED
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                            {res.name}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                            Type: <strong>{res.typeDisplayName || res.type}</strong>
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Station: <strong>{res.stationLocation || 'N/A'}</strong>
                          </div>
                          {res.assignedOperatorName && (
                            <div style={{ fontSize: '0.8rem', color: '#2563EB', fontWeight: 600, marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                              <User size={14} /> Operator: {res.assignedOperatorName}
                            </div>
                          )}
                        </div>

                        <Button
                          variant="primary"
                          size="sm"
                          icon={Send}
                          onClick={() => {
                            setDispatchModalResource(res);
                            setDispatchOperatorId(res.assignedOperatorId ? res.assignedOperatorId.toString() : '');
                          }}
                          disabled={report.status === 'RESOLVED' || report.status === 'CLOSED'}
                          style={{ width: '100%', fontSize: '0.8rem' }}
                        >
                          Dispatch Unit
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>

          {/* DISPATCH CONFIRMATION MODAL */}
          {dispatchModalResource && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(15, 23, 42, 0.55)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justify: 'center',
                zIndex: 1000,
                padding: '1rem',
              }}
            >
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-lg)',
                  maxWidth: '480px',
                  width: '100%',
                  padding: '1.75rem',
                  boxShadow: 'var(--shadow-xl)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Truck size={22} style={{ color: '#2563EB' }} /> Confirm Resource Dispatch
                </h3>

                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                  Are you sure you want to dispatch this unit to emergency incident <strong>{report.reportId}</strong>?
                </p>

                <div
                  style={{
                    backgroundColor: 'var(--pastel-blue)',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #93C5FD',
                    fontSize: '0.875rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  <div><strong>Emergency Code:</strong> {report.reportId}</div>
                  <div><strong>Resource Code:</strong> {dispatchModalResource.resourceCode}</div>
                  <div><strong>Resource Name:</strong> {dispatchModalResource.name}</div>
                  <div><strong>Type:</strong> {dispatchModalResource.typeDisplayName || dispatchModalResource.type}</div>
                  <div><strong>Current Status:</strong> {dispatchModalResource.statusDisplayName || dispatchModalResource.status}</div>
                  <div><strong>Station Location:</strong> {dispatchModalResource.stationLocation || 'N/A'}</div>
                </div>

                {/* Optional Operator Select */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                    Assign/Confirm Tactical Operator (Optional)
                  </label>
                  <select
                    value={dispatchOperatorId}
                    onChange={(e) => setDispatchOperatorId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1.5px solid var(--border-subtle)',
                      fontSize: '0.875rem',
                      backgroundColor: '#FFFFFF',
                    }}
                  >
                    <option value="">No Operator Assigned</option>
                    {responders.map((resp) => (
                      <option key={resp.id} value={resp.id}>
                        {resp.fullName} ({resp.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <Button variant="outline" size="md" onClick={() => setDispatchModalResource(null)} disabled={dispatching}>
                    Cancel
                  </Button>
                  <Button variant="primary" size="md" icon={Send} onClick={handleConfirmDispatch} disabled={dispatching}>
                    {dispatching ? 'Dispatching...' : 'Confirm Dispatch'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* RELEASE CONFIRMATION MODAL */}
          {releaseModalResource && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(15, 23, 42, 0.55)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justify: 'center',
                zIndex: 1000,
                padding: '1rem',
              }}
            >
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-lg)',
                  maxWidth: '480px',
                  width: '100%',
                  padding: '1.75rem',
                  boxShadow: 'var(--shadow-xl)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#991B1B', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Unlink size={22} style={{ color: '#DC2626' }} /> Confirm Resource Release
                </h3>

                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                  Are you sure you want to release <strong>{releaseModalResource.resourceCode}</strong> ({releaseModalResource.name}) from emergency report <strong>{report.reportId}</strong>?
                </p>

                <div
                  style={{
                    backgroundColor: 'var(--pastel-pink)',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #FCA5A5',
                    fontSize: '0.875rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.4rem',
                    marginBottom: '1.5rem',
                    color: '#881337',
                  }}
                >
                  <div><strong>Resource Code:</strong> {releaseModalResource.resourceCode}</div>
                  <div><strong>Resource Name:</strong> {releaseModalResource.name}</div>
                  <div><strong>Target Status after release:</strong> AVAILABLE</div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <Button variant="outline" size="md" onClick={() => setReleaseModalResource(null)} disabled={releasing}>
                    Cancel
                  </Button>
                  <Button variant="danger" size="md" icon={Unlink} onClick={handleConfirmRelease} disabled={releasing}>
                    {releasing ? 'Releasing...' : 'Confirm Release'}
                  </Button>
                </div>
              </div>
            </div>
          )}

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

          {/* AUDIT STATUS HISTORY TIMELINE SECTION */}
          {report.statusHistory && report.statusHistory.length > 0 && (
            <Card hoverEffect={false}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <History size={20} style={{ color: 'var(--primary-accent)' }} /> Audit Status History Log
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {report.statusHistory.map((item) => (
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

          {/* DETAILS GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            <Card hoverEffect={false}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-main)' }}>
                Citizen & Incident Details
              </h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {report.description}
              </p>

              <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div><strong>Reporting Citizen:</strong> {report.citizenName}</div>
                <div><strong>Citizen Database ID:</strong> #{report.citizenId}</div>
                <div><strong>Incident Date/Time:</strong> {new Date(report.incidentDateTime).toLocaleString()}</div>
                <div><strong>Submitted On:</strong> {new Date(report.createdAt).toLocaleString()}</div>
                <div><strong>Last System Update:</strong> {report.updatedAt ? new Date(report.updatedAt).toLocaleString() : 'N/A'}</div>
              </div>
            </Card>

            <Card hoverEffect={false}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={20} style={{ color: 'var(--danger-accent)' }} /> Location & GPS Coordinates
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'block' }}>Address / Landmark:</span>
                  <strong>{report.address || 'Address not specified'}</strong>
                </div>

                {report.latitude && report.longitude ? (
                  <div
                    style={{
                      backgroundColor: 'var(--pastel-mint)',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.85rem',
                      color: '#14532D',
                    }}
                  >
                    <div><strong>Latitude:</strong> {report.latitude}</div>
                    <div><strong>Longitude:</strong> {report.longitude}</div>
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
          {report.evidencePath && (
            <Card hoverEffect={false}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ImageIcon size={20} style={{ color: 'var(--primary-accent)' }} /> Attached Image Evidence
              </h3>

              <div>
                <img
                  src={getEvidenceUrl(report.evidencePath)}
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
        </div>
      ) : null}
    </div>
  );
};

export default AdminReportDetailsPage;
