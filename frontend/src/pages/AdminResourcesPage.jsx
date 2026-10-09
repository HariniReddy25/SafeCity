import React, { useEffect, useState } from 'react';
import {
  getAllResourcesAdminApi,
  createResourceAdminApi,
  getAdminRespondersApi,
} from '../services/api';
import {
  Truck,
  Plus,
  Search,
  Filter,
  RefreshCw,
  MapPin,
  User,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Shield,
  Activity,
  XCircle,
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';

const RESOURCE_TYPES = [
  { key: 'AMBULANCE', label: 'Emergency Medical Ambulance' },
  { key: 'FIRE_ENGINE', label: 'Fire & Rescue Engine' },
  { key: 'POLICE_PATROL', label: 'Police Patrol Unit' },
  { key: 'RESCUE_SQUAD', label: 'Disaster Rescue Squad' },
  { key: 'HAZMAT_UNIT', label: 'Hazardous Materials Unit' },
];

const RESOURCE_STATUSES = [
  { key: 'AVAILABLE', label: 'Available', badge: 'badge-mint' },
  { key: 'DISPATCHED', label: 'Dispatched', badge: 'badge-peach' },
  { key: 'MAINTENANCE', label: 'Maintenance', badge: 'badge-yellow' },
  { key: 'OFFLINE', label: 'Offline', badge: 'badge-pink' },
];

const AdminResourcesPage = () => {
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [responders, setResponders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Register Resource Modal state
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [formData, setFormData] = useState({
    resourceCode: '',
    name: '',
    type: 'AMBULANCE',
    stationLocation: '',
    latitude: '',
    longitude: '',
    operatorId: '',
  });

  const fetchResourcesAndResponders = async () => {
    setLoading(true);
    setError('');
    try {
      const [resourcesData, respondersData] = await Promise.all([
        getAllResourcesAdminApi(),
        getAdminRespondersApi(),
      ]);
      setResources(resourcesData || []);
      setFilteredResources(resourcesData || []);
      setResponders(respondersData || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch emergency resources roster.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResourcesAndResponders();
  }, []);

  useEffect(() => {
    let result = [...resources];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.resourceCode?.toLowerCase().includes(q) ||
          r.name?.toLowerCase().includes(q) ||
          r.stationLocation?.toLowerCase().includes(q) ||
          r.typeDisplayName?.toLowerCase().includes(q)
      );
    }

    if (typeFilter !== 'ALL') {
      result = result.filter((r) => r.type === typeFilter);
    }

    if (statusFilter !== 'ALL') {
      result = result.filter((r) => r.status === statusFilter);
    }

    setFilteredResources(result);
  }, [search, typeFilter, statusFilter, resources]);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!formData.resourceCode.trim() || !formData.name.trim()) {
      setError('Resource code and name are required.');
      return;
    }

    setRegistering(true);
    setError('');
    setSuccessMsg('');

    try {
      const requestPayload = {
        resourceCode: formData.resourceCode.trim(),
        name: formData.name.trim(),
        type: formData.type,
        stationLocation: formData.stationLocation.trim() || null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        operatorId: formData.operatorId ? parseInt(formData.operatorId, 10) : null,
      };

      const newResource = await createResourceAdminApi(requestPayload);
      setSuccessMsg(`Resource [${newResource.resourceCode}] "${newResource.name}" registered successfully!`);
      setShowRegisterModal(false);
      setFormData({
        resourceCode: '',
        name: '',
        type: 'AMBULANCE',
        stationLocation: '',
        latitude: '',
        longitude: '',
        operatorId: '',
      });
      fetchResourcesAndResponders();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to register emergency resource.');
    } finally {
      setRegistering(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return <span className="badge badge-mint">AVAILABLE</span>;
      case 'DISPATCHED':
        return <span className="badge badge-peach">DISPATCHED</span>;
      case 'MAINTENANCE':
        return <span className="badge badge-yellow">MAINTENANCE</span>;
      case 'OFFLINE':
        return <span className="badge badge-pink">OFFLINE</span>;
      default:
        return <span className="badge badge-blue">{status}</span>;
    }
  };

  const availableCount = resources.filter((r) => r.status === 'AVAILABLE').length;
  const dispatchedCount = resources.filter((r) => r.status === 'DISPATCHED').length;
  const maintenanceCount = resources.filter((r) => r.status === 'MAINTENANCE' || r.status === 'OFFLINE').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Truck size={28} style={{ color: '#7C3AED' }} />
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              Emergency Resource Coordination
            </h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: '0.35rem 0 0 0' }}>
            System-wide inventory and dispatch roster of physical units (Ambulances, Fire Engines, Patrol Vehicles, Hazmat Squads).
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchResourcesAndResponders}>
            Refresh Inventory
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => setShowRegisterModal(true)}
            style={{ backgroundColor: '#7C3AED', color: '#FFFFFF' }}
          >
            Register New Resource
          </Button>
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
            justify: 'space-between',
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

      {/* Metric Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <Card pastelBg="blue" hoverEffect={false}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1E40AF', textTransform: 'uppercase' }}>
            Total Registered Assets
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem' }}>
            {resources.length}
          </div>
        </Card>

        <Card pastelBg="mint" hoverEffect={false}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#14532D', textTransform: 'uppercase' }}>
            Available Units
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#16A34A', marginTop: '0.2rem' }}>
            {availableCount}
          </div>
        </Card>

        <Card pastelBg="peach" hoverEffect={false}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#9A3412', textTransform: 'uppercase' }}>
            Dispatched Units
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#EA580C', marginTop: '0.2rem' }}>
            {dispatchedCount}
          </div>
        </Card>

        <Card pastelBg="lavender" hoverEffect={false}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#6B21A8', textTransform: 'uppercase' }}>
            Maintenance / Offline
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 800, color: '#7C3AED', marginTop: '0.2rem' }}>
            {maintenanceCount}
          </div>
        </Card>
      </div>

      {/* Search & Filter Toolbar */}
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
            placeholder="Search resources by code, name, type, or depot..."
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
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{
              padding: '0.65rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--border-subtle)',
              fontSize: '0.875rem',
              fontWeight: 600,
              backgroundColor: '#FFFFFF',
            }}
          >
            <option value="ALL">All Resource Types</option>
            {RESOURCE_TYPES.map((t) => (
              <option key={t.key} value={t.key}>{t.label}</option>
            ))}
          </select>

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
            {RESOURCE_STATUSES.map((s) => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Roster Grid */}
      {loading ? (
        <LoadingState message="Fetching system emergency resource units..." />
      ) : error ? (
        <ErrorState title="Failed to Load Resources" message={error} onRetry={fetchResourcesAndResponders} />
      ) : filteredResources.length === 0 ? (
        <Card pastelBg="mint" hoverEffect={false}>
          <div style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
            <Truck size={48} style={{ color: '#16A34A', marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              No Emergency Resources Found
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '480px', margin: '0 auto 1.5rem auto' }}>
              No emergency response units match the current filters. Register new physical assets to begin resource coordination.
            </p>
            <Button variant="primary" icon={Plus} onClick={() => setShowRegisterModal(true)} style={{ backgroundColor: '#7C3AED', color: '#FFFFFF' }}>
              Register First Resource
            </Button>
          </div>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {filteredResources.map((resource) => (
            <Card key={resource.id} hoverEffect={true} style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1E3A8A' }}>
                      {resource.resourceCode}
                    </span>
                    {getStatusBadge(resource.status)}
                  </div>
                  <span className="badge badge-lavender" style={{ fontSize: '0.78rem' }}>
                    {resource.typeDisplayName}
                  </span>
                </div>

                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  {resource.name}
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {resource.stationLocation && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <MapPin size={14} style={{ color: 'var(--text-subtle)' }} /> Depot: <strong>{resource.stationLocation}</strong>
                    </div>
                  )}

                  {resource.assignedOperatorName ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <User size={14} style={{ color: '#7C3AED' }} /> Operator: <strong>{resource.assignedOperatorName}</strong>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
                      Operator: <em>Unassigned</em>
                    </div>
                  )}

                  {resource.latitude && resource.longitude && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
                      GPS: {resource.latitude}, {resource.longitude}
                    </div>
                  )}
                </div>

                {/* Assignment Banner */}
                {resource.assignedReportCode ? (
                  <div
                    style={{
                      backgroundColor: 'var(--pastel-peach)',
                      color: '#7C2D12',
                      padding: '0.6rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <Layers size={15} /> Assigned to Incident: #{resource.assignedReportCode}
                  </div>
                ) : resource.assignedMasterIncidentCode ? (
                  <div
                    style={{
                      backgroundColor: 'var(--pastel-lavender)',
                      color: '#581C87',
                      padding: '0.6rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <Layers size={15} /> Assigned to Master Incident: #{resource.assignedMasterIncidentCode}
                  </div>
                ) : (
                  <div
                    style={{
                      backgroundColor: 'var(--pastel-mint)',
                      color: '#14532D',
                      padding: '0.5rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.825rem',
                      fontWeight: 600,
                    }}
                  >
                    Ready for Emergency Dispatch
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* REGISTER NEW RESOURCE MODAL */}
      {showRegisterModal && (
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
              maxWidth: '560px',
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
                <Truck size={24} style={{ color: '#7C3AED' }} />
                <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  Register Emergency Resource Asset
                </h3>
              </div>
              <button
                onClick={() => setShowRegisterModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: 'var(--text-muted)' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem', display: 'block' }}>
                  Resource Code / Unit Identifier *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AMB-01, FIRE-03, PATROL-07"
                  value={formData.resourceCode}
                  onChange={(e) => setFormData({ ...formData, resourceCode: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid var(--border-subtle)',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem', display: 'block' }}>
                  Resource Name / Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Abids Cardiac Medical Ambulance #1"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid var(--border-subtle)',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem', display: 'block' }}>
                  Resource Type Category *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid var(--border-subtle)',
                    fontSize: '0.9rem',
                    backgroundColor: '#FFFFFF',
                    outline: 'none',
                  }}
                >
                  {RESOURCE_TYPES.map((t) => (
                    <option key={t.key} value={t.key}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem', display: 'block' }}>
                  Station / Depot Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Abids Central Emergency Depot"
                  value={formData.stationLocation}
                  onChange={(e) => setFormData({ ...formData, stationLocation: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid var(--border-subtle)',
                    fontSize: '0.9rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem', display: 'block' }}>
                    Latitude (Optional)
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="17.3850"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1.5px solid var(--border-subtle)',
                      fontSize: '0.9rem',
                      outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem', display: 'block' }}>
                    Longitude (Optional)
                  </label>
                  <input
                    type="number"
                    step="any"
                    placeholder="78.4867"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1.5px solid var(--border-subtle)',
                      fontSize: '0.9rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem', display: 'block' }}>
                  Assigned Unit Operator (Optional Responder)
                </label>
                <select
                  value={formData.operatorId}
                  onChange={(e) => setFormData({ ...formData, operatorId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid var(--border-subtle)',
                    fontSize: '0.9rem',
                    backgroundColor: '#FFFFFF',
                    outline: 'none',
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <Button variant="outline" type="button" onClick={() => setShowRegisterModal(false)} disabled={registering}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={registering} style={{ backgroundColor: '#7C3AED', color: '#FFFFFF' }}>
                  {registering ? 'Registering...' : 'Confirm & Save Asset'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminResourcesPage;
