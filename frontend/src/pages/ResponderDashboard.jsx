import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getResponderDashboardSummaryApi, getAssignedEmergenciesApi } from '../services/api';
import { postAiReportSummaryApi } from '../services/aiService';
import AiSearchBox from '../components/AiSearchBox';
import {
  Ambulance,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ChevronRight,
  Activity,
  MapPin,
  RefreshCw,
  Sparkles,
  X,
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';

const ResponderDashboard = () => {
  const { user } = useAuth();

  const [summary, setSummary] = useState(null);
  const [assignedEmergencies, setAssignedEmergencies] = useState([]);
  const [filteredEmergencies, setFilteredEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // AI Summary Modal State
  const [selectedSummary, setSelectedSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const loadResponderData = async () => {
    setLoading(true);
    setError('');
    try {
      const [summaryData, emergenciesData] = await Promise.all([
        getResponderDashboardSummaryApi(),
        getAssignedEmergenciesApi(),
      ]);
      setSummary(summaryData);
      const list = emergenciesData || [];
      setAssignedEmergencies(list);
      setFilteredEmergencies(list);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load responder dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResponderData();
  }, []);

  const handleApplyAiSearchFilters = (parsedFilters) => {
    if (!parsedFilters) {
      setFilteredEmergencies(assignedEmergencies);
      return;
    }
    const filtered = assignedEmergencies.filter((e) => {
      if (parsedFilters.category !== 'ALL' && e.category !== parsedFilters.category) return false;
      if (parsedFilters.priority !== 'ALL' && e.priority !== parsedFilters.priority) return false;
      if (parsedFilters.status !== 'ALL' && e.status !== parsedFilters.status) return false;
      return true;
    });
    setFilteredEmergencies(filtered);
  };

  const handleFetchAiSummary = async (reportId) => {
    setSummaryLoading(true);
    setError('');
    try {
      const summaryData = await postAiReportSummaryApi(reportId);
      setSelectedSummary(summaryData);
    } catch (err) {
      console.error('AI summary fetch failed:', err);
      setError(err.response?.data?.message || err.message || 'Failed to generate AI incident summary.');
    } finally {
      setSummaryLoading(false);
    }
  };

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* HERO BANNER */}
      <div
        style={{
          backgroundColor: 'var(--pastel-mint)',
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
            <span className="badge badge-mint">FIRST RESPONDER DISPATCH</span>
            <span style={{ fontSize: '0.8rem', color: '#14532D' }}>SafeCity Active Unit</span>
          </div>
          <h1 style={{ fontSize: '2.2rem', color: '#14532D', fontWeight: 800, margin: 0 }}>
            Welcome, {user?.fullName || 'First Responder'}
          </h1>
          <p style={{ color: '#15803D', fontSize: '0.95rem', marginTop: '0.4rem', maxWidth: '640px' }}>
            Active response command center. Accept assigned emergencies, update incident status, log operational notes, and resolve incidents.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={loadResponderData}>
            Refresh
          </Button>
          <Link to="/responder/emergencies">
            <Button variant="primary" size="md" icon={Ambulance} style={{ backgroundColor: '#15803D', color: '#FFFFFF' }}>
              Assigned Emergencies
            </Button>
          </Link>
        </div>
      </div>

      {/* AI NATURAL LANGUAGE SEARCH (PHASE 6) */}
      <AiSearchBox onApplyFilters={handleApplyAiSearchFilters} />

      {/* SUMMARY METRICS CARDS (REAL DATABASE COUNTS) */}
      <div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem' }}>
          My Emergency Response Metrics
        </h3>

        {loading ? (
          <LoadingState message="Fetching live responder metrics from database..." />
        ) : error ? (
          <ErrorState title="Responder Dashboard Error" message={error} onRetry={loadResponderData} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            <Card pastelBg="lavender" hoverEffect={true}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#6B21A8', textTransform: 'uppercase' }}>
                Assigned Emergencies
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#581C87', margin: '0.25rem 0' }}>
                {summary?.assignedEmergencies ?? 0}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#6B21A8' }}>Total assigned to your unit</div>
            </Card>

            <Card pastelBg="peach" hoverEffect={true}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#9A3412', textTransform: 'uppercase' }}>
                Active Response
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#7C2D12', margin: '0.25rem 0' }}>
                {summary?.activeEmergencies ?? 0}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#9A3412' }}>Unresolved active dispatches</div>
            </Card>

            <Card pastelBg="mint" hoverEffect={true}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#15803D', textTransform: 'uppercase' }}>
                Completed Responses
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#14532D', margin: '0.25rem 0' }}>
                {summary?.completedResponses ?? 0}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#15803D' }}>Successfully resolved</div>
            </Card>

            <Card pastelBg="pink" hoverEffect={true}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#9F1239', textTransform: 'uppercase' }}>
                High / Critical
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#881337', margin: '0.25rem 0' }}>
                {summary?.highCriticalEmergencies ?? 0}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#9F1239' }}>High priority incidents</div>
            </Card>
          </div>
        )}
      </div>

      {/* ASSIGNED EMERGENCIES LIST */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            My Active Assigned Incidents ({filteredEmergencies.length})
          </h3>
          <Link to="/responder/emergencies" style={{ fontSize: '0.875rem', fontWeight: 700, color: '#15803D' }}>
            View All ({assignedEmergencies.length}) →
          </Link>
        </div>

        {filteredEmergencies.length === 0 ? (
          <Card hoverEffect={false}>
            <div style={{ textAlign: 'center', padding: '2.5rem 1.5rem', color: 'var(--text-muted)' }}>
              No emergencies are currently assigned to you matching search criteria.
            </div>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredEmergencies.slice(0, 5).map((emergency) => (
              <Card key={emergency.id} hoverEffect={true} style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                      <strong style={{ fontSize: '1.05rem', color: '#1E3A8A' }}>{emergency.reportId}</strong>
                      {getStatusBadge(emergency.status)}
                      {getPriorityBadge(emergency.priority)}
                    </div>
                    <div style={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {emergency.categoryDisplayName} — <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>Citizen: {emergency.citizenName}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', marginTop: '0.2rem' }}>
                      Created: {new Date(emergency.createdAt).toLocaleString()} | Address: {emergency.address || 'GPS Only'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={Sparkles}
                      onClick={() => handleFetchAiSummary(emergency.id)}
                      style={{ fontSize: '0.8rem', borderColor: '#7C3AED', color: '#7C3AED' }}
                    >
                      AI Summary
                    </Button>
                    <Link to={`/responder/emergencies/${emergency.id}`}>
                      <Button variant="primary" size="sm" icon={ChevronRight} style={{ backgroundColor: '#15803D', color: '#FFFFFF' }}>
                        View Incident
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResponderDashboard;
