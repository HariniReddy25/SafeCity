import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getPotentialDuplicatesAdminApi,
  mergeReportsAdminApi,
  getMasterIncidentByIdAdminApi,
  unmergeReportAdminApi,
} from '../services/api';
import {
  Layers,
  AlertTriangle,
  MapPin,
  Clock,
  Calendar,
  User,
  Shield,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ChevronRight,
  GitMerge,
  Unlink,
  RefreshCw,
  Info,
  Eye,
  FileText,
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';

const AdminDuplicatesPage = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Merge modal state
  const [mergeModalPair, setMergeModalPair] = useState(null);
  const [selectedMasterId, setSelectedMasterId] = useState(null);
  const [merging, setMerging] = useState(false);

  // View Reports modal state (for side-by-side inspection)
  const [viewReportsModalPair, setViewReportsModalPair] = useState(null);

  // Master Incident details view state
  const [activeMasterIncident, setActiveMasterIncident] = useState(null);
  const [unmergingId, setUnmergingId] = useState(null);

  const fetchCandidates = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getPotentialDuplicatesAdminApi();
      setCandidates(data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch potential duplicate report candidates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const openMergeModal = (pair) => {
    setMergeModalPair(pair);
    // Default the first report (Report A) as Master
    setSelectedMasterId(pair.reportA.id);
  };

  const closeMergeModal = () => {
    setMergeModalPair(null);
    setSelectedMasterId(null);
  };

  const handleExecuteMerge = async () => {
    if (!mergeModalPair || !selectedMasterId) return;

    setMerging(true);
    setError('');
    setSuccessMsg('');

    const duplicateId = selectedMasterId === mergeModalPair.reportA.id ? mergeModalPair.reportB.id : mergeModalPair.reportA.id;

    try {
      const masterIncidentResult = await mergeReportsAdminApi(selectedMasterId, [duplicateId]);
      setSuccessMsg(`Successfully created Master Incident ${masterIncidentResult.masterCode}! Reports have been grouped.`);
      closeMergeModal();
      // Display resulting Master Incident clearly
      setActiveMasterIncident(masterIncidentResult);
      // Refresh candidate list after merge
      fetchCandidates();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to merge emergency reports.');
    } finally {
      setMerging(false);
    }
  };

  const handleUnmergeReport = async (masterId, reportId) => {
    if (!window.confirm(`Are you sure you want to unmerge Report #${reportId} from Master Incident #${masterId}?`)) {
      return;
    }

    setUnmergingId(reportId);
    setError('');
    try {
      const updatedMaster = await unmergeReportAdminApi(masterId, reportId);
      setActiveMasterIncident(updatedMaster);
      setSuccessMsg(`Report #${reportId} unlinked successfully from Master Incident ${updatedMaster.masterCode}.`);
      fetchCandidates();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to unmerge report.');
    } finally {
      setUnmergingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SUBMITTED':
        return <span className="badge badge-blue">Submitted</span>;
      case 'UNDER_REVIEW':
        return <span className="badge badge-yellow">Under Review</span>;
      case 'VERIFIED':
        return <span className="badge badge-mint">Verified</span>;
      case 'ASSIGNED':
        return <span className="badge badge-lavender">Assigned</span>;
      case 'IN_PROGRESS':
        return <span className="badge badge-peach">In Progress</span>;
      case 'RESOLVED':
        return <span className="badge badge-mint">Resolved</span>;
      default:
        return <span className="badge badge-blue">{status}</span>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'CRITICAL':
        return <span className="badge badge-pink">CRITICAL</span>;
      case 'HIGH':
        return <span className="badge badge-peach">HIGH</span>;
      case 'MEDIUM':
        return <span className="badge badge-yellow">MEDIUM</span>;
      case 'LOW':
        return <span className="badge badge-blue">LOW</span>;
      default:
        return null;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <GitMerge size={28} style={{ color: '#7C3AED' }} />
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              Duplicate Incident Review & Merger
            </h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: '0.35rem 0 0 0' }}>
            Review potential duplicate emergency report clusters flagged by spatio-temporal algorithms (Distance &le; 500m, Time &le; 30 mins).
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchCandidates}>
            Refresh Candidates
          </Button>
          <span className="badge badge-lavender">ADMINISTRATION MODE</span>
        </div>
      </div>

      {/* Alert Banners */}
      {successMsg && (
        <div
          style={{
            backgroundColor: '#DCFCE7',
            color: '#14532D',
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid #86EFAC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 600 }}>
            <CheckCircle2 size={20} style={{ color: '#16A34A' }} />
            {successMsg}
          </div>
          <button
            onClick={() => setSuccessMsg('')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, color: '#14532D' }}
          >
            &times;
          </button>
        </div>
      )}

      {error && (
        <div
          style={{
            backgroundColor: '#FEF2F2',
            color: '#991B1B',
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid #FCA5A5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 600 }}>
            <AlertTriangle size={20} style={{ color: '#DC2626' }} />
            {error}
          </div>
          <button
            onClick={() => setError('')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, color: '#991B1B' }}
          >
            &times;
          </button>
        </div>
      )}

      {/* Detection Config & Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        <Card pastelBg="lavender" hoverEffect={false}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#6B21A8', textTransform: 'uppercase' }}>
                Flagged Duplicate Candidates
              </div>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                {candidates.length}
              </div>
            </div>
            <GitMerge size={36} style={{ color: '#7C3AED', opacity: 0.8 }} />
          </div>
        </Card>

        <Card pastelBg="mint" hoverEffect={false}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#14532D', textTransform: 'uppercase' }}>
                Distance Threshold
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                &le; 500 Meters
              </div>
            </div>
            <MapPin size={34} style={{ color: '#16A34A', opacity: 0.8 }} />
          </div>
        </Card>

        <Card pastelBg="blue" hoverEffect={false}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1E40AF', textTransform: 'uppercase' }}>
                Time Window Threshold
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                &le; 30 Minutes
              </div>
            </div>
            <Clock size={34} style={{ color: '#2563EB', opacity: 0.8 }} />
          </div>
        </Card>
      </div>

      {/* MANAGE MASTER INCIDENT SECTION (Visible when a Master Incident has been merged or selected) */}
      {activeMasterIncident && (
        <Card pastelBg="lavender" style={{ padding: '1.75rem', border: '2px solid #7C3AED' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Layers size={30} style={{ color: '#7C3AED' }} />
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#6B21A8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Manage Master Incident
                </div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#4C1D95', margin: 0 }}>
                  Master Incident: {activeMasterIncident.masterCode}
                </h2>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span className="badge badge-lavender" style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                {activeMasterIncident.linkedReportsCount} Linked Reports
              </span>
              <Button variant="outline" size="sm" onClick={() => setActiveMasterIncident(null)}>
                Hide Management Panel
              </Button>
            </div>
          </div>

          {/* Master Incident Summary Grid */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              boxShadow: 'var(--shadow-sm)',
              marginBottom: '1.5rem',
            }}
          >
            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>
                Category
              </span>
              <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '1rem' }}>
                {activeMasterIncident.categoryDisplayName}
              </span>
            </div>

            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>
                Status
              </span>
              <div style={{ marginTop: '0.2rem' }}>{getStatusBadge(activeMasterIncident.status)}</div>
            </div>

            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>
                Priority
              </span>
              <div style={{ marginTop: '0.2rem' }}>{getPriorityBadge(activeMasterIncident.priority)}</div>
            </div>

            <div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>
                Assigned Responder
              </span>
              <span style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '1rem' }}>
                {activeMasterIncident.assignedResponderName || 'Unassigned'}
              </span>
            </div>
          </div>

          {/* Linked Reports List & Unmerge Actions */}
          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#4C1D95', marginBottom: '1rem' }}>
              Linked Emergency Reports ({activeMasterIncident.linkedReportsCount})
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {activeMasterIncident.linkedReports?.map((report) => (
                <div
                  key={report.id}
                  style={{
                    padding: '1.15rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <div style={{ flex: 1, minWidth: '260px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                      <span style={{ fontWeight: 800, color: '#1E3A8A', fontSize: '1.05rem' }}>
                        {report.reportId}
                      </span>
                      {getStatusBadge(report.status)}
                      {getPriorityBadge(report.priority)}
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Citizen: <strong>{report.citizenName}</strong>
                      </span>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
                      "{report.description}"
                    </p>
                    {report.address && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', marginTop: '0.35rem' }}>
                        <MapPin size={13} inline /> {report.address}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Link to={`/admin/reports/${report.id}`} target="_blank">
                      <Button variant="outline" size="sm" icon={ExternalLink}>
                        View Details
                      </Button>
                    </Link>

                    <Button
                      variant="outline"
                      size="sm"
                      icon={Unlink}
                      onClick={() => handleUnmergeReport(activeMasterIncident.id, report.id)}
                      disabled={unmergingId === report.id}
                      style={{ color: '#DC2626', borderColor: '#FCA5A5' }}
                    >
                      {unmergingId === report.id ? 'Unlinking...' : 'Unmerge Report'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Candidate List / Empty State */}
      {loading ? (
        <LoadingState message="Scanning emergency reports for potential duplicate candidates..." />
      ) : candidates.length === 0 ? (
        <Card pastelBg="mint" hoverEffect={false}>
          <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
            <CheckCircle2 size={52} style={{ color: '#16A34A', marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              No Duplicate Candidate Pairs Detected
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '520px', margin: '0 auto' }}>
              All submitted citizen emergency reports currently represent distinct spatio-temporal incidents. No duplicate pairs matching distance (&le;500m) and time (&le;30m) thresholds were found.
            </p>
          </div>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {candidates.map((pair, index) => (
            <Card key={index} style={{ padding: '1.75rem', border: '1.5px solid var(--border-subtle)' }} hoverEffect={false}>
              {/* Candidate Pair Header Badge */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  paddingBottom: '1rem',
                  marginBottom: '1.25rem',
                  borderBottom: '1px dashed var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span className="badge badge-lavender" style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                    <GitMerge size={14} /> Potential Duplicate Pair #{index + 1}
                  </span>
                  <span className="badge badge-peach" style={{ fontSize: '0.85rem' }}>
                    <MapPin size={13} /> Distance: {pair.distanceMeters}m
                  </span>
                  <span className="badge badge-yellow" style={{ fontSize: '0.85rem' }}>
                    <Clock size={13} /> Time Diff: {pair.timeDifferenceMinutes} mins
                  </span>
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Report A ID: <strong>#{pair.reportA.id}</strong> | Report B ID: <strong>#{pair.reportB.id}</strong>
                </div>
              </div>

              {/* Match Reason Banner */}
              <div
                style={{
                  backgroundColor: 'var(--pastel-lavender)',
                  color: '#6B21A8',
                  padding: '0.65rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <Info size={16} /> Detection Rule Match: {pair.matchReason}
              </div>

              {/* Side-by-side Report Comparison Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
                {/* Report A Card */}
                <div
                  style={{
                    backgroundColor: 'rgba(248, 250, 252, 0.85)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E3A8A' }}>
                      Report A: {pair.reportA.reportId}
                    </span>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      {getStatusBadge(pair.reportA.status)}
                      {getPriorityBadge(pair.reportA.priority)}
                    </div>
                  </div>

                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    Category: {pair.reportA.categoryDisplayName}
                  </div>

                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0, backgroundColor: '#FFFFFF', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', lineHeight: 1.5 }}>
                    "{pair.reportA.description}"
                  </p>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <div><User size={13} inline /> Citizen: <strong>{pair.reportA.citizenName}</strong></div>
                    <div><Calendar size={13} inline /> Reported: {new Date(pair.reportA.createdAt).toLocaleString()}</div>
                    {pair.reportA.address && <div><MapPin size={13} inline /> Address: {pair.reportA.address}</div>}
                  </div>

                  <div style={{ marginTop: '0.5rem' }}>
                    <Link to={`/admin/reports/${pair.reportA.id}`} target="_blank">
                      <Button variant="outline" size="sm" icon={ExternalLink}>
                        Inspect Report A Details
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Report B Card */}
                <div
                  style={{
                    backgroundColor: 'rgba(248, 250, 252, 0.85)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E3A8A' }}>
                      Report B: {pair.reportB.reportId}
                    </span>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      {getStatusBadge(pair.reportB.status)}
                      {getPriorityBadge(pair.reportB.priority)}
                    </div>
                  </div>

                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    Category: {pair.reportB.categoryDisplayName}
                  </div>

                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0, backgroundColor: '#FFFFFF', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', lineHeight: 1.5 }}>
                    "{pair.reportB.description}"
                  </p>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <div><User size={13} inline /> Citizen: <strong>{pair.reportB.citizenName}</strong></div>
                    <div><Calendar size={13} inline /> Reported: {new Date(pair.reportB.createdAt).toLocaleString()}</div>
                    {pair.reportB.address && <div><MapPin size={13} inline /> Address: {pair.reportB.address}</div>}
                  </div>

                  <div style={{ marginTop: '0.5rem' }}>
                    <Link to={`/admin/reports/${pair.reportB.id}`} target="_blank">
                      <Button variant="outline" size="sm" icon={ExternalLink}>
                        Inspect Report B Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* CANDIDATE ACTION AREA (After the two report cards) */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  marginTop: '1.5rem',
                  padding: '1.25rem',
                  backgroundColor: 'var(--pastel-lavender)',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid #DDD6FE',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <strong style={{ fontSize: '0.95rem', color: '#581C87' }}>Action Options:</strong>

                  {/* [ View Reports ] button group */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Eye}
                      onClick={() => setViewReportsModalPair(pair)}
                      style={{ backgroundColor: '#FFFFFF', color: '#581C87', fontWeight: 600 }}
                    >
                      View Reports
                    </Button>
                    <Link to={`/admin/reports/${pair.reportA.id}`} target="_blank">
                      <Button variant="outline" size="sm" icon={FileText} style={{ backgroundColor: '#FFFFFF' }}>
                        View Report A (#{pair.reportA.reportId})
                      </Button>
                    </Link>
                    <Link to={`/admin/reports/${pair.reportB.id}`} target="_blank">
                      <Button variant="outline" size="sm" icon={FileText} style={{ backgroundColor: '#FFFFFF' }}>
                        View Report B (#{pair.reportB.reportId})
                      </Button>
                    </Link>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  {activeMasterIncident && (
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Layers}
                      onClick={() => window.scrollTo({ top: 300, behavior: 'smooth' })}
                      style={{ backgroundColor: '#FFFFFF', color: '#7C3AED' }}
                    >
                      Manage Master Incident
                    </Button>
                  )}

                  {/* [ Merge Reports ] primary action button */}
                  <Button
                    variant="primary"
                    size="md"
                    icon={GitMerge}
                    onClick={() => openMergeModal(pair)}
                    style={{ backgroundColor: '#7C3AED', color: '#FFFFFF', fontWeight: 700 }}
                  >
                    Merge Reports
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* VIEW REPORTS SIDE-BY-SIDE MODAL */}
      {viewReportsModalPair && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            zIndex: 1000,
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '920px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2rem',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Eye size={24} style={{ color: '#7C3AED' }} />
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  Side-by-Side Candidate Report Inspection
                </h3>
              </div>
              <button
                onClick={() => setViewReportsModalPair(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: 'var(--text-muted)' }}
              >
                &times;
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.25rem' }}>
              {/* Detailed View Report A */}
              <div style={{ backgroundColor: 'var(--pastel-blue)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h4 style={{ margin: 0, fontWeight: 800, color: '#1E3A8A' }}>
                    Report A: #{viewReportsModalPair.reportA.reportId}
                  </h4>
                  {getStatusBadge(viewReportsModalPair.reportA.status)}
                </div>
                <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#1E40AF' }}>
                  Category: <strong>{viewReportsModalPair.reportA.categoryDisplayName}</strong>
                </div>
                <div style={{ backgroundColor: '#FFFFFF', padding: '1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                  "{viewReportsModalPair.reportA.description}"
                </div>
                <div style={{ fontSize: '0.8rem', color: '#1E40AF', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <div>Citizen: {viewReportsModalPair.reportA.citizenName} ({viewReportsModalPair.reportA.citizenEmail || 'Verified'})</div>
                  <div>Reported: {new Date(viewReportsModalPair.reportA.createdAt).toLocaleString()}</div>
                  {viewReportsModalPair.reportA.address && <div>Location: {viewReportsModalPair.reportA.address}</div>}
                </div>
                <div style={{ marginTop: '1rem' }}>
                  <Link to={`/admin/reports/${viewReportsModalPair.reportA.id}`} target="_blank">
                    <Button variant="primary" size="sm" icon={ExternalLink}>
                      Open Full Report Page
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Detailed View Report B */}
              <div style={{ backgroundColor: 'var(--pastel-lavender)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h4 style={{ margin: 0, fontWeight: 800, color: '#581C87' }}>
                    Report B: #{viewReportsModalPair.reportB.reportId}
                  </h4>
                  {getStatusBadge(viewReportsModalPair.reportB.status)}
                </div>
                <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#6B21A8' }}>
                  Category: <strong>{viewReportsModalPair.reportB.categoryDisplayName}</strong>
                </div>
                <div style={{ backgroundColor: '#FFFFFF', padding: '1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', marginBottom: '0.75rem' }}>
                  "{viewReportsModalPair.reportB.description}"
                </div>
                <div style={{ fontSize: '0.8rem', color: '#6B21A8', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <div>Citizen: {viewReportsModalPair.reportB.citizenName} ({viewReportsModalPair.reportB.citizenEmail || 'Verified'})</div>
                  <div>Reported: {new Date(viewReportsModalPair.reportB.createdAt).toLocaleString()}</div>
                  {viewReportsModalPair.reportB.address && <div>Location: {viewReportsModalPair.reportB.address}</div>}
                </div>
                <div style={{ marginTop: '1rem' }}>
                  <Link to={`/admin/reports/${viewReportsModalPair.reportB.id}`} target="_blank">
                    <Button variant="primary" size="sm" icon={ExternalLink}>
                      Open Full Report Page
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <Button variant="outline" onClick={() => setViewReportsModalPair(null)}>
                Close Inspection
              </Button>
              <Button
                variant="primary"
                icon={GitMerge}
                onClick={() => {
                  const p = viewReportsModalPair;
                  setViewReportsModalPair(null);
                  openMergeModal(p);
                }}
              >
                Proceed to Merge Reports
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MERGE MODAL */}
      {mergeModalPair && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            zIndex: 1000,
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '640px',
              width: '100%',
              padding: '2rem',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <GitMerge size={24} style={{ color: '#7C3AED' }} />
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  Confirm Emergency Incident Merge
                </h3>
              </div>
              <button
                onClick={closeMergeModal}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: 'var(--text-muted)' }}
              >
                &times;
              </button>
            </div>

            <div
              style={{
                backgroundColor: 'var(--pastel-blue)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                color: '#1E40AF',
                lineHeight: 1.5,
              }}
            >
              <strong>Merge Guarantee:</strong> Combining these reports will link them under a single operational <strong>Master Incident</strong> (`MI-yyyy-xxxxxx`). Both original citizen reports, descriptions, evidence, and timestamps will remain 100% intact.
            </div>

            <div>
              <label style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.6rem', display: 'block' }}>
                Choose Primary Master Report:
              </label>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {/* Master Choice: Report A */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: selectedMasterId === mergeModalPair.reportA.id ? '2px solid #7C3AED' : '1px solid var(--border-subtle)',
                    backgroundColor: selectedMasterId === mergeModalPair.reportA.id ? 'var(--pastel-lavender)' : '#FFFFFF',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="masterReport"
                    value={mergeModalPair.reportA.id}
                    checked={selectedMasterId === mergeModalPair.reportA.id}
                    onChange={() => setSelectedMasterId(mergeModalPair.reportA.id)}
                    style={{ marginTop: '0.2rem' }}
                  />
                  <div>
                    <div style={{ fontWeight: 800, color: '#1E3A8A' }}>
                      Master: Report A (#{mergeModalPair.reportA.reportId}) &mdash; {mergeModalPair.reportA.categoryDisplayName}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      Duplicate Report: #{mergeModalPair.reportB.reportId} will be linked to this Master Incident.
                    </div>
                  </div>
                </label>

                {/* Master Choice: Report B */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: selectedMasterId === mergeModalPair.reportB.id ? '2px solid #7C3AED' : '1px solid var(--border-subtle)',
                    backgroundColor: selectedMasterId === mergeModalPair.reportB.id ? 'var(--pastel-lavender)' : '#FFFFFF',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="masterReport"
                    value={mergeModalPair.reportB.id}
                    checked={selectedMasterId === mergeModalPair.reportB.id}
                    onChange={() => setSelectedMasterId(mergeModalPair.reportB.id)}
                    style={{ marginTop: '0.2rem' }}
                  />
                  <div>
                    <div style={{ fontWeight: 800, color: '#1E3A8A' }}>
                      Master: Report B (#{mergeModalPair.reportB.reportId}) &mdash; {mergeModalPair.reportB.categoryDisplayName}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      Duplicate Report: #{mergeModalPair.reportA.reportId} will be linked to this Master Incident.
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <Button variant="outline" onClick={closeMergeModal} disabled={merging}>
                Cancel
              </Button>
              <Button variant="primary" icon={GitMerge} onClick={handleExecuteMerge} disabled={merging}>
                {merging ? 'Merging Reports...' : 'Confirm & Merge Reports'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDuplicatesPage;
