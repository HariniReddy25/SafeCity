import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMyReportsApi, getMyReportSummaryApi, getAvailableSheltersPublicApi } from '../services/api';
import { getAiSafetyTipsApi } from '../services/aiService';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  FileText,
  MapPin,
  Ambulance,
  PlusCircle,
  Activity,
  CheckCircle2,
  Clock,
  ChevronRight,
  Sparkles,
  Users,
  MessageSquare,
  BookOpen,
  Home,
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import FeedbackModal from '../components/FeedbackModal';
import EmergencyAlertBanner from '../components/EmergencyAlertBanner';

const CitizenDashboard = () => {
  const { user } = useAuth();

  const [summary, setSummary] = useState(null);
  const [recentReports, setRecentReports] = useState([]);
  const [safetyTips, setSafetyTips] = useState([]);
  const [shelters, setShelters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [summaryData, reportsData, tipsData, shelterData] = await Promise.all([
        getMyReportSummaryApi(),
        getMyReportsApi(),
        getAiSafetyTipsApi('Hyderabad'),
        getAvailableSheltersPublicApi().catch(() => []),
      ]);
      setSummary(summaryData);
      setRecentReports(reportsData ? reportsData.slice(0, 5) : []);
      setSafetyTips(tipsData || []);
      setShelters(shelterData || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* CIVIL DEFENSE EMERGENCY ALERTS BANNER */}
      <EmergencyAlertBanner />

      {/* 1. WELCOME BANNER */}
      <div
        style={{
          backgroundColor: 'var(--pastel-blue)',
          borderRadius: 'var(--radius-lg)',
          padding: '2.5rem 2rem',
          boxShadow: 'var(--shadow-sm)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
              <span className="badge badge-blue">CITIZEN SAFETY DASHBOARD</span>
              <span style={{ fontSize: '0.8rem', color: '#1E3A8A' }}>SafeCity Active</span>
            </div>
            <h1 style={{ fontSize: '2.2rem', color: '#1E3A8A', fontWeight: 800, margin: 0 }}>
              Welcome back, {user?.fullName || 'Citizen'}
            </h1>
            <p style={{ color: '#1E293B', fontSize: '0.95rem', marginTop: '0.4rem', maxWidth: '600px' }}>
              Your civic safety portal is active. Report incidents immediately or track status updates on your open distress requests.
            </p>
          </div>

          <Link to="/citizen/report-emergency">
            <Button variant="danger" size="lg" icon={AlertTriangle}>
              Report Emergency Now
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. EMERGENCY SUMMARY CARDS (LOADED LIVE FROM MYSQL DATABASE) */}
      <div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem' }}>
          My Emergency Summary Metrics
        </h3>

        {loading ? (
          <LoadingState message="Calculating real-time report metrics from database..." />
        ) : error ? (
          <ErrorState title="Dashboard Error" message={error} onRetry={loadDashboardData} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            <Card pastelBg="blue" hoverEffect={true}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E40AF', textTransform: 'uppercase' }}>
                Active Emergencies
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1E3A8A', margin: '0.25rem 0' }}>
                {summary?.activeReports ?? 0}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#1E40AF' }}>
                Reports under review or dispatch
              </div>
            </Card>

            <Card pastelBg="yellow" hoverEffect={true}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#854D0E', textTransform: 'uppercase' }}>
                Total Reports Submitted
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#713F12', margin: '0.25rem 0' }}>
                {summary?.totalReports ?? 0}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#854D0E' }}>
                Lifetime reported incidents
              </div>
            </Card>

            <Card pastelBg="mint" hoverEffect={true}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#15803D', textTransform: 'uppercase' }}>
                Resolved Incidents
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#14532D', margin: '0.25rem 0' }}>
                {summary?.resolvedReports ?? 0}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#15803D' }}>
                Closed and resolved emergencies
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* 3. QUICK ACTION CARDS */}
      <div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem' }}>
          Quick Safety Actions
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
          <Link to="/citizen/report-emergency">
            <Card pastelBg="pink" style={{ cursor: 'pointer', height: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <AlertTriangle size={24} style={{ color: '#9F1239' }} />
                <h4 style={{ fontSize: '1.1rem', color: '#881337', margin: 0 }}>Report Emergency</h4>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#9F1239', margin: 0 }}>
                Submit distress report with GPS location and photo evidence.
              </p>
            </Card>
          </Link>

          <Link to="/citizen/my-reports">
            <Card pastelBg="yellow" style={{ cursor: 'pointer', height: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <FileText size={24} style={{ color: '#854D0E' }} />
                <h4 style={{ fontSize: '1.1rem', color: '#713F12', margin: 0 }}>My Reports List</h4>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#713F12', margin: 0 }}>
                Track live status updates and timelines of your submitted reports.
              </p>
            </Card>
          </Link>

          <Link to="/citizen/safety-map" style={{ textDecoration: 'none' }}>
            <Card pastelBg="lavender" style={{ cursor: 'pointer', height: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <MapPin size={24} style={{ color: '#6B21A8' }} />
                <h4 style={{ fontSize: '1.1rem', color: '#581C87', margin: 0 }}>Safety Map</h4>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#581C87', margin: 0 }}>
                Explore safety map, heatmap, and danger zones.
              </p>
            </Card>
          </Link>

          <Link to="/citizen/ai-assistant" style={{ textDecoration: 'none' }}>
            <Card pastelBg="purple" style={{ height: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <Sparkles size={24} style={{ color: '#7C3AED' }} />
                <h4 style={{ fontSize: '1.1rem', color: '#581C87', margin: 0 }}>AI Safety Assistant</h4>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#6B21A8', margin: 0 }}>
                Ask AI about emergency procedures, safety guides, and reporting tips.
              </p>
            </Card>
          </Link>

          <Link to="/citizen/community" style={{ textDecoration: 'none' }}>
            <Card pastelBg="mint" style={{ cursor: 'pointer', height: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <Users size={24} style={{ color: '#15803D' }} />
                <h4 style={{ fontSize: '1.1rem', color: '#14532D', margin: 0 }}>Community Safety Feed</h4>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#14532D', margin: 0 }}>
                View verified, public-safe emergency reports in your region.
              </p>
            </Card>
          </Link>

          <Link to="/citizen/safety-tips" style={{ textDecoration: 'none' }}>
            <Card pastelBg="blue" style={{ cursor: 'pointer', height: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <BookOpen size={24} style={{ color: '#1E40AF' }} />
                <h4 style={{ fontSize: '1.1rem', color: '#1E3A8A', margin: 0 }}>Safety Tips Library</h4>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#1E3A8A', margin: 0 }}>
                Practical guidelines for fire, road accident, flood, and cyber safety.
              </p>
            </Card>
          </Link>

          <div onClick={() => setShowFeedbackModal(true)} style={{ cursor: 'pointer' }}>
            <Card pastelBg="peach" style={{ height: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <MessageSquare size={24} style={{ color: '#C2410C' }} />
                <h4 style={{ fontSize: '1.1rem', color: '#9A3412', margin: 0 }}>Rate & Give Feedback</h4>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#9A3412', margin: 0 }}>
                Submit citizen rating and feedback on emergency response services.
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* EMERGENCY EVACUATION SHELTERS CARD (FEATURE 8) */}
      <Card pastelBg="mint" hoverEffect={false} style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#14532D', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Home size={20} style={{ color: '#16A34A' }} />
            Active Civil Defense Evacuation Shelters
          </h3>
          <Link to="/citizen/safety-map" style={{ fontSize: '0.825rem', fontWeight: 700, color: '#15803D' }}>
            View on Interactive Map →
          </Link>
        </div>

        {shelters.length === 0 ? (
          <div style={{ fontSize: '0.85rem', color: '#166534', padding: '0.5rem 0' }}>
            No active emergency shelters registered in your sector.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            {shelters.slice(0, 3).map((shelter) => (
              <div key={shelter.id} style={{ backgroundColor: '#FFFFFF', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #BBF7D0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <strong style={{ fontSize: '0.8rem', color: '#14532D' }}>{shelter.shelterCode}</strong>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '10px',
                      backgroundColor: shelter.status === 'AVAILABLE' ? '#DCFCE7' : '#FEF3C7',
                      color: shelter.status === 'AVAILABLE' ? '#15803D' : '#92400E',
                    }}
                  >
                    {shelter.statusDisplayName || shelter.status}
                  </span>
                </div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#14532D', margin: '0 0 0.25rem 0' }}>{shelter.name}</h4>
                <p style={{ fontSize: '0.8rem', color: '#166534', margin: '0 0 0.5rem 0' }}>{shelter.address}</p>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: shelter.availableSlots > 0 ? '#15803D' : '#DC2626' }}>
                  Occupancy: {shelter.currentOccupancy} / {shelter.capacity} ({shelter.availableSlots} slots left)
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* AI RECOMMENDED SAFETY TIPS CARD (PHASE 6) */}
      <Card pastelBg="lavender" hoverEffect={false} style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#581C87', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={20} style={{ color: '#7C3AED' }} />
            Recommended Safety Tips (AI Assisted)
          </h3>
          <span style={{ fontSize: '0.775rem', fontWeight: 700, color: '#7C3AED' }}>Context: Hyderabad Sector</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {safetyTips.map((tip) => (
            <div key={tip.id} style={{ backgroundColor: '#FFFFFF', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #E9D5FF' }}>
              <div style={{ fontSize: '1.25rem', marginBottom: '0.4rem' }}>{tip.iconSymbol}</div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#581C87', margin: '0 0 0.25rem 0' }}>{tip.title}</h4>
              <p style={{ fontSize: '0.8rem', color: '#4C1D95', margin: 0, lineHeight: 1.4 }}>{tip.tip}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* 4. RECENT REPORTS SECTION */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
            My Recent Emergency Reports
          </h3>
          <Link to="/citizen/my-reports" style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1E40AF' }}>
            View All Reports →
          </Link>
        </div>

        {recentReports.length === 0 ? (
          <Card hoverEffect={false}>
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <p style={{ color: 'var(--text-muted)', margin: '0 0 1rem 0' }}>
                No recent emergency reports submitted yet.
              </p>
              <Link to="/citizen/report-emergency">
                <Button variant="danger" size="sm" icon={PlusCircle}>
                  Report Emergency
                </Button>
              </Link>
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
                      <span className="badge badge-yellow">{report.priority}</span>
                    </div>
                    <div style={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {report.categoryDisplayName}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', marginTop: '0.2rem' }}>
                      Submitted on {new Date(report.createdAt).toLocaleString()}
                    </div>
                  </div>

                  <Link to={`/citizen/reports/${report.id}`}>
                    <Button variant="outline" size="sm" icon={ChevronRight}>
                      Details
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* FEEDBACK MODAL DIALOG */}
      <FeedbackModal isOpen={showFeedbackModal} onClose={() => setShowFeedbackModal(false)} />
    </div>
  );
};

export default CitizenDashboard;
