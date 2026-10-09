import React, { useState, useMemo } from 'react';
import Card from './Card';
import {
  ShieldAlert,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle2,
  PieChart,
  Info,
  Calendar,
  Layers,
  Building2,
} from 'lucide-react';
import {
  calculateAreaSafetyScore,
  getSafetySummary,
  calculateCategoryBreakdown,
  calculatePriorityBreakdown,
  filterReportsByTimeframe,
} from '../services/safetyIntelligence';

const SafetyIntelligencePanel = ({ reports = [], cityName = 'Active Area', dangerZoneCount = 0 }) => {
  const [timeframe, setTimeframe] = useState('all'); // 'all' | 'today' | '7days' | '30days'

  // Filter reports by active timeframe
  const timeframeFilteredReports = useMemo(() => {
    return filterReportsByTimeframe(reports, timeframe);
  }, [reports, timeframe]);

  // Calculate Safety Score & Intelligence metrics
  const scoreData = useMemo(() => {
    return calculateAreaSafetyScore(timeframeFilteredReports);
  }, [timeframeFilteredReports]);

  const summary = useMemo(() => {
    return getSafetySummary(timeframeFilteredReports, dangerZoneCount);
  }, [timeframeFilteredReports, dangerZoneCount]);

  const categoryBreakdown = useMemo(() => {
    return calculateCategoryBreakdown(timeframeFilteredReports);
  }, [timeframeFilteredReports]);

  const priorityBreakdown = useMemo(() => {
    return calculatePriorityBreakdown(timeframeFilteredReports);
  }, [timeframeFilteredReports]);

  if (!reports || reports.length === 0) {
    return (
      <Card pastelBg="yellow" hoverEffect={false} style={{ padding: '1.75rem', marginTop: '1.5rem', border: '1.5px solid #FDE047' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              backgroundColor: '#FEF08A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Info size={24} style={{ color: '#A16207' }} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#713F12', margin: 0 }}>
              Not enough reported incidents to calculate a reliable safety score.
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#854D0E', marginTop: '0.25rem', margin: 0 }}>
              Safety Intelligence requires reported emergency data in the active view/filter selection. Select another city or clear active filters to view analytics.
            </p>
            <div style={{ fontSize: '0.775rem', color: '#A16207', fontWeight: 700, marginTop: '0.5rem' }}>
              Safety score is based on reported emergency incidents.
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
      {/* SECTION HEADER & TIMEFRAME SELECTOR */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
            <span className="badge badge-lavender">REAL-DATA SAFETY ANALYTICS</span>
            <span style={{ fontSize: '0.8rem', color: '#6B21A8', fontWeight: 600 }}>Phase 5E Active</span>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={26} style={{ color: 'var(--primary-accent)' }} />
            Safety Intelligence & Area Safety Score — {cityName}
          </h2>
        </div>

        {/* TIMEFRAME FILTER BUTTONS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#FFFFFF', padding: '4px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border-subtle)' }}>
          {[
            { id: 'all', label: 'All Time' },
            { id: 'today', label: 'Today (24h)' },
            { id: '7days', label: 'Last 7 Days' },
            { id: '30days', label: 'Last 30 Days' },
          ].map((tf) => (
            <button
              key={tf.id}
              onClick={() => setTimeframe(tf.id)}
              style={{
                padding: '0.4rem 0.8rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: timeframe === tf.id ? 'var(--primary-accent)' : 'transparent',
                color: timeframe === tf.id ? '#FFFFFF' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* TOP ROW: SAFETY SCORE CARD & SUMMARY METRICS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 340px) 1fr', gap: '1.5rem', alignItems: 'stretch' }}>
        {/* AREA SAFETY SCORE CARD */}
        <Card
          hoverEffect={false}
          style={{
            backgroundColor: scoreData.bgColor,
            border: `2px solid ${scoreData.borderColor}`,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '1.5rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.825rem', fontWeight: 800, color: scoreData.color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Area Safety Score
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: '12px',
                  backgroundColor: '#FFFFFF',
                  color: scoreData.color,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                }}
              >
                {scoreData.levelLabel}
              </span>
            </div>

            {/* CIRCULAR SCORE GAUGE DISPLAY */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', margin: '0.75rem 0' }}>
              <span style={{ fontSize: '3.6rem', fontWeight: 900, color: scoreData.color, lineHeight: 1 }}>
                {scoreData.score}
              </span>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#64748B' }}>/ 100</span>
            </div>

            {/* SCORE PROGRESS BAR */}
            <div style={{ width: '100%', height: '10px', backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: '5px', overflow: 'hidden', marginBottom: '0.9rem' }}>
              <div
                style={{
                  width: `${scoreData.score}%`,
                  height: '100%',
                  backgroundColor: scoreData.color,
                  transition: 'width 0.6s ease',
                }}
              />
            </div>

            <p style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 600, margin: 0, lineHeight: 1.45 }}>
              {scoreData.description}
            </p>
          </div>

          <div style={{ marginTop: '1.25rem', paddingTop: '0.9rem', borderTop: '1px solid rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Info size={14} style={{ color: scoreData.color }} />
              <span>Safety score is based on reported emergency incidents.</span>
            </div>
          </div>
        </Card>

        {/* SAFETY SUMMARY METRICS GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          {/* TOTAL REPORTS */}
          <Card pastelBg="blue" hoverEffect={false} style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#1E40AF', marginBottom: '0.5rem' }}>
              <BarChart3 size={20} />
              <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase' }}>Total Incidents</span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#1E3A8A', lineHeight: 1.1 }}>
              {summary.totalReports}
            </div>
            <div style={{ fontSize: '0.775rem', color: '#2563EB', marginTop: '0.35rem', fontWeight: 600 }}>
              Reports in selected view
            </div>
          </Card>

          {/* HIGH / CRITICAL EMERGENCIES */}
          <Card pastelBg="pink" hoverEffect={false} style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#9F1239', marginBottom: '0.5rem' }}>
              <AlertTriangle size={20} />
              <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase' }}>Urgent / Critical</span>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#881337', lineHeight: 1.1 }}>
              {summary.highCriticalCount}
            </div>
            <div style={{ fontSize: '0.775rem', color: '#BE123C', marginTop: '0.35rem', fontWeight: 600 }}>
              High & Critical incidents
            </div>
          </Card>

          {/* MOST REPORTED CATEGORY */}
          <Card pastelBg="purple" hoverEffect={false} style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#6B21A8', marginBottom: '0.5rem' }}>
              <PieChart size={20} />
              <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase' }}>Top Category</span>
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#581C87', lineHeight: 1.2, wordBreak: 'break-word' }}>
              {summary.topCategory}
            </div>
            <div style={{ fontSize: '0.775rem', color: '#7C3AED', marginTop: '0.35rem', fontWeight: 600 }}>
              Most frequent incident
            </div>
          </Card>

          {/* DANGER ZONE STATUS */}
          <Card pastelBg="mint" hoverEffect={false} style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#15803D', marginBottom: '0.5rem' }}>
              <Building2 size={20} />
              <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase' }}>Sector Status</span>
            </div>
            <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#14532D', lineHeight: 1.2 }}>
              {summary.dangerZoneStatus}
            </div>
            <div style={{ fontSize: '0.775rem', color: '#16A34A', marginTop: '0.35rem', fontWeight: 600 }}>
              Spatial cluster density
            </div>
          </Card>
        </div>
      </div>

      {/* BOTTOM ROW: INCIDENT STATISTICAL BREAKDOWNS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* INCIDENTS BY CATEGORY BREAKDOWN */}
        <Card hoverEffect={false} style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PieChart size={18} style={{ color: 'var(--primary-accent)' }} />
            Incidents by Category
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {categoryBreakdown.map((item) => (
              <div key={item.category}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                  <span style={{ color: 'var(--text-main)' }}>{item.category}</span>
                  <span style={{ color: 'var(--text-muted)' }}>
                    {item.count} ({item.percentage}%)
                  </span>
                </div>
                <div style={{ width: '100%', height: '8px', backgroundColor: '#F1F5F9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${item.percentage}%`,
                      height: '100%',
                      backgroundColor: 'var(--primary-accent)',
                      borderRadius: '4px',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* INCIDENTS BY PRIORITY BREAKDOWN */}
        <Card hoverEffect={false} style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart3 size={18} style={{ color: 'var(--primary-accent)' }} />
            Priority Distribution
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem' }}>
            <div style={{ padding: '0.9rem', borderRadius: 'var(--radius-md)', backgroundColor: '#FEF2F2', border: '1.5px solid #FCA5A5' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#991B1B' }}>🚨 CRITICAL</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#991B1B', marginTop: '0.2rem' }}>{priorityBreakdown.CRITICAL}</div>
              <div style={{ fontSize: '0.7rem', color: '#B91C1C' }}>Life-threatening emergency</div>
            </div>

            <div style={{ padding: '0.9rem', borderRadius: 'var(--radius-md)', backgroundColor: '#FFEDD5', border: '1.5px solid #FDBA74' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#9A3412' }}>⚠️ HIGH</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#9A3412', marginTop: '0.2rem' }}>{priorityBreakdown.HIGH}</div>
              <div style={{ fontSize: '0.7rem', color: '#C2410C' }}>Urgent report</div>
            </div>

            <div style={{ padding: '0.9rem', borderRadius: 'var(--radius-md)', backgroundColor: '#FEF3C7', border: '1.5px solid #FDE68A' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#92400E' }}>⚡ MEDIUM</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#92400E', marginTop: '0.2rem' }}>{priorityBreakdown.MEDIUM}</div>
              <div style={{ fontSize: '0.7rem', color: '#D97706' }}>Moderate concern</div>
            </div>

            <div style={{ padding: '0.9rem', borderRadius: 'var(--radius-md)', backgroundColor: '#EFF6FF', border: '1.5px solid #BFDBFE' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1E40AF' }}>ℹ️ LOW</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#1E40AF', marginTop: '0.2rem' }}>{priorityBreakdown.LOW}</div>
              <div style={{ fontSize: '0.7rem', color: '#2563EB' }}>Minor hazard</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SafetyIntelligencePanel;
