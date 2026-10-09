import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllReportsAdminApi } from '../services/api';
import { FileText, Search, Filter, ChevronRight, Calendar, Clock, MapPin, User, ArrowUpDown, ShieldAlert } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import SlaBadge from '../components/SlaBadge';

const AdminReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('NEWEST');

  const fetchAllReports = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllReportsAdminApi();
      setReports(data || []);
      setFilteredReports(data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch system emergency reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllReports();
  }, []);

  useEffect(() => {
    let result = [...reports];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.reportId?.toLowerCase().includes(q) ||
          r.citizenName?.toLowerCase().includes(q) ||
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

    if (priorityFilter !== 'ALL') {
      result = result.filter((r) => r.priority === priorityFilter);
    }

    // Sort order
    if (sortOrder === 'NEWEST') {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortOrder === 'OLDEST') {
      result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }

    setFilteredReports(result);
  }, [search, statusFilter, categoryFilter, priorityFilter, sortOrder, reports]);

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
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            System Emergency Reports Management
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: '0.25rem 0 0 0' }}>
            Full system inventory of citizen public safety and emergency reports.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="badge badge-lavender">ADMINISTRATION MODE</span>
        </div>
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
            placeholder="Search by Report ID, citizen, description, or address..."
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

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            style={{
              padding: '0.65rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--border-subtle)',
              fontSize: '0.875rem',
              fontWeight: 600,
              backgroundColor: '#FFFFFF',
            }}
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            style={{
              padding: '0.65rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--border-subtle)',
              fontSize: '0.875rem',
              fontWeight: 600,
              backgroundColor: '#FFFFFF',
            }}
          >
            <option value="NEWEST">Newest First</option>
            <option value="OLDEST">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <LoadingState message="Fetching system emergency reports..." />
      ) : error ? (
        <ErrorState title="Failed to Load Admin Reports" message={error} onRetry={fetchAllReports} />
      ) : filteredReports.length === 0 ? (
        <Card pastelBg="lavender" hoverEffect={false}>
          <div style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
            <ShieldAlert size={48} style={{ color: '#6B21A8', marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              No Reports Match Search Filters
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem' }}>
              Try adjusting your search criteria or resetting status/category dropdown filters.
            </p>
          </div>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredReports.map((report) => (
            <Card key={report.id} hoverEffect={true} style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1E3A8A' }}>
                      {report.reportId}
                    </span>
                    {getStatusBadge(report.status)}
                    {getPriorityBadge(report.priority)}
                    <SlaBadge report={report} />
                  </div>

                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {report.categoryDisplayName} — <span style={{ fontWeight: 500, color: 'var(--text-muted)' }}>Citizen: {report.citizenName}</span>
                  </div>

                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0, lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {report.description}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.8rem', color: 'var(--text-subtle)', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Calendar size={14} /> Created: {new Date(report.createdAt).toLocaleString()}
                    </span>
                    {report.address && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <MapPin size={14} /> {report.address}
                      </span>
                    )}
                  </div>
                </div>

                <Link to={`/admin/reports/${report.id}`}>
                  <Button variant="primary" size="sm" icon={ChevronRight}>
                    Inspect & Review
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

export default AdminReportsPage;
