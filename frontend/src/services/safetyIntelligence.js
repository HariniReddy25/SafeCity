/**
 * SafeCity Safety Intelligence & Area Safety Score Calculator
 * Performs explainable, real-data mathematical calculations on emergency reports.
 */

/**
 * Calculates Area Safety Score (0 - 100) based on emergency reports in view.
 */
export const calculateAreaSafetyScore = (reports = []) => {
  if (!reports || reports.length === 0) {
    return {
      score: 100,
      levelLabel: 'High Safety Index',
      description: 'No active reported incidents in this area.',
      color: '#16A34A',
      bgColor: '#DCFCE7',
      borderColor: '#86EFAC',
      deductions: 0,
      totalReports: 0,
    };
  }

  let totalDeductions = 0;

  reports.forEach((report) => {
    const priority = (report.priority || 'LOW').toUpperCase();
    const status = (report.status || 'SUBMITTED').toUpperCase();

    let penalty = 2; // Default LOW priority
    if (priority === 'CRITICAL') penalty = 15;
    else if (priority === 'HIGH') penalty = 10;
    else if (priority === 'MEDIUM') penalty = 5;

    // Resolved or closed incidents carry 50% lower weight as they have been addressed
    if (status === 'RESOLVED' || status === 'CLOSED') {
      penalty *= 0.5;
    }

    totalDeductions += penalty;
  });

  const rawScore = Math.max(0, Math.min(100, Math.round(100 - totalDeductions)));

  let levelLabel = 'High Safety Index';
  let description = 'Low incident density reported in this sector.';
  let color = '#16A34A';
  let bgColor = '#DCFCE7';
  let borderColor = '#86EFAC';

  if (rawScore < 45) {
    levelLabel = 'Elevated Safety Caution Area';
    description = 'High concentration of urgent emergency reports.';
    color = '#DC2626';
    bgColor = '#FEF2F2';
    borderColor = '#FCA5A5';
  } else if (rawScore < 60) {
    levelLabel = 'Heightened Incident Density';
    description = 'Multiple active emergency reports detected in this area.';
    color = '#EA580C';
    bgColor = '#FFEDD5';
    borderColor = '#FDBA74';
  } else if (rawScore < 75) {
    levelLabel = 'Moderate Incident Activity';
    description = 'Moderate number of public safety reports.';
    color = '#D97706';
    bgColor = '#FEF3C7';
    borderColor = '#FDE68A';
  } else if (rawScore < 90) {
    levelLabel = 'Favorable Safety Level';
    description = 'Low incident rate with manageable reported hazards.';
    color = '#0284C7';
    bgColor = '#E0F2FE';
    borderColor = '#7DD3FC';
  }

  return {
    score: rawScore,
    levelLabel,
    description,
    color,
    bgColor,
    borderColor,
    deductions: Math.round(totalDeductions),
    totalReports: reports.length,
  };
};

/**
 * Generates comprehensive safety summary metrics.
 */
export const getSafetySummary = (reports = [], dangerZoneCount = 0) => {
  const now = new Date();
  const past24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const past7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const past30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  let highCriticalCount = 0;
  let recent24hCount = 0;
  let recent7dCount = 0;
  let recent30dCount = 0;

  const categoryCounts = {};

  reports.forEach((report) => {
    const priority = (report.priority || 'LOW').toUpperCase();
    if (priority === 'HIGH' || priority === 'CRITICAL') {
      highCriticalCount++;
    }

    const catName = report.categoryDisplayName || report.category || 'Other';
    categoryCounts[catName] = (categoryCounts[catName] || 0) + 1;

    if (report.createdAt) {
      const createdDate = new Date(report.createdAt);
      if (createdDate >= past24h) recent24hCount++;
      if (createdDate >= past7d) recent7dCount++;
      if (createdDate >= past30d) recent30dCount++;
    }
  });

  let topCategory = 'None';
  let maxCatCount = 0;
  Object.entries(categoryCounts).forEach(([cat, count]) => {
    if (count > maxCatCount) {
      maxCatCount = count;
      topCategory = cat;
    }
  });

  let dangerZoneStatus = 'No Active Danger Zones';
  if (dangerZoneCount === 1) {
    dangerZoneStatus = '1 Active Danger Zone Cluster';
  } else if (dangerZoneCount > 1) {
    dangerZoneStatus = `${dangerZoneCount} Active Danger Zone Clusters`;
  }

  return {
    totalReports: reports.length,
    highCriticalCount,
    topCategory,
    recent24hCount,
    recent7dCount,
    recent30dCount,
    dangerZoneStatus,
  };
};

/**
 * Calculates category breakdown statistics.
 */
export const calculateCategoryBreakdown = (reports = []) => {
  if (!reports || reports.length === 0) return [];

  const counts = {};
  reports.forEach((r) => {
    const name = r.categoryDisplayName || r.category || 'Other';
    counts[name] = (counts[name] || 0) + 1;
  });

  const total = reports.length;

  return Object.entries(counts)
    .map(([category, count]) => ({
      category,
      count,
      percentage: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);
};

/**
 * Calculates priority distribution.
 */
export const calculatePriorityBreakdown = (reports = []) => {
  const breakdown = {
    CRITICAL: 0,
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0,
  };

  reports.forEach((r) => {
    const p = (r.priority || 'LOW').toUpperCase();
    if (breakdown[p] !== undefined) {
      breakdown[p]++;
    } else {
      breakdown.LOW++;
    }
  });

  return breakdown;
};

/**
 * Filters reports by timeframe selection.
 */
export const filterReportsByTimeframe = (reports = [], timeframe = 'all') => {
  if (timeframe === 'all') return reports;

  const now = new Date();
  let thresholdDate = new Date(0);

  if (timeframe === 'today') {
    thresholdDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  } else if (timeframe === '7days') {
    thresholdDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (timeframe === '30days') {
    thresholdDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  return reports.filter((r) => {
    if (!r.createdAt) return true;
    return new Date(r.createdAt) >= thresholdDate;
  });
};
