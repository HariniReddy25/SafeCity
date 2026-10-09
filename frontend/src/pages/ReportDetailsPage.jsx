import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getReportByIdApi, getEvidenceUrl } from '../services/api';
import {
  FileText,
  MapPin,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Image as ImageIcon,
  ShieldCheck,
  Compass,
  History,
  UserCheck,
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';

const STATUS_STEPS = [
  { key: 'SUBMITTED', label: 'Submitted' },
  { key: 'UNDER_REVIEW', label: 'Under Review' },
  { key: 'VERIFIED', label: 'Verified' },
  { key: 'ASSIGNED', label: 'Assigned' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'RESOLVED', label: 'Resolved' },
  { key: 'CLOSED', label: 'Closed' },
];

const ReportDetailsPage = () => {
  const { id } = useParams();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReport = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getReportByIdApi(id);
      setReport(data);
    } catch (err) {
      if (err.response?.status === 403) {
        setError('Access Denied: You do not have permission to view another citizen’s emergency report.');
      } else {
        setError(err.response?.data?.message || err.message || 'Report not found or unavailable.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [id]);

  const getCurrentStepIndex = () => {
    if (!report) return 0;
    const index = STATUS_STEPS.findIndex((step) => step.key === report.status);
    return index !== -1 ? index : 0;
  };

  return (
    <div style={{ maxWidth: '840px', margin: '1rem auto 3rem auto' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Link to="/citizen/my-reports">
          <Button variant="outline" size="sm" icon={ArrowLeft}>
            Back to My Reports
          </Button>
        </Link>
      </div>

      {loading ? (
        <LoadingState message="Loading emergency report details..." />
      ) : error ? (
        <ErrorState title="Report Access Error" message={error} onRetry={fetchReport} />
      ) : report ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Header Card */}
          <Card pastelBg="blue" hoverEffect={false}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
                  <span className="badge badge-blue">OFFICIAL REPORT</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Category: <strong>{report.categoryDisplayName}</strong>
                  </span>
                </div>
                <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#1E3A8A', margin: 0 }}>
                  {report.reportId}
                </h1>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span className="badge badge-mint">{report.statusDisplayName}</span>
                <span className={`badge ${report.priority === 'CRITICAL' ? 'badge-pink' : 'badge-yellow'}`}>
                  Priority: {report.priority}
                </span>
              </div>
            </div>
          </Card>

          {/* VISUAL STATUS TIMELINE */}
          <Card hoverEffect={false}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--text-main)' }}>
              Emergency Incident Resolution Timeline
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

          {/* Report Details & Location */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            <Card hoverEffect={false}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-main)' }}>
                Incident Description
              </h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {report.description}
              </p>

              <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)', fontSize: '0.825rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div><strong>Submitted By:</strong> {report.citizenName}</div>
                <div><strong>Submitted On:</strong> {new Date(report.createdAt).toLocaleString()}</div>
                <div><strong>Incident Time:</strong> {new Date(report.incidentDateTime).toLocaleString()}</div>
              </div>
            </Card>

            <Card hoverEffect={false}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={20} style={{ color: 'var(--danger-accent)' }} /> Location & Address
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

          {/* AUDIT STATUS HISTORY TIMELINE SECTION (PHASE 4D) */}
          {report.statusHistory && report.statusHistory.length > 0 && (
            <Card hoverEffect={false}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <History size={20} style={{ color: 'var(--primary-accent)' }} /> Status Audit History Log
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
                      Updated by: <strong>{item.changedByName}</strong> ({item.changedByRole})
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

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
                    maxHeight: '340px',
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

export default ReportDetailsPage;
