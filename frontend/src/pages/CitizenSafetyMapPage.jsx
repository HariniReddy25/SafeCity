import React, { useState, useEffect, useMemo } from 'react';
import SafeCityMap from '../components/SafeCityMap';
import Card from '../components/Card';
import Button from '../components/Button';
import { getMapMarkersApi, getActiveBroadcastsPublicApi, getAvailableSheltersPublicApi } from '../services/api';
import { fetchNearbyEmergencyServices } from '../services/nearbyServices';
import SafetyIntelligencePanel from '../components/SafetyIntelligencePanel';
import EmergencyAlertBanner from '../components/EmergencyAlertBanner';
import {
  Navigation,
  AlertCircle,
  CheckCircle2,
  Info,
  Layers,
  AlertTriangle,
  RotateCcw,
  Loader2,
  Filter,
  Shield,
  Building2,
  Compass,
  ExternalLink,
  MapPin,
  Phone,
  Clock,
  Ambulance,
} from 'lucide-react';

const IncidentCategoryOptions = [
  { value: 'ALL', label: 'All Categories' },
  { value: 'ROAD_ACCIDENT', label: 'Road Accident' },
  { value: 'FIRE', label: 'Fire' },
  { value: 'MEDICAL_EMERGENCY', label: 'Medical Emergency' },
  { value: 'CRIME', label: 'Crime' },
  { value: 'SUSPICIOUS_ACTIVITY', label: 'Suspicious Activity' },
  { value: 'MISSING_PERSON', label: 'Missing Person' },
  { value: 'PUBLIC_SAFETY_HAZARD', label: 'Public Safety Hazard' },
  { value: 'NATURAL_DISASTER', label: 'Natural Disaster' },
  { value: 'HARASSMENT', label: 'Harassment' },
  { value: 'OTHER', label: 'Other' },
];

