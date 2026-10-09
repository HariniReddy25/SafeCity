import React, { useEffect, useState } from 'react';
import {
  getAllSheltersAdminApi,
  createShelterAdminApi,
  updateShelterStatusAdminApi,
  updateShelterOccupancyAdminApi,
} from '../services/api';
import {
  Home,
  Plus,
  RefreshCw,
  Users,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Phone,
  Edit,
  Sliders,
  Search,
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import SafeCityMap from '../components/SafeCityMap';

const AdminSheltersPage = () => {
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Form State
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    shelterCode: '',
    name: '',
    description: '',
    address: '',
    latitude: 17.385,
    longitude: 78.4867,
    capacity: 200,
    currentOccupancy: 0,
    status: 'AVAILABLE',
    contactPhone: '',
    facilities: 'Medical Triage, Clean Water, Food Supply, Power Backup',
  });

  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const loadShelters = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllSheltersAdminApi();
      setShelters(data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch shelter list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShelters();
  }, []);

  const handleLocationSelect = (lat, lon) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lon,
    }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError('');
    setSuccessMessage('');

    try {
      await createShelterAdminApi({
        ...formData,
        capacity: Number(formData.capacity),
        currentOccupancy: Number(formData.currentOccupancy),
        latitude: formData.latitude ? Number(formData.latitude) : null,
        longitude: formData.longitude ? Number(formData.longitude) : null,
      });

      setSuccessMessage(`Shelter '${formData.name}' created successfully!`);
      setShowCreateForm(false);
      setFormData({
        shelterCode: '',
        name: '',
        description: '',
        address: '',
        latitude: 17.385,
        longitude: 78.4867,
        capacity: 200,
        currentOccupancy: 0,
        status: 'AVAILABLE',
        contactPhone: '',
        facilities: 'Medical Triage, Clean Water, Food Supply, Power Backup',
      });
      await loadShelters();
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Failed to create shelter.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleStatusChange = async (shelterId, newStatus) => {
    try {
      await updateShelterStatusAdminApi(shelterId, newStatus);
      setSuccessMessage('Shelter status updated successfully.');
      await loadShelters();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update shelter status.');
    }
  };

  const handleOccupancyChange = async (shelterId, newOccupancy) => {
    try {
      await updateShelterOccupancyAdminApi(shelterId, newOccupancy);
      await loadShelters();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update occupancy.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return <span className="badge badge-mint">Available</span>;
      case 'FULL':
        return <span className="badge badge-yellow">Full</span>;
      case 'EMERGENCY_ONLY':
        return <span className="badge badge-lavender">Emergency Only</span>;
      case 'CLOSED':
      case 'MAINTENANCE':
        return <span className="badge badge-pink">{status}</span>;
      default:
        return <span className="badge badge-blue">{status}</span>;
    }
  };

  const filteredShelters = shelters.filter((shelter) => {
    const matchesSearch =
      shelter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shelter.shelterCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shelter.address.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || shelter.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* HEADER BANNER */}
      <div
        style={{
          backgroundColor: 'var(--pastel-mint)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.25rem',
        }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
            <span className="badge badge-mint">EVACUATION COMMAND</span>
            <span style={{ fontSize: '0.8rem', color: '#14532D' }}>SafeCity Civil Defense</span>
          </div>
          <h1 style={{ fontSize: '2rem', color: '#14532D', fontWeight: 800, margin: 0 }}>
            Emergency Shelter Management
          </h1>
          <p style={{ color: '#166534', fontSize: '0.925rem', marginTop: '0.35rem', maxWidth: '640px' }}>
            Register civil defense emergency shelters, manage occupancy levels, monitor facility availability, and synchronize evacuation operations.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Button variant="outline" size="md" icon={RefreshCw} onClick={loadShelters}>
            Refresh Roster
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? 'Cancel Form' : 'Register New Shelter'}
          </Button>
        </div>
      </div>

      {/* FEEDBACK ALERTS */}
      {successMessage && (
        <div style={{ padding: '1rem 1.25rem', backgroundColor: '#DCFCE7', color: '#15803D', borderRadius: 'var(--radius-md)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={18} /> {successMessage}
        </div>
      )}

      {/* CREATE SHELTER FORM */}
      {showCreateForm && (
        <Card hoverEffect={false} style={{ borderLeft: '4px solid #16A34A' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Home size={20} style={{ color: '#16A34A' }} /> Register Emergency Evacuation Shelter
          </h3>

          {formError && (
            <div style={{ padding: '0.75rem 1rem', backgroundColor: '#FEE2E2', color: '#B91C1C', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
              {formError}
            </div>
          )}

          <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Shelter Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SH-HYD-04"
                  value={formData.shelterCode}
                  onChange={(e) => setFormData({ ...formData, shelterCode: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Shelter Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jubilee Hills Community Center"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Capacity (Max Occupants) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Current Occupancy
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.currentOccupancy}
                  onChange={(e) => setFormData({ ...formData, currentOccupancy: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Initial Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
                >
                  <option value="AVAILABLE">AVAILABLE</option>
                  <option value="FULL">FULL</option>
                  <option value="EMERGENCY_ONLY">EMERGENCY_ONLY</option>
                  <option value="CLOSED">CLOSED</option>
                  <option value="MAINTENANCE">MAINTENANCE</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                  Contact Helpline
                </label>
                <input
                  type="text"
                  placeholder="+91-40-XXXX-XXXX"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                Address *
              </label>
              <input
                type="text"
                required
                placeholder="Full address of the shelter"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                Facilities & Services
              </label>
              <input
                type="text"
                placeholder="Medical, Food, Beds, Clean Water, Power Backup"
                value={formData.facilities}
                onChange={(e) => setFormData({ ...formData, facilities: e.target.value })}
                style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                Description
              </label>
              <textarea
                rows={2}
                placeholder="Operational notes about this shelter"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
              />
            </div>

            {/* MAP COORDINATE PICKER */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                Pick Shelter Location on Map (Click map to set GPS coordinates)
              </label>
              <div style={{ height: '240px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                <SafeCityMap
                  selectedLocation={{ lat: formData.latitude, lng: formData.longitude }}
                  onLocationSelect={handleLocationSelect}
                  reports={[]}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span>Lat: {formData.latitude ? formData.latitude.toFixed(4) : 'N/A'}</span>
                <span>Lon: {formData.longitude ? formData.longitude.toFixed(4) : 'N/A'}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={formSubmitting}>
                Register Shelter
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* FILTER & ROSTER SECTION */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            Emergency Shelter Roster ({filteredShelters.length})
          </h3>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search shelter name or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ padding: '0.45rem 0.65rem 0.45rem 2.2rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.85rem' }}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '0.45rem 0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.85rem' }}
            >
              <option value="ALL">All Statuses</option>
              <option value="AVAILABLE">AVAILABLE</option>
              <option value="FULL">FULL</option>
              <option value="EMERGENCY_ONLY">EMERGENCY_ONLY</option>
              <option value="CLOSED">CLOSED</option>
              <option value="MAINTENANCE">MAINTENANCE</option>
            </select>
          </div>
        </div>

        {loading ? (
          <LoadingState message="Loading civil defense shelter roster..." />
        ) : error ? (
          <ErrorState title="Shelter Roster Error" message={error} onRetry={loadShelters} />
        ) : filteredShelters.length === 0 ? (
          <Card hoverEffect={false}>
            <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
              No emergency shelters match the selected criteria.
            </div>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredShelters.map((shelter) => {
              const occupancyRatio = shelter.capacity > 0 ? (shelter.currentOccupancy / shelter.capacity) * 100 : 0;
              return (
                <Card key={shelter.id} hoverEffect={true} style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem' }}>
                    <div style={{ flex: 1, minWidth: '280px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                        <strong style={{ fontSize: '1.05rem', color: '#14532D' }}>{shelter.shelterCode}</strong>
                        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                          {shelter.name}
                        </span>
                        {getStatusBadge(shelter.status)}
                      </div>

                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <MapPin size={14} /> {shelter.address}
                      </div>

                      {shelter.facilities && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', marginBottom: '0.4rem' }}>
                          <strong>Facilities:</strong> {shelter.facilities}
                        </div>
                      )}

                      {shelter.contactPhone && (
                        <div style={{ fontSize: '0.78rem', color: '#2563EB', fontWeight: 600 }}>
                          📞 Helpline: {shelter.contactPhone}
                        </div>
                      )}
                    </div>

                    {/* Occupancy Control Box */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', minWidth: '220px' }}>
                      <div style={{ padding: '0.6rem 0.85rem', backgroundColor: '#F9FAFB', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                          <span>Capacity Meter</span>
                          <span style={{ color: shelter.availableSlots > 0 ? '#16A34A' : '#DC2626' }}>
                            {shelter.currentOccupancy} / {shelter.capacity} ({shelter.availableSlots} slots)
                          </span>
                        </div>
                        <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${Math.min(100, occupancyRatio)}%`,
                              height: '100%',
                              backgroundColor: occupancyRatio >= 100 ? '#EF4444' : occupancyRatio >= 80 ? '#F59E0B' : '#22C55E',
                              borderRadius: '4px',
                            }}
                          />
                        </div>
                      </div>

                      {/* Quick Adjust Occupancy */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Adjust:</span>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOccupancyChange(shelter.id, Math.max(0, shelter.currentOccupancy - 5))}
                          >
                            -5
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOccupancyChange(shelter.id, Math.max(0, shelter.currentOccupancy - 1))}
                          >
                            -1
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOccupancyChange(shelter.id, Math.min(shelter.capacity, shelter.currentOccupancy + 1))}
                          >
                            +1
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOccupancyChange(shelter.id, Math.min(shelter.capacity, shelter.currentOccupancy + 5))}
                          >
                            +5
                          </Button>
                        </div>
                      </div>

                      {/* Change Status Dropdown */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Status:</span>
                        <select
                          value={shelter.status}
                          onChange={(e) => handleStatusChange(shelter.id, e.target.value)}
                          style={{ flex: 1, padding: '0.35rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '0.78rem' }}
                        >
                          <option value="AVAILABLE">AVAILABLE</option>
                          <option value="FULL">FULL</option>
                          <option value="EMERGENCY_ONLY">EMERGENCY_ONLY</option>
                          <option value="CLOSED">CLOSED</option>
                          <option value="MAINTENANCE">MAINTENANCE</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSheltersPage;
