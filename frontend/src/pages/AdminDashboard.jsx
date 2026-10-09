import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAdminDashboardSummaryApi, getAllReportsAdminApi } from '../services/api';
import {
  ShieldAlert,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Activity,
  ChevronRight,
  RefreshCw,
  Copy,
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';

const AdminDashboard = () => {
  const { user } = useAuth();

  const [summary, setSummary] = useState(null);
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAdminData = async () => {
    setLoading(true);
    setError('');
    try {
      const [summaryData, reportsData] = await Promise.all([
        getAdminDashboardSummaryApi(),
        getAllReportsAdminApi(),
      ]);
      setSummary(summaryData);
      setRecentReports(reportsData ? reportsData.slice(0, 6) : []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load admin summary statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* HERO BANNER */}
      <div
        style={{
          backgroundColor: 'var(--pastel-lavender)',
          borderRadius: 'var(--radius-lg)',
          padding: '2.5rem 2rem',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.25rem',
        }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
            <span className="badge badge-lavender">COMMAND CENTER</span>
            <span style={{ fontSize: '0.8rem', color: '#581C87' }}>SafeCity Admin Operations</span>
          </div>
          <h1 style={{ fontSize: '2.2rem', color: '#581C87', fontWeight: 800, margin: 0 }}>
            Welcome, {user?.fullName || 'Chief Admin Officer'}
          </h1>
          <p style={{ color: '#4C1D95', fontSize: '0.95rem', marginTop: '0.4rem', maxWidth: '640px' }}>
            System-wide emergency command center. Review citizen incident submissions, verify operational validity, and adjust priority levels.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={loadAdminData}>
            Refresh Statistics
          </Button>
          <Link to="/admin/duplicates">
            <Button variant="secondary" size="md" icon={Copy}>
              Duplicate Review
            </Button>
          </Link>
          <Link to="/admin/reports">
            <Button variant="primary" size="md" icon={FileText}>
              Manage All Reports
            </Button>
          </Link>
        </div>
      </div>

      {/* SUMMARY STATISTICS CARDS (MYSQL BACKEND COUNTS) */}
      <div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem' }}>
          Real-Time Command Metrics
        </h3>

        {loading ? (
          <LoadingState message="Calculating real-time admin statistics..." />
        ) : error ? (
          <ErrorState title="Admin Dashboard Error" message={error} onRetry={loadAdminData} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
            <Card pastelBg="blue" hoverEffect={true}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1E40AF', textTransform: 'uppercase' }}>
                Total Reports
              </div>
              <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#1E3A8A', margin: '0.25rem 0' }}>
                {summary?.totalReports ?? 0}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#1E40AF' }}>All system submissions</div>
            </Card>

            <Card pastelBg="yellow" hoverEffect={true}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#854D0E', textTransform: 'uppercase' }}>
                Submitted
              </div>
              <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#713F12', margin: '0.25rem 0' }}>
                {summary?.submittedReports ?? 0}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#854D0E' }}>Awaiting initial review</div>
            </Card>

            <Card pastelBg="peach" hoverEffect={true}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#9A3412', textTransform: 'uppercase' }}>
                Under Review
              </div>
              <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#7C2D12', margin: '0.25rem 0' }}>
                {summary?.underReviewReports ?? 0}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#9A3412' }}>Being inspected by admin</div>
            </Card>

            <Card pastelBg="mint" hoverEffect={true}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#15803D', textTransform: 'uppercase' }}>
                Verified Reports
              </div>
              <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#14532D', margin: '0.25rem 0' }}>
                {summary?.verifiedReports ?? 0}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#15803D' }}>Confirmed emergencies</div>
            </Card>

            <Card pastelBg="lavender" hoverEffect={true}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#6B21A8', textTransform: 'uppercase' }}>
                Active Emergencies
              </div>
              <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#581C87', margin: '0.25rem 0' }}>
                {summary?.activeReports ?? 0}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#6B21A8' }}>Unresolved incidents</div>
            </Card>

            <Card pastelBg="mint" hoverEffect={true}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#15803D', textTransform: 'uppercase' }}>
                Resolved Incidents
              </div>
              <div style={{ fontSize: '2.4rem', fontWeight: 800, color: '#14532D', margin: '0.25rem 0' }}>
                {summary?.resolvedReports ?? 0}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#15803D' }}>Closed & completed</div>
            </Card>
          </div>
        )}
      </div>

      {/* RECENT EMERGENCY REPORTS */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            Recent Emergency System Reports
          </h3>
          <Link to="/admin/reports" style={{ fontSize: '0.875rem', fontWeight: 700, color: '#2563EB' }}>
            View All Reports ({summary?.totalReports ?? 0}) →
          </Link>
        </div>

        {recentReports.length === 0 ? (
          <Card hoverEffect={false}>
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
              No emergency reports currently stored in system database.
            </div>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {recentReports.map((report) => (
              <Card key={report.id} hoverEffect={true} style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                      <strong style={{ fontSize: '1.05rem', color: '#1E3A8A' }}>{report.reportId}</strong>
                      {getStatusBadge(report.status)}
                      {getPriorityBadge(report.priority)}
                    </div>
                    <div style={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {report.categoryDisplayName} — <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>Reported by {report.citizenName}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', marginTop: '0.2rem' }}>
                      Created: {new Date(report.createdAt).toLocaleString()} | Address: {report.address || 'GPS Only'}
                    </div>
                  </div>

                  <Link to={`/admin/reports/${report.id}`}>
                    <Button variant="outline" size="sm" icon={ChevronRight}>
                      Review Report
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
