import React, { useMemo } from 'react';
import { Circle, Popup } from 'react-leaflet';
import { calculateHaversineDistance } from '../services/nearbyServices';

/**
 * Cluster emergency reports into Danger Zones based on incident density.
 */
const clusterDangerZones = (reports, radiusKm = 1.5, minIncidents = 2) => {
  if (!reports || reports.length < minIncidents) return [];

  const validReports = reports.filter((r) => {
    const lat = Number(r.lat ?? r.latitude);
    const lng = Number(r.lng ?? r.longitude);
    return !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  });

  const visited = new Set();
  const clusters = [];

  validReports.forEach((report, i) => {
    if (visited.has(i)) return;

    const rLat = Number(report.lat ?? report.latitude);
    const rLng = Number(report.lng ?? report.longitude);

    const cluster = [report];
    visited.add(i);

    validReports.forEach((otherReport, j) => {
      if (i === j || visited.has(j)) return;

      const oLat = Number(otherReport.lat ?? otherReport.latitude);
      const oLng = Number(otherReport.lng ?? otherReport.longitude);

      const dist = calculateHaversineDistance(rLat, rLng, oLat, oLng);
      if (dist <= radiusKm) {
        cluster.push(otherReport);
        visited.add(j);
      }
    });

    // Only clusters with minimum incident threshold form a Danger Zone
    if (cluster.length >= minIncidents) {
      // Calculate cluster centroid
      const avgLat = cluster.reduce((sum, r) => sum + Number(r.lat ?? r.latitude), 0) / cluster.length;
      const avgLng = cluster.reduce((sum, r) => sum + Number(r.lng ?? r.longitude), 0) / cluster.length;

      // Find max distance from centroid to determine zone radius
      let maxDistKm = 0.5; // Min radius 500 meters
      cluster.forEach((r) => {
        const d = calculateHaversineDistance(avgLat, avgLng, Number(r.lat ?? r.latitude), Number(r.lng ?? r.longitude));
        if (d > maxDistKm) maxDistKm = d;
      });

      const radiusMeters = Math.min(Math.max(maxDistKm * 1000 + 200, 600), 1600); // 600m to 1600m
      const hasCritical = cluster.some((r) => (r.priority || '').toUpperCase() === 'CRITICAL');

      clusters.push({
        id: `danger-zone-${i}-${cluster.length}`,
        center: [avgLat, avgLng],
        radius: radiusMeters,
        count: cluster.length,
        hasCritical,
        categories: [...new Set(cluster.map((r) => r.categoryDisplayName || r.category || 'Incident'))],
      });
    }
  });

  return clusters;
};

const DangerZoneLayer = ({ reports = [] }) => {
  const dangerZones = useMemo(() => {
    return clusterDangerZones(reports, 1.5, 2);
  }, [reports]);

  if (!dangerZones || dangerZones.length === 0) return null;

  return (
    <>
      {dangerZones.map((zone) => {
        const fillColor = zone.hasCritical ? '#DC2626' : '#EA580C';
        const borderColor = zone.hasCritical ? '#B91C1C' : '#C2410C';

        return (
          <Circle
            key={zone.id}
            center={zone.center}
            radius={zone.radius}
            pathOptions={{
              fillColor: fillColor,
              fillOpacity: 0.22,
              color: borderColor,
              weight: 2,
              dashArray: '6, 6',
            }}
          >
            <Popup>
              <div style={{ padding: '0.35rem 0.2rem', minWidth: '220px', fontFamily: 'inherit' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.35rem' }}>
                  <strong style={{ fontSize: '0.95rem', color: '#991B1B', fontWeight: 800 }}>
                    ⚠️ {zone.hasCritical ? 'High Density Danger Zone' : 'Moderate Incident Concentration'}
                  </strong>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.825rem', color: '#334155' }}>
                  <div>
                    <strong style={{ color: '#0F172A' }}>Incident Density:</strong>{' '}
                    <span className="badge badge-pink" style={{ fontWeight: 700 }}>
                      {zone.count} reported emergency incidents
                    </span>
                  </div>

                  <div>
                    <strong style={{ color: '#0F172A' }}>Categories:</strong>{' '}
                    <span>{zone.categories.join(', ')}</span>
                  </div>

                  <div style={{ marginTop: '0.3rem', padding: '0.4rem', backgroundColor: '#FEF2F2', borderRadius: '6px', border: '1px solid #FCA5A5' }}>
                    <span style={{ fontSize: '0.725rem', color: '#991B1B', fontWeight: 600, display: 'block' }}>
                      <strong>Basis:</strong> Based on reported emergency incidents.
                    </span>
                    <span style={{ fontSize: '0.7rem', color: '#7F1D1D', marginTop: '0.15rem', display: 'block', lineHeight: 1.3 }}>
                      Disclaimer: Heatmap and danger zones are based on reported emergency incidents and do not guarantee that an area is unsafe.
                    </span>
                  </div>
                </div>
              </div>
            </Popup>
          </Circle>
        );
      })}
    </>
  );
};

export default DangerZoneLayer;
