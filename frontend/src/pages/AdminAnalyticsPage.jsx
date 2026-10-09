import React, { useEffect, useState } from 'react';
import { getOperationalAnalyticsAdminApi } from '../services/api';
import {
  Activity,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Ambulance,
  Copy,
  TrendingUp,
  RefreshCw,
  Users,
  Layers,
  BarChart3,
  Flame,
  Check,
  UserCheck,
  UserX,
  FileText,
  PieChart,
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';

const AdminAnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getOperationalAnalyticsAdminApi();
      setAnalytics(data);
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || 'Failed to fetch operational analytics data.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'CRITICAL':
        return 'badge-pink';
      case 'HIGH':
        return 'badge-peach';
      case 'MEDIUM':
        return 'badge-yellow';
      case 'LOW':
        return 'badge-blue';
      default:
        return 'badge-blue';
    }
  };

  const formatCategoryName = (name) => {
    if (!name) return 'Other';
    return name
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  if (loading) {
    return <LoadingState message="Calculating system operational & SLA analytics..." />;
  }

  if (error) {
    return (
      <ErrorState
        title="Analytics Error"
        message={error}
        onRetry={loadAnalytics}
      />
    );
  }

  if (!analytics) {
    return (
      <Card hoverEffect={false}>
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
          No analytics data available.
        </div>
      </Card>
    );
  }

  const {
    totalIncidents = 0,
    slaComplianceRate = 100,
    totalSlaBreachedIncidents = 0,
    slaBreachesByPriority = {},
    avgFirstResponseTimeMinutes = 0,
    avgAssignmentTimeMinutes = 0,
    avgResolutionTimeMinutes = 0,
    categoryCounts = {},
    categoryPercentages = {},
    priorityCounts = {},
    priorityPercentages = {},
    totalResources = 0,
    availableResources = 0,
    dispatchedResources = 0,
    maintenanceResources = 0,
    offlineResources = 0,
    resourceUtilizationRate = 0,
    resourceTypeBreakdown = {},
    totalResponders = 0,
    activeResponders = 0,
    inactiveResponders = 0,
    totalActiveAssignments = 0,
    avgActiveReportsPerResponder = 0,
    responderStats = [],
    totalReports = 0,
    totalMasterIncidents = 0,
    linkedReports = 0,
    standaloneReports = 0,
    deduplicationRatio = 0,
    totalEscalatedIncidents = 0,
    escalationRate = 0,
    escalationsByPriority = {},
    escalationsByCategory = {},
    dailyTrends = [],
  } = analytics;

  // Calculate max count for 7-day trend chart scaling
  const maxTrendCount = Math.max(1, ...dailyTrends.map((t) => t.count || 0));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* HEADER BANNER */}
      <div
        style={{
          backgroundColor: 'var(--pastel-lavender)',
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
            <span className="badge badge-lavender">OPERATIONS INTELLIGENCE</span>
            <span style={{ fontSize: '0.8rem', color: '#581C87' }}>SafeCity System Analytics</span>
          </div>
          <h1 style={{ fontSize: '2rem', color: '#581C87', fontWeight: 800, margin: 0 }}>
            Emergency Operations Analytics
          </h1>
          <p style={{ color: '#4C1D95', fontSize: '0.925rem', marginTop: '0.35rem', maxWidth: '640px' }}>
            Comprehensive post-incident performance metrics, SLA compliance rates, resource utilization, and operational trend analysis.
          </p>
        </div>

        <Button variant="outline" size="md" icon={RefreshCw} onClick={loadAnalytics}>
          Refresh Metrics
        </Button>
      </div>

      {/* SECTION A: OVERVIEW CARDS */}
      <div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={20} style={{ color: '#7C3AED' }} /> System Overview & KPIs
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem' }}>
          <Card pastelBg="blue" hoverEffect={true}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1E40AF', textTransform: 'uppercase' }}>
                Total Incidents
              </span>
              <ShieldAlert size={18} style={{ color: '#1E40AF' }} />
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#1E3A8A', margin: '0.25rem 0' }}>
              {totalIncidents}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#1E40AF' }}>All reported emergencies</div>
          </Card>

          <Card pastelBg="mint" hoverEffect={true}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#15803D', textTransform: 'uppercase' }}>
                SLA Compliance
              </span>
              <CheckCircle2 size={18} style={{ color: '#15803D' }} />
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#14532D', margin: '0.25rem 0' }}>
              {slaComplianceRate.toFixed(1)}%
            </div>
            <div style={{ fontSize: '0.75rem', color: '#15803D' }}>Handling within SLA limit</div>
          </Card>

          <Card pastelBg="pink" hoverEffect={true}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#BE123C', textTransform: 'uppercase' }}>
                SLA Breached
              </span>
              <AlertTriangle size={18} style={{ color: '#BE123C' }} />
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#881337', margin: '0.25rem 0' }}>
              {totalSlaBreachedIncidents}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#BE123C' }}>Exceeded target window</div>
          </Card>

          <Card pastelBg="peach" hoverEffect={true}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#C2410C', textTransform: 'uppercase' }}>
                Escalation Rate
              </span>
              <TrendingUp size={18} style={{ color: '#C2410C' }} />
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#7C2D12', margin: '0.25rem 0' }}>
              {escalationRate.toFixed(1)}%
            </div>
            <div style={{ fontSize: '0.75rem', color: '#C2410C' }}>Auto-escalated incidents</div>
          </Card>

          <Card pastelBg="lavender" hoverEffect={true}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6B21A8', textTransform: 'uppercase' }}>
                Total Resources
              </span>
              <Ambulance size={18} style={{ color: '#6B21A8' }} />
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#581C87', margin: '0.25rem 0' }}>
              {totalResources}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6B21A8' }}>Fleet units in system</div>
          </Card>

          <Card pastelBg="yellow" hoverEffect={true}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#854D0E', textTransform: 'uppercase' }}>
                Master Incidents
              </span>
              <Copy size={18} style={{ color: '#854D0E' }} />
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#713F12', margin: '0.25rem 0' }}>
              {totalMasterIncidents}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#854D0E' }}>Merged duplicate clusters</div>
          </Card>
        </div>
      </div>

      {/* SECTION H: 7-DAY INCIDENT TREND */}
      <Card hoverEffect={false}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BarChart3 size={20} style={{ color: '#2563EB' }} /> 7-Day Incident Volume Trend
        </h3>

        {dailyTrends.length === 0 ? (
          <div style={{ textTransform: 'uppercase', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem' }}>
            No trend data available for current window
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '0.5rem', height: '180px', padding: '1rem 0.5rem 0 0.5rem', borderBottom: '2px solid var(--border-subtle)' }}>
              {dailyTrends.map((trend, idx) => {
                const heightPercent = maxTrendCount > 0 ? (trend.count / maxTrendCount) * 100 : 0;
                return (
                  <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#1E3A8A', marginBottom: '0.25rem' }}>
                      {trend.count}
                    </span>
                    <div
                      style={{
                        width: '70%',
                        maxWidth: '45px',
                        height: `${Math.max(6, heightPercent)}%`,
                        backgroundColor: 'var(--pastel-blue)',
                        borderTop: '3px solid #2563EB',
                        borderRadius: '4px 4px 0 0',
                        transition: 'height 0.3s ease',
                      }}
                      title={`${trend.date}: ${trend.count} incidents`}
                    />
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', marginTop: '0.6rem' }}>
              {dailyTrends.map((trend, idx) => (
                <div key={idx} style={{ flex: 1, textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  {trend.date ? trend.date.split('-').slice(1).join('/') : ''}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* TWO COLUMN GRID: SECTION B (SLA) & SECTION C (DISTRIBUTION) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {/* SECTION B: SLA & RESPONSE PERFORMANCE */}
        <Card hoverEffect={false}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={20} style={{ color: '#2563EB' }} /> SLA & Response Performance
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Timeline Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
              <div style={{ padding: '0.85rem', backgroundColor: '#F0F9FF', borderRadius: 'var(--radius-md)', border: '1px solid #BAE6FD', textAlign: 'center' }}>
                <div style={{ fontSize: '0.725rem', fontWeight: 700, color: '#0369A1', textTransform: 'uppercase' }}>
                  First Response
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0C4A6E', margin: '0.2rem 0' }}>
                  {avgFirstResponseTimeMinutes.toFixed(1)} <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>mins</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#0369A1' }}>Submitted $\rightarrow$ Reviewed</div>
              </div>

              <div style={{ padding: '0.85rem', backgroundColor: '#F5F3FF', borderRadius: 'var(--radius-md)', border: '1px solid #DDD6FE', textAlign: 'center' }}>
                <div style={{ fontSize: '0.725rem', fontWeight: 700, color: '#6D28D9', textTransform: 'uppercase' }}>
                  Assignment
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#4C1D95', margin: '0.2rem 0' }}>
                  {avgAssignmentTimeMinutes.toFixed(1)} <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>mins</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#6D28D9' }}>Submitted $\rightarrow$ Assigned</div>
              </div>

              <div style={{ padding: '0.85rem', backgroundColor: '#F0FDF4', borderRadius: 'var(--radius-md)', border: '1px solid #BBF7D0', textAlign: 'center' }}>
                <div style={{ fontSize: '0.725rem', fontWeight: 700, color: '#15803D', textTransform: 'uppercase' }}>
                  Resolution
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#14532D', margin: '0.2rem 0' }}>
                  {avgResolutionTimeMinutes.toFixed(1)} <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>mins</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#15803D' }}>Submitted $\rightarrow$ Resolved</div>
              </div>
            </div>

            {/* SLA Gauge Bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                <strong style={{ color: 'var(--text-main)' }}>Overall SLA Compliance Rate</strong>
                <strong style={{ color: slaComplianceRate >= 80 ? '#15803D' : '#BE123C' }}>
                  {slaComplianceRate.toFixed(1)}%
                </strong>
              </div>
              <div style={{ width: '100%', height: '12px', backgroundColor: 'var(--border-subtle)', borderRadius: '6px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${Math.min(100, Math.max(0, slaComplianceRate))}%`,
                    height: '100%',
                    backgroundColor: slaComplianceRate >= 80 ? '#22C55E' : slaComplianceRate >= 50 ? '#F59E0B' : '#EF4444',
                    borderRadius: '6px',
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>
            </div>

            {/* SLA Breaches by Priority */}
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                SLA Breaches Grouped by Priority
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                {Object.entries(slaBreachesByPriority).map(([prio, count]) => (
                  <div key={prio} style={{ padding: '0.6rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                    <span className={`badge ${getPriorityBadgeClass(prio)}`} style={{ fontSize: '0.7rem' }}>
                      {prio}
                    </span>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.2rem' }}>
                      {count}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* SECTION C: INCIDENT DISTRIBUTION */}
        <Card hoverEffect={false}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PieChart size={20} style={{ color: '#D97706' }} /> Category & Priority Distribution
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Category Breakdown */}
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                Top Incident Categories
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {Object.entries(categoryCounts)
                  .filter(([_, cnt]) => cnt > 0)
                  .slice(0, 5)
                  .map(([cat, count]) => {
                    const pct = categoryPercentages[cat] || 0;
                    return (
                      <div key={cat} style={{ fontSize: '0.8rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.15rem' }}>
                          <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{formatCategoryName(cat)}</span>
                          <span style={{ color: 'var(--text-muted)' }}>{count} ({pct.toFixed(1)}%)</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', backgroundColor: '#F59E0B', borderRadius: '4px' }} />
                        </div>
                      </div>
                    );
                  })}
                {Object.values(categoryCounts).every((c) => c === 0) && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No category data available</div>
                )}
              </div>
            </div>

            {/* Priority Breakdown */}
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                Priority Breakdown
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {Object.entries(priorityCounts).map(([prio, count]) => {
                  const pct = priorityPercentages[prio] || 0;
                  return (
                    <div key={prio} style={{ fontSize: '0.8rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.15rem' }}>
                        <span className={`badge ${getPriorityBadgeClass(prio)}`} style={{ fontSize: '0.7rem' }}>
                          {prio}
                        </span>
                        <span style={{ color: 'var(--text-muted)' }}>{count} ({pct.toFixed(1)}%)</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${pct}%`,
                            height: '100%',
                            backgroundColor: prio === 'CRITICAL' ? '#EF4444' : prio === 'HIGH' ? '#F97316' : prio === 'MEDIUM' ? '#F59E0B' : '#3B82F6',
                            borderRadius: '4px',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* SECTION D: RESOURCE UTILIZATION */}
      <Card hoverEffect={false}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Ambulance size={20} style={{ color: '#059669' }} /> Fleet Resource Utilization
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.85rem' }}>
            <span>Total: <strong>{totalResources}</strong></span>
            <span style={{ color: '#16A34A' }}>Available: <strong>{availableResources}</strong></span>
            <span style={{ color: '#2563EB' }}>Dispatched: <strong>{dispatchedResources}</strong></span>
            <span style={{ color: '#D97706' }}>Maintenance: <strong>{maintenanceResources}</strong></span>
            <span style={{ color: '#DC2626' }}>Offline: <strong>{offlineResources}</strong></span>
          </div>
        </div>

        {/* Overall Utilization Meter */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.85rem' }}>
            <strong style={{ color: 'var(--text-main)' }}>Fleet Active Utilization Rate</strong>
            <strong style={{ color: '#2563EB' }}>{resourceUtilizationRate.toFixed(1)}%</strong>
          </div>
          <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--border-subtle)', borderRadius: '5px', overflow: 'hidden' }}>
            <div style={{ width: `${resourceUtilizationRate}%`, height: '100%', backgroundColor: '#2563EB', borderRadius: '5px' }} />
          </div>
        </div>

        {/* Resource Type Breakdown Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-subtle)', textAlign: 'left' }}>
                <th style={{ padding: '0.6rem 0.5rem', color: 'var(--text-muted)' }}>Resource Type</th>
                <th style={{ padding: '0.6rem 0.5rem', color: 'var(--text-muted)' }}>Total</th>
                <th style={{ padding: '0.6rem 0.5rem', color: 'var(--text-muted)' }}>Available</th>
                <th style={{ padding: '0.6rem 0.5rem', color: 'var(--text-muted)' }}>Dispatched</th>
                <th style={{ padding: '0.6rem 0.5rem', color: 'var(--text-muted)' }}>Maintenance / Offline</th>
                <th style={{ padding: '0.6rem 0.5rem', color: 'var(--text-muted)' }}>Utilization Rate</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(resourceTypeBreakdown).map((typeStat) => (
                <tr key={typeStat.resourceType} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.65rem 0.5rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {typeStat.displayName || typeStat.resourceType}
                  </td>
                  <td style={{ padding: '0.65rem 0.5rem' }}>{typeStat.total}</td>
                  <td style={{ padding: '0.65rem 0.5rem', color: '#16A34A', fontWeight: 600 }}>{typeStat.available}</td>
                  <td style={{ padding: '0.65rem 0.5rem', color: '#2563EB', fontWeight: 600 }}>{typeStat.dispatched}</td>
                  <td style={{ padding: '0.65rem 0.5rem', color: 'var(--text-muted)' }}>
                    {typeStat.maintenance + typeStat.offline}
                  </td>
                  <td style={{ padding: '0.65rem 0.5rem', fontWeight: 700, color: '#1E3A8A' }}>
                    {typeStat.utilizationRate.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* SECTION E: RESPONDER STATISTICS */}
      <Card hoverEffect={false}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={20} style={{ color: '#7C3AED' }} /> Responder Operations & Workload
          </h3>
          <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.85rem' }}>
            <span>Total Responders: <strong>{totalResponders}</strong></span>
            <span style={{ color: '#16A34A' }}>Active: <strong>{activeResponders}</strong></span>
            <span style={{ color: 'var(--text-muted)' }}>Inactive: <strong>{inactiveResponders}</strong></span>
            <span>Avg Active Workload: <strong>{avgActiveReportsPerResponder.toFixed(1)} / responder</strong></span>
          </div>
        </div>

        {responderStats.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No responder statistics registered in the system.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-subtle)', textAlign: 'left' }}>
                  <th style={{ padding: '0.6rem 0.5rem', color: 'var(--text-muted)' }}>Responder Name</th>
                  <th style={{ padding: '0.6rem 0.5rem', color: 'var(--text-muted)' }}>Email</th>
                  <th style={{ padding: '0.6rem 0.5rem', color: 'var(--text-muted)' }}>Status</th>
                  <th style={{ padding: '0.6rem 0.5rem', color: 'var(--text-muted)' }}>Active Assignments</th>
                  <th style={{ padding: '0.6rem 0.5rem', color: 'var(--text-muted)' }}>Resolved Incidents</th>
                </tr>
              </thead>
              <tbody>
                {responderStats.map((resp) => (
                  <tr key={resp.responderId} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.65rem 0.5rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {resp.fullName}
                    </td>
                    <td style={{ padding: '0.65rem 0.5rem', color: 'var(--text-muted)' }}>{resp.email}</td>
                    <td style={{ padding: '0.65rem 0.5rem' }}>
                      {resp.enabled ? (
                        <span className="badge badge-mint" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                          <UserCheck size={12} /> Active
                        </span>
                      ) : (
                        <span className="badge badge-yellow" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                          <UserX size={12} /> Inactive
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '0.65rem 0.5rem', fontWeight: 700, color: resp.activeAssignedCount > 0 ? '#D97706' : 'var(--text-main)' }}>
                      {resp.activeAssignedCount}
                    </td>
                    <td style={{ padding: '0.65rem 0.5rem', fontWeight: 700, color: '#16A34A' }}>
                      {resp.resolvedCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* TWO COLUMN GRID: SECTION F (DUPLICATES) & SECTION G (ESCALATIONS) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {/* SECTION F: DUPLICATE & MASTER INCIDENT ANALYTICS */}
        <Card hoverEffect={false}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Copy size={20} style={{ color: '#D97706' }} /> Deduplication & Master Incidents
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
              <div style={{ padding: '0.75rem', backgroundColor: '#FEF3C7', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.725rem', fontWeight: 700, color: '#92400E', textTransform: 'uppercase' }}>
                  Linked Duplicate Reports
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#78350F', margin: '0.2rem 0' }}>
                  {linkedReports}
                </div>
              </div>

              <div style={{ padding: '0.75rem', backgroundColor: '#F3F4F6', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.725rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase' }}>
                  Standalone Incidents
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1F2937', margin: '0.2rem 0' }}>
                  {standaloneReports}
                </div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                <strong style={{ color: 'var(--text-main)' }}>Deduplication Ratio</strong>
                <strong style={{ color: '#D97706' }}>{deduplicationRatio.toFixed(1)}%</strong>
              </div>
              <div style={{ width: '100%', height: '10px', backgroundColor: 'var(--border-subtle)', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{ width: `${deduplicationRatio}%`, height: '100%', backgroundColor: '#F59E0B', borderRadius: '5px' }} />
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                Percentage of incoming citizen reports successfully grouped into Master Emergency Incidents.
              </p>
            </div>
          </div>
        </Card>

        {/* SECTION G: ESCALATION ANALYTICS */}
        <Card hoverEffect={false}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={20} style={{ color: '#DC2626' }} /> Escalation Analysis
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
              <div style={{ padding: '0.75rem', backgroundColor: '#FEE2E2', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.725rem', fontWeight: 700, color: '#991B1B', textTransform: 'uppercase' }}>
                  Escalated Incidents
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#7F1D1D', margin: '0.2rem 0' }}>
                  {totalEscalatedIncidents}
                </div>
              </div>

              <div style={{ padding: '0.75rem', backgroundColor: '#FFEDD5', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.725rem', fontWeight: 700, color: '#9A3412', textTransform: 'uppercase' }}>
                  Escalation Rate
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#7C2D12', margin: '0.2rem 0' }}>
                  {escalationRate.toFixed(1)}%
                </div>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                Escalation Breakdown by Category
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {Object.entries(escalationsByCategory)
                  .filter(([_, cnt]) => cnt > 0)
                  .map(([cat, cnt]) => (
                    <span key={cat} className="badge badge-pink" style={{ fontSize: '0.75rem' }}>
                      {formatCategoryName(cat)}: {cnt}
                    </span>
                  ))}
                {Object.values(escalationsByCategory).every((c) => c === 0) && (
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>No escalations by category</span>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
