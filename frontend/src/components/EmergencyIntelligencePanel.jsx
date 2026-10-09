import React, { useEffect, useState } from 'react';
import {
  getReportIntelligenceAdminApi,
  getReportIntelligenceResponderApi,
} from '../services/api';
import {
  Brain,
  RefreshCw,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Truck,
  User,
  Clock,
  Sparkles,
  MapPin,
  Activity,
  Info,
  ListChecks,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import Card from './Card';
import Button from './Button';
import SlaBadge from './SlaBadge';

const EmergencyIntelligencePanel = ({ reportId, role }) => {
  const [intelligence, setIntelligence] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Determine role if not passed directly
  const userRole = role || (() => {
    try {
      const stored = localStorage.getItem('safecity_user');
      if (stored) {
        const u = JSON.parse(stored);
        return u.role;
      }
    } catch (e) {}
    return 'ADMIN';
  })();

  const fetchIntelligence = async () => {
    if (!reportId) return;
    setLoading(true);
    setError('');
    try {
      let data;
      if (userRole === 'ADMIN') {
        data = await getReportIntelligenceAdminApi(reportId);
      } else {
        data = await getReportIntelligenceResponderApi(reportId);
      }
      setIntelligence(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Emergency intelligence is currently unavailable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntelligence();
  }, [reportId, userRole]);

  if (loading) {
    return (
      <Card pastelBg="purple" hoverEffect={false}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', gap: '0.75rem', color: '#581C87' }}>
          <RefreshCw size={20} className="spin-animation" style={{ animation: 'spin 1.2s linear infinite' }} />
          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Synthesizing emergency response intelligence...</span>
        </div>
      </Card>
    );
  }

  if (error || !intelligence) {
    return (
      <Card pastelBg="lavender" hoverEffect={false}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#6B21A8' }}>
            <AlertTriangle size={22} style={{ color: '#9333EA' }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>Intelligence Temporarily Unavailable</div>
              <div style={{ fontSize: '0.85rem', opacity: 0.85 }}>{error || 'Emergency intelligence data could not be retrieved.'}</div>
            </div>
          </div>

          <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchIntelligence}>
            Retry Fetch
          </Button>
        </div>
      </Card>
    );
  }

  const {
    severityLevel,
    severityScore,
    severityReasons,
    slaStatus,
    elapsedMinutes,
    slaMinutesRemaining,
    isEscalated,
    isResponderAssigned,
    assignedResponderName,
    responderActiveWorkload,
    recommendedResourceTypes,
    currentlyDispatchedResources,
    nearbyAvailableResources,
    primaryResourceDispatched,
    readinessScore,
    readinessScoreBreakdown,
    actionRecommendations,
  } = intelligence;

  const getSeverityBadgeClass = (lvl) => {
    switch (lvl) {
      case 'CRITICAL':
        return 'badge-pink';
      case 'HIGH':
        return 'badge-peach';
      case 'MODERATE':
        return 'badge-yellow';
      default:
        return 'badge-mint';
    }
  };

  const getReadinessColor = (score) => {
    if (score >= 80) return '#15803D';
    if (score >= 50) return '#B45309';
    return '#B91C1C';
  };

  return (
    <Card pastelBg="lavender" hoverEffect={false}>
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#581C87', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Brain size={24} style={{ color: '#7E22CE' }} /> Emergency Response Intelligence & Decision Support
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#6B21A8', margin: '0.25rem 0 0 0' }}>
            Synthesized operational analysis and explainable decision-support recommendations.
          </p>
        </div>

        <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchIntelligence} style={{ borderColor: '#D8B4FE', color: '#581C87', backgroundColor: '#FFFFFF' }}>
          Refresh Intelligence
        </Button>
      </div>

      {/* SECTION A: OPERATIONAL DISPATCH READINESS SCORE */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem',
          border: '1.5px solid #E9D5FF',
          marginBottom: '1.25rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Operational Dispatch Readiness Score
            </span>
            <div style={{ fontSize: '0.8rem', color: '#6B21A8', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem' }}>
              <Info size={14} /> Decision-support indicator, not a safety guarantee.
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem' }}>
            <span style={{ fontSize: '2.4rem', fontWeight: 900, color: getReadinessColor(readinessScore) }}>
              {readinessScore}
            </span>
            <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-muted)' }}>/ 100</span>
          </div>
        </div>

        {/* Readiness Score Progress Bar */}
        <div style={{ width: '100%', height: '10px', backgroundColor: '#F3E8FF', borderRadius: '6px', overflow: 'hidden', marginBottom: '1rem' }}>
          <div
            style={{
              width: `${Math.min(100, Math.max(0, readinessScore))}%`,
              height: '100%',
              backgroundColor: getReadinessColor(readinessScore),
              transition: 'width 0.4s ease',
            }}
          />
        </div>

        {/* Readiness Breakdown Components */}
        {readinessScoreBreakdown && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
            <div style={{ backgroundColor: '#FAF5FF', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid #F3E8FF' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Personnel</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#581C87' }}>{readinessScoreBreakdown.personnel ?? 0} / 25 pts</div>
            </div>

            <div style={{ backgroundColor: '#FAF5FF', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid #F3E8FF' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Dispatched Units</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#581C87' }}>{readinessScoreBreakdown.dispatchedResources ?? 0} / 35 pts</div>
            </div>

            <div style={{ backgroundColor: '#FAF5FF', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid #F3E8FF' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Proximity/Fleet</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#581C87' }}>{readinessScoreBreakdown.resourceAvailability ?? 0} / 20 pts</div>
            </div>

            <div style={{ backgroundColor: '#FAF5FF', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid #F3E8FF' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>SLA Health</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#581C87' }}>{readinessScoreBreakdown.sla ?? 0} / 20 pts</div>
            </div>
          </div>
        )}
      </div>

      {/* GRID: SEVERITY ANALYSIS & PERSONNEL/SLA */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
        {/* SECTION B: SEVERITY ANALYSIS */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '1.1rem', borderRadius: 'var(--radius-md)', border: '1px solid #E9D5FF' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#581C87', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Zap size={16} style={{ color: '#9333EA' }} /> Severity Analysis
            </h4>
            <span className={`badge ${getSeverityBadgeClass(severityLevel)}`}>
              {severityLevel} ({severityScore} pts)
            </span>
          </div>

          {severityReasons && severityReasons.length > 0 ? (
            <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.85rem', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {severityReasons.map((reason, idx) => (
                <li key={idx}>{reason}</li>
              ))}
            </ul>
          ) : (
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Routine severity criteria evaluated.</div>
          )}
        </div>

        {/* SECTION C & D: SLA STATUS & PERSONNEL */}
        <div style={{ backgroundColor: '#FFFFFF', padding: '1.1rem', borderRadius: 'var(--radius-md)', border: '1px solid #E9D5FF', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {/* Personnel Status */}
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <User size={14} style={{ color: '#7E22CE' }} /> Assigned First Personnel
            </h4>
            {isResponderAssigned ? (
              <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyBetween: 'space-between', gap: '0.5rem' }}>
                <span><strong>{assignedResponderName}</strong></span>
                <span className="badge badge-mint" style={{ fontSize: '0.75rem' }}>
                  Workload: {responderActiveWorkload} active
                </span>
              </div>
            ) : (
              <div style={{ fontSize: '0.85rem', color: '#B91C1C', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <AlertTriangle size={15} /> No primary responder currently assigned.
              </div>
            )}
          </div>

          <div style={{ borderTop: '1px solid #F3E8FF', paddingTop: '0.75rem' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock size={14} style={{ color: '#7E22CE' }} /> SLA Response Clock Health
            </h4>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>
                Elapsed: <strong>{elapsedMinutes}m</strong> | Remaining: <strong>{slaMinutesRemaining}m</strong>
              </div>
              <span className={`badge ${slaStatus === 'BREACHED' ? 'badge-pink' : slaStatus === 'WARNING' ? 'badge-yellow' : 'badge-mint'}`}>
                {slaStatus}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION E: RECOMMENDED RESOURCES & DISPATCH STATUS */}
      <div style={{ backgroundColor: '#FFFFFF', padding: '1.1rem', borderRadius: 'var(--radius-md)', border: '1px solid #E9D5FF', marginBottom: '1.25rem' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#581C87', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Truck size={16} style={{ color: '#9333EA' }} /> Resource Dispatch Alignment Analysis
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>Recommended Unit Types:</span>
            {recommendedResourceTypes && recommendedResourceTypes.length > 0 ? (
              recommendedResourceTypes.map((type, i) => (
                <span key={type} className={`badge ${i === 0 ? 'badge-blue' : 'badge-lavender'}`}>
                  {i === 0 ? `PRIMARY: ${type.replace(/_/g, ' ')}` : type.replace(/_/g, ' ')}
                </span>
              ))
            ) : (
              <span style={{ color: 'var(--text-muted)' }}>Standard Rescue Squad</span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', flexWrap: 'wrap' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>Primary Resource Dispatched:</span>
            {primaryResourceDispatched ? (
              <span className="badge badge-mint" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <CheckCircle2 size={13} /> YES (Primary unit on scene)
              </span>
            ) : (
              <span className="badge badge-pink" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <AlertTriangle size={13} /> NO (Primary recommended unit missing)
              </span>
            )}
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--text-main)', marginTop: '0.25rem' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>Currently Dispatched Units ({currentlyDispatchedResources ? currentlyDispatchedResources.length : 0}):</span>
            {currentlyDispatchedResources && currentlyDispatchedResources.length > 0 ? (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.35rem' }}>
                {currentlyDispatchedResources.map((res) => (
                  <span key={res.id} className="badge badge-mint">
                    {res.resourceCode} ({res.name} — {res.typeDisplayName || res.type})
                  </span>
                ))}
              </div>
            ) : (
              <span style={{ color: 'var(--text-muted)', marginLeft: '0.35rem' }}>No physical units currently dispatched.</span>
            )}
          </div>
        </div>
      </div>

      {/* SECTION F: NEARBY AVAILABLE RESOURCES (PROXIMITY) */}
      <div style={{ backgroundColor: '#FFFFFF', padding: '1.1rem', borderRadius: 'var(--radius-md)', border: '1px solid #E9D5FF', marginBottom: '1.25rem' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#581C87', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <MapPin size={16} style={{ color: '#9333EA' }} /> Fleet Proximity Roster (Haversine Distance)
        </h4>

        {nearbyAvailableResources && nearbyAvailableResources.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.75rem' }}>
            {nearbyAvailableResources.map((unit) => (
              <div
                key={unit.resourceId}
                style={{
                  backgroundColor: '#FAF5FF',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem',
                  border: unit.isRecommended ? '1.5px solid #C084FC' : '1px solid #F3E8FF',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.3rem',
                  fontSize: '0.85rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="badge badge-blue">{unit.resourceCode}</span>
                  {unit.isRecommended && (
                    <span className="badge badge-mint" style={{ fontSize: '0.7rem' }}>
                      RECOMMENDED
                    </span>
                  )}
                </div>
                <div style={{ fontWeight: 800, color: 'var(--text-main)', marginTop: '0.15rem' }}>
                  {unit.name}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  Type: <strong>{unit.typeDisplayName || unit.type}</strong>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  Station: <strong>{unit.stationLocation || 'N/A'}</strong>
                </div>
                <div style={{ color: '#6B21A8', fontWeight: 800, fontSize: '0.8rem', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <MapPin size={13} /> Distance: {unit.distanceKm != null ? `${unit.distanceKm} km` : 'N/A (No coords)'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '0.75rem 0' }}>
            No available fleet units found in roster inventory.
          </div>
        )}
      </div>

      {/* SECTION G: EXPLAINABLE RECOMMENDATIONS */}
      {actionRecommendations && actionRecommendations.length > 0 && (
        <div style={{ backgroundColor: '#FAF5FF', padding: '1.1rem', borderRadius: 'var(--radius-md)', border: '1.5px solid #D8B4FE' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#581C87', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ListChecks size={18} style={{ color: '#7E22CE' }} /> Explainable Action Recommendations
          </h4>

          <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.875rem', color: '#4C1D95', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {actionRecommendations.map((rec, idx) => (
              <li key={idx} style={{ lineHeight: 1.5, fontWeight: 600 }}>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
};

export default EmergencyIntelligencePanel;
