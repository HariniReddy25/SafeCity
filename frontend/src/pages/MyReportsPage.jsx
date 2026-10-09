import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyReportsApi } from '../services/api';
import { FileText, AlertTriangle, Filter, Search, ChevronRight, MapPin, Calendar, Clock, PlusCircle } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';

const MyReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getMyReportsApi();
      setReports(data || []);
      setFilteredReports(data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load emergency reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    let result = reports;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.reportId?.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q) ||
          r.categoryDisplayName?.toLowerCase().includes(q) ||
          r.address?.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'ALL') {
      result = result.filter((r) => r.status === statusFilter);
    }

    if (categoryFilter !== 'ALL') {
      result = result.filter((r) => r.category === categoryFilter);
    }

    setFilteredReports(result);
  }, [search, statusFilter, categoryFilter, reports]);

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
      case 'CLOSED':
        return <span className="badge badge-blue">Closed</span>;
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
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            My Emergency Reports
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: '0.25rem 0 0 0' }}>
            Track and monitor the status of your submitted emergency incidents.
          </p>
        </div>

        <Link to="/citizen/report-emergency">
          <Button variant="danger" size="md" icon={PlusCircle}>
            Report New Emergency
          </Button>
        </Link>
      </div>

      {/* Filter & Search Toolbar */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Report ID, category, or address..."
            style={{
              width: '100%',
              padding: '0.65rem 1rem 0.65rem 2.75rem',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--border-subtle)',
              fontSize: '0.9rem',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '0.65rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--border-subtle)',
              fontSize: '0.875rem',
              fontWeight: 600,
              backgroundColor: '#FFFFFF',
            }}
          >
            <option value="ALL">All Statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="VERIFIED">Verified</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{
              padding: '0.65rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--border-subtle)',
              fontSize: '0.875rem',
              fontWeight: 600,
              backgroundColor: '#FFFFFF',
            }}
          >
            <option value="ALL">All Categories</option>
            <option value="ROAD_ACCIDENT">Road Accident</option>
            <option value="FIRE">Fire</option>
            <option value="MEDICAL_EMERGENCY">Medical Emergency</option>
            <option value="CRIME">Crime</option>
            <option value="SUSPICIOUS_ACTIVITY">Suspicious Activity</option>
            <option value="MISSING_PERSON">Missing Person</option>
            <option value="PUBLIC_SAFETY_HAZARD">Public Hazard</option>
            <option value="HARASSMENT">Harassment</option>
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <LoadingState message="Fetching your emergency reports..." />
      ) : error ? (
        <ErrorState title="Failed to Load Reports" message={error} onRetry={fetchReports} />
      ) : filteredReports.length === 0 ? (
        <Card pastelBg="blue" hoverEffect={false}>
          <div style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
            <FileText size={48} style={{ color: 'var(--primary-accent)', marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              No Emergency Reports Found
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', marginBottom: '1.5rem' }}>
              {search || statusFilter !== 'ALL' || categoryFilter !== 'ALL'
                ? 'No reports match your current search filters.'
                : 'You have not submitted any public safety or emergency reports yet.'}
            </p>
            <Link to="/citizen/report-emergency">
              <Button variant="primary" size="md" icon={PlusCircle}>
                Report an Emergency Now
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredReports.map((report) => (
            <Card key={report.id} hoverEffect={true} style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E3A8A' }}>
                      {report.reportId}
                    </span>
                    {getStatusBadge(report.status)}
                    {getPriorityBadge(report.priority)}
                  </div>

                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {report.categoryDisplayName}
                  </div>

                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0, lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {report.description}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.8rem', color: 'var(--text-subtle)', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Calendar size={14} /> {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Clock size={14} /> {new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {report.address && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <MapPin size={14} /> {report.address}
                      </span>
                    )}
                  </div>
                </div>

                <Link to={`/citizen/reports/${report.id}`}>
                  <Button variant="outline" size="sm" icon={ChevronRight}>
                    View Details
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyReportsPage;
