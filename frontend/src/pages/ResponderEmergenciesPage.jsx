import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAssignedEmergenciesApi } from '../services/api';
import { Ambulance, Search, Filter, ChevronRight, Calendar, Clock, MapPin, AlertTriangle, ShieldCheck } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import SlaBadge from '../components/SlaBadge';

const ResponderEmergenciesPage = () => {
  const [emergencies, setEmergencies] = useState([]);
  const [filteredEmergencies, setFilteredEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  const fetchEmergencies = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAssignedEmergenciesApi();
      setEmergencies(data || []);
      setFilteredEmergencies(data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch assigned emergencies.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmergencies();
  }, []);

  useEffect(() => {
    let result = [...emergencies];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.reportId?.toLowerCase().includes(q) ||
          e.description?.toLowerCase().includes(q) ||
          e.categoryDisplayName?.toLowerCase().includes(q) ||
          e.address?.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'ALL') {
      result = result.filter((e) => e.status === statusFilter);
    }

    if (priorityFilter !== 'ALL') {
      result = result.filter((e) => e.priority === priorityFilter);
    }

    setFilteredEmergencies(result);
  }, [search, statusFilter, priorityFilter, emergencies]);

  const getStatusBadge = (status) => {
    switch (status) {
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
            My Assigned Emergencies
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: '0.25rem 0 0 0' }}>
            Emergency response tasks assigned to your unit.
          </p>
        </div>

        <span className="badge badge-mint">DISPATCH ROSTER</span>
      </div>

      {/* Toolbar */}
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
            placeholder="Search assigned emergency by ID, category, or address..."
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
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
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
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <LoadingState message="Loading your assigned emergency tasks..." />
      ) : error ? (
        <ErrorState title="Failed to Load Emergencies" message={error} onRetry={fetchEmergencies} />
      ) : filteredEmergencies.length === 0 ? (
        <Card pastelBg="mint" hoverEffect={false}>
          <div style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
            <Ambulance size={48} style={{ color: '#15803D', marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              No emergencies are currently assigned to you.
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem' }}>
              When an administrator assigns a verified incident to your unit, it will appear here immediately.
            </p>
          </div>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredEmergencies.map((emergency) => (
            <Card key={emergency.id} hoverEffect={true} style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1E3A8A' }}>
                      {emergency.reportId}
                    </span>
                    {getStatusBadge(emergency.status)}
                    {getPriorityBadge(emergency.priority)}
                    <SlaBadge report={emergency} />
                  </div>

                  <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {emergency.categoryDisplayName} — <span style={{ fontWeight: 500, color: 'var(--text-muted)' }}>Citizen: {emergency.citizenName}</span>
                  </div>

                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0, lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {emergency.description}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.8rem', color: 'var(--text-subtle)', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Calendar size={14} /> Created: {new Date(emergency.createdAt).toLocaleString()}
                    </span>
                    {emergency.address && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <MapPin size={14} /> {emergency.address}
                      </span>
                    )}
                  </div>
                </div>

                <Link to={`/responder/emergencies/${emergency.id}`}>
                  <Button variant="primary" size="sm" icon={ChevronRight} style={{ backgroundColor: '#15803D', color: '#FFFFFF' }}>
                    Respond & Details
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

export default ResponderEmergenciesPage;
