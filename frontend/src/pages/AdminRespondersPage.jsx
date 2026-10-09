import React, { useEffect, useState } from 'react';
import { getAdminRespondersApi } from '../services/api';
import { ShieldCheck, User, Mail, Phone, Search, Filter, Activity, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';

const AdminRespondersPage = () => {
  const [responders, setResponders] = useState([]);
  const [filteredResponders, setFilteredResponders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter states
  const [search, setSearch] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('ALL');

  const fetchResponders = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAdminRespondersApi();
      setResponders(data || []);
      setFilteredResponders(data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch first responder roster.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResponders();
  }, []);

  useEffect(() => {
    let result = [...responders];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.fullName?.toLowerCase().includes(q) ||
          r.email?.toLowerCase().includes(q) ||
          r.phoneNumber?.toLowerCase().includes(q)
      );
    }

    if (availabilityFilter === 'AVAILABLE') {
      result = result.filter((r) => r.enabled && r.activeAssignmentsCount === 0);
    } else if (availabilityFilter === 'BUSY') {
      result = result.filter((r) => r.enabled && r.activeAssignmentsCount > 0);
    } else if (availabilityFilter === 'DISABLED') {
      result = result.filter((r) => !r.enabled);
    }

    setFilteredResponders(result);
  }, [search, availabilityFilter, responders]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            First Responder Roster & Workload
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: '0.25rem 0 0 0' }}>
            Monitor emergency response personnel availability and active assignment workloads.
          </p>
        </div>

        <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchResponders}>
          Refresh Roster
        </Button>
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
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search responder by name, email, or phone..."
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

        <select
          value={availabilityFilter}
          onChange={(e) => setAvailabilityFilter(e.target.value)}
          style={{
            padding: '0.65rem 1rem',
            borderRadius: 'var(--radius-md)',
            border: '1.5px solid var(--border-subtle)',
            fontSize: '0.875rem',
            fontWeight: 600,
            backgroundColor: '#FFFFFF',
          }}
        >
          <option value="ALL">All Responders</option>
          <option value="AVAILABLE">Available (0 Active)</option>
          <option value="BUSY">Busy (1+ Active)</option>
          <option value="DISABLED">Disabled Accounts</option>
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingState message="Fetching first responder personnel..." />
      ) : error ? (
        <ErrorState title="Failed to Load Responders" message={error} onRetry={fetchResponders} />
      ) : filteredResponders.length === 0 ? (
        <Card pastelBg="mint" hoverEffect={false}>
          <div style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
            <ShieldCheck size={48} style={{ color: '#15803D', marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              No Responders Found
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem' }}>
              No responder personnel match the current search or status filter.
            </p>
          </div>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {filteredResponders.map((responder) => (
            <Card key={responder.id} hoverEffect={true} style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--pastel-mint)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        color: '#14532D',
                        fontSize: '1.1rem',
                      }}
                    >
                      {responder.fullName?.charAt(0) || 'R'}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                        {responder.fullName}
                      </h4>
                      <span className="badge badge-mint" style={{ marginTop: '0.2rem', display: 'inline-flex' }}>
                        FIRST RESPONDER
                      </span>
                    </div>
                  </div>

                  <span className={`badge ${responder.enabled ? (responder.activeAssignmentsCount === 0 ? 'badge-blue' : 'badge-yellow') : 'badge-pink'}`}>
                    {responder.enabled ? (responder.activeAssignmentsCount === 0 ? 'AVAILABLE' : 'BUSY') : 'DISABLED'}
                  </span>
                </div>

                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Mail size={15} /> {responder.email}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Phone size={15} /> {responder.phoneNumber || 'Phone not listed'}
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.85rem 1rem',
                    border: '1px solid var(--border-subtle)',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    textAlign: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1E3A8A' }}>
                      {responder.activeAssignmentsCount}
                    </div>
                    <div style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Active
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#713F12' }}>
                      {responder.totalAssignmentsCount}
                    </div>
                    <div style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Total
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#14532D' }}>
                      {responder.completedAssignmentsCount}
                    </div>
                    <div style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Resolved
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminRespondersPage;
