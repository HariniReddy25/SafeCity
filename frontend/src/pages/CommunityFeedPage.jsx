import React, { useEffect, useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { getCommunitySafetyFeedApi } from '../services/communityService';
import { Users, MapPin, Clock, Search, ShieldCheck, Filter, AlertCircle } from 'lucide-react';

const CATEGORY_PILLS = [
  { value: 'ALL', label: 'All Incidents' },
  { value: 'ROAD_ACCIDENT', label: '🚗 Road Accidents' },
  { value: 'FIRE', label: '🔥 Fire Incidents' },
  { value: 'MEDICAL_EMERGENCY', label: '🚑 Medical Emergencies' },
  { value: 'CRIME', label: '🛡️ Crime & Theft' },
  { value: 'PUBLIC_SAFETY_HAZARD', label: '⚠️ Public Hazards' },
];

const CommunityFeedPage = () => {
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const loadCommunityFeed = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getCommunitySafetyFeedApi();
      setFeed(data || []);
    } catch (err) {
      console.error('Failed to load community feed:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load community safety feed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommunityFeed();
  }, []);

  const filteredFeed = feed.filter((item) => {
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const loc = (item.generalLocation || '').toLowerCase();
      const cat = (item.categoryDisplayName || '').toLowerCase();
      if (!loc.includes(q) && !cat.includes(q)) return false;
    }
    return true;
  });

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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SUBMITTED':
        return <span className="badge badge-blue">Reported</span>;
      case 'IN_PROGRESS':
        return <span className="badge badge-peach">Responding</span>;
      case 'RESOLVED':
        return <span className="badge badge-mint">Resolved</span>;
      default:
        return <span className="badge badge-lavender">{status}</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', maxWidth: '950px', margin: '0 auto' }}>
      {/* HERO BANNER */}
      <div
        style={{
          backgroundColor: 'var(--pastel-yellow)',
          borderRadius: 'var(--radius-lg)',
          padding: '2.25rem 2rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
          <span className="badge badge-yellow">COMMUNITY SAFETY FEED</span>
          <span style={{ fontSize: '0.8rem', color: '#713F12', fontWeight: 600 }}>Anonymized Public Record</span>
        </div>
        <h1 style={{ fontSize: '2.2rem', color: '#713F12', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users size={32} style={{ color: '#EAB308' }} /> Verified Public Incident Feed
        </h1>
        <p style={{ color: '#854D0E', fontSize: '0.95rem', marginTop: '0.4rem', maxWidth: '720px', margin: 0 }}>
          View verified safety events in your region. Personal details, citizen names, and sensitive notes are strictly anonymized for public privacy.
        </p>
      </div>

      {/* SEARCH AND FILTER TOOLBAR */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by sector, city area, or category..."
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 2.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--border-subtle)',
                fontSize: '0.9rem',
                outline: 'none',
                backgroundColor: '#FFFFFF',
              }}
            />
          </div>
        </div>

        {/* CATEGORY FILTER PILLS */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {CATEGORY_PILLS.map((pill) => (
            <button
              key={pill.value}
              onClick={() => setSelectedCategory(pill.value)}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                border: selectedCategory === pill.value ? '2px solid #CA8A04' : '1px solid var(--border-subtle)',
                backgroundColor: selectedCategory === pill.value ? '#FEF08A' : '#FFFFFF',
                color: selectedCategory === pill.value ? '#713F12' : 'var(--text-main)',
                fontWeight: 700,
                fontSize: '0.825rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* FEED CONTENT */}
      {loading ? (
        <LoadingState message="Loading community safety stream..." />
      ) : error ? (
        <ErrorState title="Community Feed Error" message={error} onRetry={loadCommunityFeed} />
      ) : filteredFeed.length === 0 ? (
        <Card hoverEffect={false}>
          <div style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-muted)' }}>
            <AlertCircle size={40} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 0.25rem 0' }}>
              No Verified Incidents Found
            </h3>
            <p style={{ fontSize: '0.875rem', margin: 0 }}>
              No public safety incidents match the selected search filter.
            </p>
          </div>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredFeed.map((item) => (
            <Card key={item.id} hoverEffect={true} style={{ padding: '1.35rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <strong style={{ fontSize: '1.05rem', color: '#1E3A8A' }}>{item.reportId}</strong>
                    <span className="badge badge-yellow">{item.categoryDisplayName}</span>
                    {getStatusBadge(item.status)}
                    {getPriorityBadge(item.priority)}
                  </div>
                  <div style={{ fontSize: '0.775rem', color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Clock size={13} /> {new Date(item.incidentDateTime || item.createdAt).toLocaleString()}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  <MapPin size={16} style={{ color: 'var(--danger-accent)' }} />
                  <span>{item.generalLocation}</span>
                </div>

                <div style={{ backgroundColor: 'var(--pastel-blue)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: '#1E3A8A', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheck size={18} style={{ color: '#2563EB', flexShrink: 0 }} />
                  <span>{item.safetyInformation}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommunityFeedPage;