const ReportStatusOptions = [
  { value: 'ALL', label: 'All Statuses' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'UNDER_REVIEW', label: 'Under Review' },
  { value: 'VERIFIED', label: 'Verified' },
  { value: 'ASSIGNED', label: 'Assigned' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
];

const ReportPriorityOptions = [
  { value: 'ALL', label: 'All Priorities' },
  { value: 'LOW', label: 'Low Priority' },
  { value: 'MEDIUM', label: 'Medium Priority' },
  { value: 'HIGH', label: 'High Priority' },
  { value: 'CRITICAL', label: 'Critical Priority' },
];

const ServiceTypeOptions = [
  { value: 'ALL', label: 'All Services', icon: '🚨' },
  { value: 'HOSPITAL', label: 'Hospitals', icon: '🏥' },
  { value: 'POLICE', label: 'Police Stations', icon: '👮' },
  { value: 'FIRE_STATION', label: 'Fire Stations', icon: '🚒' },
];

const INDIA_CITY_OPTIONS = [
  { id: 'hyderabad', name: 'Hyderabad, Telangana', lat: 17.3850, lng: 78.4867 },
  { id: 'bengaluru', name: 'Bengaluru, Karnataka', lat: 12.9716, lng: 77.5946 },
  { id: 'mumbai', name: 'Mumbai, Maharashtra', lat: 19.0760, lng: 72.8777 },
  { id: 'delhi', name: 'Delhi, NCR', lat: 28.6139, lng: 77.2090 },
  { id: 'chennai', name: 'Chennai, Tamil Nadu', lat: 13.0827, lng: 80.2707 },
  { id: 'pune', name: 'Pune, Maharashtra', lat: 18.5204, lng: 73.8567 },
];

const CitizenSafetyMapPage = () => {
  // Default Map Center (Hyderabad, Telangana, India)
  const defaultCenter = [17.3850, 78.4867];

  // City Selection State (Default: Hyderabad)
  const [selectedCityId, setSelectedCityId] = useState('hyderabad');

  // Geolocation States
  const [locationState, setLocationState] = useState('idle'); // 'idle' | 'locating' | 'success' | 'denied' | 'error' | 'unsupported'
  const [currentLocation, setCurrentLocation] = useState(null); // { lat, lng }
  const [locationErrorMessage, setLocationErrorMessage] = useState('');

  // API Emergency Markers State (Phase 5B)
  const [rawMarkers, setRawMarkers] = useState([]);
  const [activeBroadcasts, setActiveBroadcasts] = useState([]);
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);

  // Map Report Filter States (Phase 5B)
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // Nearby Emergency Services State (Phase 5C)
  const [nearbyServices, setNearbyServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesError, setServicesError] = useState(false);
  const [serviceTypeFilter, setServiceTypeFilter] = useState('ALL');

  // Active Map Center Overrides (e.g. when selecting city or clicking "View on Map")
  const [mapTargetCenter, setMapTargetCenter] = useState(null);

  // Map Layer Visibility Controls (Phase 5D)
  const [showMarkers, setShowMarkers] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showDangerZones, setShowDangerZones] = useState(true);
  const [showServices, setShowServices] = useState(true);

  // Fetch Real Emergency Map Data & Civil Defense Broadcasts & Emergency Shelters
  const fetchMapMarkers = async () => {
    setLoading(true);
    setApiError(false);
    try {
      const data = await getMapMarkersApi();
      if (Array.isArray(data)) {
        setRawMarkers(data);
      } else {
        setRawMarkers([]);
      }
      try {
        const broadcastsData = await getActiveBroadcastsPublicApi();
        setActiveBroadcasts(broadcastsData || []);
      } catch (bErr) {
        console.warn('Could not fetch active broadcasts for map', bErr);
      }
      try {
        const shelterData = await getAvailableSheltersPublicApi();
        setShelters(shelterData || []);
      } catch (sErr) {
        console.warn('Could not fetch emergency shelters for map', sErr);
      }
    } catch (err) {
      console.error('Failed to load emergency map markers:', err);
      setApiError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMapMarkers();
  }, []);

  // Fetch Nearby Emergency Services when Location or Selected City is Active
  const loadNearbyServices = async (lat, lng) => {
    if (!lat || !lng) return;
    setServicesLoading(true);
    setServicesError(false);
    try {
      const results = await fetchNearbyEmergencyServices(lat, lng, 5000);
      setNearbyServices(results);
    } catch (err) {
      console.error('Failed to load nearby services:', err);
      setServicesError(true);
    } finally {
      setServicesLoading(false);
    }
  };

  // Auto-load nearby services for default selected city (Hyderabad) or when GPS location is acquired
  useEffect(() => {
    if (currentLocation && currentLocation.lat && currentLocation.lng) {
      loadNearbyServices(currentLocation.lat, currentLocation.lng);
    } else {
      const city = INDIA_CITY_OPTIONS.find((c) => c.id === selectedCityId) || INDIA_CITY_OPTIONS[0];
      setMapTargetCenter({ lat: city.lat, lng: city.lng });
      loadNearbyServices(city.lat, city.lng);
    }
  }, [currentLocation, selectedCityId]);

  // Handle City Selector Change
  const handleCityChange = (cityId) => {
    setSelectedCityId(cityId);
    const city = INDIA_CITY_OPTIONS.find((c) => c.id === cityId) || INDIA_CITY_OPTIONS[0];
    setMapTargetCenter({ lat: city.lat, lng: city.lng });
    loadNearbyServices(city.lat, city.lng);
  };

  // Filter Emergency Report Markers Client-Side Immediately
  const filteredMarkers = useMemo(() => {
    return rawMarkers.filter((marker) => {
      const lat = marker.latitude ?? marker.lat;
      const lng = marker.longitude ?? marker.lng;
      if (lat === null || lat === undefined || lng === null || lng === undefined) return false;
      const numLat = Number(lat);
      const numLng = Number(lng);
      if (isNaN(numLat) || isNaN(numLng) || numLat < -90 || numLat > 90 || numLng < -180 || numLng > 180) {
        return false;
      }

      if (statusFilter !== 'ALL' && marker.status !== statusFilter) return false;
      if (categoryFilter !== 'ALL' && marker.category !== categoryFilter) return false;
      if (priorityFilter !== 'ALL' && marker.priority !== priorityFilter) return false;

      return true;
    });
  }, [rawMarkers, statusFilter, categoryFilter, priorityFilter]);

  // Filter Nearby Emergency Services Client-Side
  const filteredServices = useMemo(() => {
    return nearbyServices.filter((service) => {
      if (serviceTypeFilter !== 'ALL' && service.type !== serviceTypeFilter) {
        return false;
      }
      return true;
    });
  }, [nearbyServices, serviceTypeFilter]);

  const hasActiveReportFilters = statusFilter !== 'ALL' || categoryFilter !== 'ALL' || priorityFilter !== 'ALL';

  const resetReportFilters = () => {
    setStatusFilter('ALL');
    setCategoryFilter('ALL');
    setPriorityFilter('ALL');
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationState('unsupported');
      setLocationErrorMessage('Browser Geolocation is not supported by your device.');
      return;
    }

    setLocationState('locating');
    setLocationErrorMessage('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCurrentLocation(coords);
        setMapTargetCenter(coords);
        setLocationState('success');
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setLocationState('denied');
          setLocationErrorMessage('Unable to access your current location. You can still explore the map.');
        } else if (error.code === error.TIMEOUT) {
          setLocationState('error');
          setLocationErrorMessage('Location request timed out. Please try again or explore the map manually.');
        } else {
          setLocationState('error');
          setLocationErrorMessage('Position unavailable. You can still explore the map manually.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  };

  // Center map on target service location
  const handleViewServiceOnMap = (service) => {
    setMapTargetCenter({ lat: service.lat, lng: service.lng });
    window.scrollTo({ top: 320, behavior: 'smooth' });
  };

  // Launch Google Maps directions in new browser tab
  const handleGetDirections = (service) => {
    const originStr = currentLocation
      ? `${currentLocation.lat},${currentLocation.lng}`
      : '';
    const destStr = `${service.lat},${service.lng}`;
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${originStr}&destination=${destStr}`;
    window.open(mapsUrl, '_blank', 'noopener,noreferrer');
  };

  const currentMapCenter = mapTargetCenter
    ? [mapTargetCenter.lat, mapTargetCenter.lng]
    : currentLocation
    ? [currentLocation.lat, currentLocation.lng]
    : defaultCenter;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* HERO BANNER */}
      <div
        style={{
          backgroundColor: 'var(--pastel-lavender)',
          borderRadius: 'var(--radius-lg)',
          padding: '2.25rem 2rem',
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
            <span className="badge badge-lavender">PUBLIC SAFETY GEOSPATIAL MAP</span>
            <span style={{ fontSize: '0.8rem', color: '#6B21A8', fontWeight: 600 }}>Phase 5C Active</span>
          </div>
          <h1 style={{ fontSize: '2.2rem', color: '#581C87', fontWeight: 800, margin: 0 }}>
            Interactive Safety & Emergency Services Map
          </h1>
          <p style={{ color: '#6B21A8', fontSize: '0.95rem', marginTop: '0.4rem', maxWidth: '680px' }}>
            Discover real nearby hospitals, police stations, and fire stations within 5 km of your location alongside live emergency incident markers.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#581C87', textTransform: 'uppercase' }}>Select City</label>
            <select
              value={selectedCityId}
              onChange={(e) => handleCityChange(e.target.value)}
              style={{
                padding: '0.55rem 0.9rem',
                borderRadius: 'var(--radius-md)',
                border: '2px solid #7C3AED',
                backgroundColor: '#FFFFFF',
                color: '#581C87',
                fontWeight: 700,
                fontSize: '0.875rem',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              {INDIA_CITY_OPTIONS.map((city) => (
                <option key={city.id} value={city.id}>
                  🇮🇳 {city.name}
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="primary"
            size="md"
            icon={Navigation}
            onClick={handleGetCurrentLocation}
            disabled={locationState === 'locating'}
            style={{ backgroundColor: '#7C3AED', color: '#FFFFFF', marginTop: '1.1rem' }}
          >
            {locationState === 'locating' ? 'Detecting Location...' : 'Use My Current Location'}
          </Button>
        </div>
      </div>

      {/* LOCATION NOTIFICATIONS */}
      {locationState === 'denied' && (
        <div
          style={{
            backgroundColor: 'var(--pastel-pink)',
            color: '#9F1239',
            border: '1.5px solid #FDA4AF',
            padding: '0.9rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.925rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <AlertCircle size={20} style={{ color: '#BE123C' }} />
            <span>Location access is required to find nearby emergency services.</span>
          </div>
          <Button variant="outline" size="sm" icon={RotateCcw} onClick={handleGetCurrentLocation}>
            Retry Location Access
          </Button>
        </div>
      )}

      {locationState === 'error' && (
        <div
          style={{
            backgroundColor: 'var(--pastel-yellow)',
            color: '#713F12',
            border: '1.5px solid #FDE047',
            padding: '0.9rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.925rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
          }}
        >
          <AlertTriangle size={20} style={{ color: '#854D0E' }} />
          <span>{locationErrorMessage}</span>
        </div>
      )}

      {locationState === 'success' && currentLocation && (
        <Card pastelBg="mint" hoverEffect={false} style={{ padding: '1rem 1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: '#DDF7E3',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckCircle2 size={20} style={{ color: '#15803D' }} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#14532D', margin: 0 }}>
                  Current Location Detected & Spatial Scan Active
                </h4>
                <div style={{ fontSize: '0.825rem', color: '#15803D', marginTop: '0.1rem' }}>
                  Nearby emergency services scanned within 5 km.
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem', color: '#14532D' }}>
              <div><strong>Latitude:</strong> {currentLocation.lat.toFixed(6)}</div>
              <div><strong>Longitude:</strong> {currentLocation.lng.toFixed(6)}</div>
            </div>
          </div>
        </Card>
      )}

      {/* FILTER CONTROL BAR */}
      <Card hoverEffect={false} style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: 'var(--text-main)', fontSize: '1rem' }}>
              <Filter size={18} style={{ color: 'var(--primary-accent)' }} />
              Filter Safety Map & Emergency Reports
            </div>

            {/* LIVE COUNTER DISPLAY */}
            {!loading && !apiError && (
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="badge badge-blue" style={{ fontSize: '0.825rem', padding: '4px 10px' }}>
                  {filteredMarkers.length === 1
                    ? '1 emergency report shown'
                    : `${filteredMarkers.length} emergency reports shown`}
                </span>
                {hasActiveReportFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    icon={RotateCcw}
                    onClick={resetReportFilters}
                    style={{ padding: '2px 8px', fontSize: '0.775rem' }}
                  >
                    Reset Filters
                  </Button>
                )}
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {/* STATUS FILTER */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-muted)' }}>REPORT STATUS</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  padding: '0.55rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--border-subtle)',
                  backgroundColor: '#FFFFFF',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                {ReportStatusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* CATEGORY FILTER */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-muted)' }}>REPORT CATEGORY</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={{
                  padding: '0.55rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--border-subtle)',
                  backgroundColor: '#FFFFFF',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                {IncidentCategoryOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* PRIORITY FILTER */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-muted)' }}>REPORT PRIORITY</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                style={{
                  padding: '0.55rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--border-subtle)',
                  backgroundColor: '#FFFFFF',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                {ReportPriorityOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* EMERGENCY SERVICE FILTER */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-muted)' }}>EMERGENCY SERVICE TYPE</label>
              <select
                value={serviceTypeFilter}
                onChange={(e) => setServiceTypeFilter(e.target.value)}
                style={{
                  padding: '0.55rem 0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--border-subtle)',
                  backgroundColor: '#FFFFFF',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                {ServiceTypeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.icon} {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* MAP & LEGEND SECTION */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr minmax(250px, 300px)', gap: '1.5rem', alignItems: 'start' }}>
        {/* MAP CONTAINER WITH OVERLAYS */}
        <div style={{ position: 'relative', width: '100%' }}>
          {/* LOADING OVERLAY */}
          {loading && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'var(--radius-lg)',
                gap: '0.75rem',
              }}
            >
              <Loader2 size={36} className="animate-spin" style={{ color: 'var(--primary-accent)' }} />
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Loading emergency map data...
              </div>
            </div>
          )}

          {/* API ERROR STATE WITH RETRY BUTTON */}
          {apiError && !loading && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(255, 241, 242, 0.95)',
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'var(--radius-lg)',
                padding: '2rem',
                gap: '1rem',
                textAlign: 'center',
              }}
            >
              <AlertCircle size={42} style={{ color: '#E11D48' }} />
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#9F1239', margin: 0 }}>
                  Unable to load emergency map data.
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#BE123C', marginTop: '0.4rem', maxWidth: '380px' }}>
                  Please check your backend connection or network settings and try again.
                </p>
              </div>
              <Button variant="primary" icon={RotateCcw} onClick={fetchMapMarkers} style={{ backgroundColor: '#E11D48' }}>
                Retry
              </Button>
            </div>
          )}

          {/* NO REPORT RESULTS WARNING */}
          {!loading && !apiError && filteredMarkers.length === 0 && (
            <div
              style={{
                position: 'absolute',
                top: '12px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 9,
                backgroundColor: '#FFFFFF',
                boxShadow: 'var(--shadow-md)',
                borderRadius: 'var(--radius-md)',
                padding: '0.6rem 1.25rem',
                border: '1.5px solid var(--border-subtle)',
                fontSize: '0.875rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                whiteSpace: 'nowrap',
              }}
            >
              <Info size={18} style={{ color: 'var(--primary-accent)' }} />
              No emergency reports match your filters.
            </div>
          )}

          {/* MAP VIEW CONTROL TOOLBAR (PHASE 5D) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
              backgroundColor: '#FFFFFF',
              padding: '0.75rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              border: '1.5px solid var(--border-subtle)',
              marginBottom: '0.75rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: 'var(--text-main)', fontSize: '0.9rem' }}>
              <Layers size={18} style={{ color: 'var(--primary-accent)' }} />
              <span>Map View Controls & Layers:</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.825rem', fontWeight: 700, cursor: 'pointer', color: showMarkers ? '#1E3A8A' : '#64748B' }}>
                <input type="checkbox" checked={showMarkers} onChange={(e) => setShowMarkers(e.target.checked)} style={{ accentColor: '#2563EB', cursor: 'pointer' }} />
                <span>Emergency Pins</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.825rem', fontWeight: 700, cursor: 'pointer', color: showHeatmap ? '#DC2626' : '#64748B' }}>
                <input type="checkbox" checked={showHeatmap} onChange={(e) => setShowHeatmap(e.target.checked)} style={{ accentColor: '#DC2626', cursor: 'pointer' }} />
                <span>Heatmap</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.825rem', fontWeight: 700, cursor: 'pointer', color: showDangerZones ? '#B91C1C' : '#64748B' }}>
                <input type="checkbox" checked={showDangerZones} onChange={(e) => setShowDangerZones(e.target.checked)} style={{ accentColor: '#B91C1C', cursor: 'pointer' }} />
                <span>Danger Zones</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.825rem', fontWeight: 700, cursor: 'pointer', color: showServices ? '#0284C7' : '#64748B' }}>
                <input type="checkbox" checked={showServices} onChange={(e) => setShowServices(e.target.checked)} style={{ accentColor: '#0284C7', cursor: 'pointer' }} />
                <span>Nearby Services</span>
              </label>
            </div>
          </div>

          {/* REUSABLE SAFECITY MAP COMPONENT WITH REPORTS & SERVICE MARKERS */}
          <SafeCityMap
            center={currentMapCenter}
            zoom={13}
            markers={filteredMarkers}
            serviceMarkers={filteredServices}
            broadcasts={activeBroadcasts}
            shelters={shelters}
            currentLocation={currentLocation}
            showMarkers={showMarkers}
            showHeatmap={showHeatmap}
            showDangerZones={showDangerZones}
            showServices={showServices}
            height="540px"
          />
        </div>

        {/* MAP LEGEND & INFORMATION PANEL */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <Card hoverEffect={false}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={18} style={{ color: 'var(--primary-accent)' }} /> Emergency Map Legend
            </h3>

            {/* HEATMAP & DANGER ZONES LEGEND (PHASE 5D) */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.775rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Heatmap & Danger Zones
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.825rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                  <span style={{ background: 'linear-gradient(90deg, #2563EB, #D97706, #DC2626)', color: '#FFF', padding: '2px 7px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800 }}>HEATMAP</span>
                  <span style={{ color: 'var(--text-main)' }}>Incident Density (Blue → Red)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                  <span style={{ backgroundColor: '#FEF2F2', border: '1.5px dashed #DC2626', color: '#991B1B', padding: '2px 7px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800 }}>⚠️ DANGER ZONE</span>
                  <span style={{ color: 'var(--text-main)' }}>Incident Sector (2+ Reports)</span>
                </div>
              </div>
            </div>

            {/* EMERGENCY SERVICE MARKERS LEGEND */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.775rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Nearby Emergency Services
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.825rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                  <span style={{ backgroundColor: '#0284C7', color: '#FFF', padding: '2px 7px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800 }}>🏥 HOSPITAL</span>
                  <span style={{ color: 'var(--text-main)' }}>Hospitals & Medical Centers</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                  <span style={{ backgroundColor: '#1E3A8A', color: '#FFF', padding: '2px 7px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800 }}>👮 POLICE</span>
                  <span style={{ color: 'var(--text-main)' }}>Police Stations & Precincts</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                  <span style={{ backgroundColor: '#B91C1C', color: '#FFF', padding: '2px 7px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800 }}>🚒 FIRE</span>
                  <span style={{ color: 'var(--text-main)' }}>Fire Stations & Rescue</span>
                </div>
              </div>
            </div>

            {/* PRIORITY VISUALIZATIONS */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.775rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Emergency Report Priority
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.825rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                  <span style={{ backgroundColor: '#DC2626', color: '#FFF', padding: '2px 7px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800 }}>🚨 CRITICAL</span>
                  <span style={{ color: 'var(--text-main)' }}>Life-threatening incident</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                  <span style={{ backgroundColor: '#EA580C', color: '#FFF', padding: '2px 7px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800 }}>⚠️ HIGH</span>
                  <span style={{ color: 'var(--text-main)' }}>Urgent emergency</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                  <span style={{ backgroundColor: '#D97706', color: '#FFF', padding: '2px 7px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800 }}>⚡ MEDIUM</span>
                  <span style={{ color: 'var(--text-main)' }}>Moderate priority</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                  <span style={{ backgroundColor: '#2563EB', color: '#FFF', padding: '2px 7px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800 }}>ℹ️ LOW</span>
                  <span style={{ color: 'var(--text-main)' }}>Minor hazard</span>
                </div>
              </div>
            </div>

            {/* MAP LAYERS */}
            <div>
              <div style={{ fontSize: '0.775rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Location Pins
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.825rem' }}>
                <div style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: '#2563EB', border: '2px solid #FFF', boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.25)' }}></div>
                <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>Your GPS Location</span>
              </div>
            </div>
          </Card>

          <Card pastelBg="pink" hoverEffect={false} style={{ border: '1px solid #FCA5A5' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#991B1B', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <AlertTriangle size={15} style={{ color: '#DC2626' }} /> Safety Map Disclaimer
            </h4>
            <p style={{ fontSize: '0.775rem', color: '#7F1D1D', margin: 0, lineHeight: 1.45 }}>
              Heatmap and danger zones are based on reported emergency incidents and do not guarantee that an area is unsafe.
            </p>
          </Card>

          <Card pastelBg="blue" hoverEffect={false}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1E3A8A', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Shield size={16} /> Privacy & Security Standard
            </h4>
            <p style={{ fontSize: '0.8rem', color: '#1E40AF', margin: 0, lineHeight: 1.5 }}>
              Your GPS coordinates are processed locally to fetch nearby spatial emergency services within 5 km and center the map. Location data is never stored in the database.
            </p>
          </Card>
        </div>
      </div>

      {/* PHASE 5C: NEARBY EMERGENCY SERVICES PANEL */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building2 size={24} style={{ color: 'var(--primary-accent)' }} />
              Nearby Emergency Services (within 5 km)
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.2rem', margin: 0 }}>
              Sorted by nearest distance to your location.
            </p>
          </div>

          {/* SERVICE TYPE FILTER PILLS */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {ServiceTypeOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setServiceTypeFilter(opt.value)}
                style={{
                  padding: '0.45rem 0.9rem',
                  borderRadius: 'var(--radius-md)',
                  border: serviceTypeFilter === opt.value ? '2px solid #2563EB' : '1.5px solid var(--border-subtle)',
                  backgroundColor: serviceTypeFilter === opt.value ? '#EFF6FF' : '#FFFFFF',
                  color: serviceTypeFilter === opt.value ? '#1E40AF' : 'var(--text-main)',
                  fontWeight: 700,
                  fontSize: '0.825rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{opt.icon}</span>
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* SERVICES LIST OR STATES */}
        {servicesLoading && (
          <Card pastelBg="lavender" hoverEffect={false} style={{ padding: '2.5rem', textAlign: 'center' }}>
            <Loader2 size={36} className="animate-spin" style={{ color: '#7C3AED', margin: '0 auto 0.75rem auto' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#581C87', margin: 0 }}>
              Finding nearby emergency services...
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#6B21A8', marginTop: '0.3rem' }}>
              Scanning OpenStreetMap spatial database within 5 km of your GPS coordinates.
            </p>
          </Card>
        )}

        {servicesError && !servicesLoading && (
          <Card pastelBg="peach" hoverEffect={false} style={{ padding: '2rem', textAlign: 'center' }}>
            <AlertCircle size={38} style={{ color: '#E11D48', margin: '0 auto 0.75rem auto' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#9F1239', margin: 0 }}>
              Unable to find nearby emergency services.
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#BE123C', marginTop: '0.3rem' }}>
              Spatial network request failed. Please verify internet connectivity and retry.
            </p>
            {currentLocation && (
              <Button
                variant="primary"
                icon={RotateCcw}
                onClick={() => loadNearbyServices(currentLocation.lat, currentLocation.lng)}
                style={{ marginTop: '1rem', backgroundColor: '#E11D48' }}
              >
                Retry Search
              </Button>
            )}
          </Card>
        )}

        {!currentLocation && !servicesLoading && (
          <Card pastelBg="yellow" hoverEffect={false} style={{ padding: '1.75rem', textAlign: 'center' }}>
            <Compass size={32} style={{ color: '#854D0E', margin: '0 auto 0.5rem auto' }} />
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#713F12', margin: 0 }}>
              Location access is required to find nearby emergency services.
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#854D0E', marginTop: '0.25rem' }}>
              Click "Use My Current Location" above to locate hospitals, police stations, and fire stations around you.
            </p>
            <Button
              variant="primary"
              size="sm"
              icon={Navigation}
              onClick={handleGetCurrentLocation}
              style={{ marginTop: '0.75rem', backgroundColor: '#854D0E', color: '#FFFFFF' }}
            >
              Enable Location & Find Services
            </Button>
          </Card>
        )}

        {currentLocation && !servicesLoading && !servicesError && filteredServices.length === 0 && (
          <Card hoverEffect={false} style={{ padding: '2rem', textAlign: 'center' }}>
            <Info size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 0.5rem auto' }} />
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              No nearby emergency services found.
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              No emergency services matching your criteria were found within a 5 km radius of your location.
            </p>
          </Card>
        )}

        {currentLocation && !servicesLoading && !servicesError && filteredServices.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {filteredServices.map((service) => (
              <Card key={service.id} hoverEffect={true} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, lineHeight: 1.3 }}>
                      {service.name}
                    </h3>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        backgroundColor:
                          service.type === 'HOSPITAL'
                            ? '#E0F2FE'
                            : service.type === 'POLICE'
                            ? '#DBEAFE'
                            : '#FEE2E2',
                        color:
                          service.type === 'HOSPITAL'
                            ? '#0369A1'
                            : service.type === 'POLICE'
                            ? '#1E40AF'
                            : '#991B1B',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {service.iconSymbol} {service.typeLabel}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#2563EB', fontWeight: 700 }}>
                      <Compass size={15} />
                      <span>{service.distanceFormatted}</span>
                    </div>

                    {service.address && service.address !== 'Address unavailable' && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                        <MapPin size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>{service.address}</span>
                      </div>
                    )}

                    {service.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Phone size={15} />
                        <span>{service.phone}</span>
                      </div>
                    )}

                    {service.openingHours && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#16A34A', fontWeight: 600 }}>
                        <Clock size={15} />
                        <span>{service.openingHours}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={MapPin}
                    onClick={() => handleViewServiceOnMap(service)}
                    style={{ flex: 1, fontSize: '0.8rem' }}
                  >
                    View on Map
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    icon={ExternalLink}
                    onClick={() => handleGetDirections(service)}
                    style={{ flex: 1, fontSize: '0.8rem', backgroundColor: '#2563EB' }}
                  >
                    Get Directions
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* PHASE 5E: SAFETY INTELLIGENCE & AREA SAFETY SCORE PANEL */}
      <SafetyIntelligencePanel
        reports={filteredMarkers}
        cityName={
          currentLocation
            ? 'Your Current GPS Location'
            : (INDIA_CITY_OPTIONS.find((c) => c.id === selectedCityId) || INDIA_CITY_OPTIONS[0]).name
        }
        dangerZoneCount={0}
      />
    </div>
  );
};

export default CitizenSafetyMapPage;


