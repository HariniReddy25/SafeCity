import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

/**
 * Custom Canvas Heatmap Overlay for Leaflet
 */
const HeatmapLayer = ({ points = [] }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // Create custom canvas overlay element attached to overlayPane
    const canvas = L.DomUtil.create('canvas', 'leaflet-heatmap-layer');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '400';

    const pane = map.getPane('overlayPane') || map.getPanes().overlayPane;
    pane.appendChild(canvas);

    const ctx = canvas.getContext('2d');

    // Priority weight map
    const getPriorityWeight = (priority) => {
      const p = (priority || 'LOW').toUpperCase();
      switch (p) {
        case 'CRITICAL':
          return 1.0;
        case 'HIGH':
          return 0.8;
        case 'MEDIUM':
          return 0.5;
        case 'LOW':
        default:
          return 0.3;
      }
    };

    const renderHeatmap = () => {
      if (!ctx || !map) return;

      const size = map.getSize();
      canvas.width = size.x;
      canvas.height = size.y;

      const bounds = map.getBounds();
      const topLeft = map.latLngToLayerPoint(bounds.getNorthWest());
      L.DomUtil.setPosition(canvas, topLeft);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!points || points.length === 0) return;

      // Draw radial heat intensity spots on offscreen alpha buffer
      points.forEach((pt) => {
        const lat = Number(pt.lat ?? pt.latitude);
        const lng = Number(pt.lng ?? pt.longitude);
        if (isNaN(lat) || isNaN(lng)) return;

        const latLng = L.latLng(lat, lng);
        if (!bounds.contains(latLng)) return;

        const layerPoint = map.latLngToLayerPoint(latLng);
        const containerPoint = {
          x: layerPoint.x - topLeft.x,
          y: layerPoint.y - topLeft.y,
        };

        const weight = getPriorityWeight(pt.priority);
        const radius = 35 + weight * 15; // 35px to 50px radius

        const gradient = ctx.createRadialGradient(
          containerPoint.x,
          containerPoint.y,
          0,
          containerPoint.x,
          containerPoint.y,
          radius
        );

        gradient.addColorStop(0, `rgba(220, 38, 38, ${0.6 * weight})`); // Deep Crimson
        gradient.addColorStop(0.3, `rgba(234, 88, 12, ${0.45 * weight})`); // Orange
        gradient.addColorStop(0.6, `rgba(217, 119, 6, ${0.3 * weight})`); // Amber
        gradient.addColorStop(0.85, `rgba(37, 99, 235, ${0.15 * weight})`); // Blue
        gradient.addColorStop(1, 'rgba(37, 99, 235, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(containerPoint.x, containerPoint.y, radius, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    renderHeatmap();

    const onMapMove = () => renderHeatmap();
    map.on('moveend zoomend resize', onMapMove);

    return () => {
      map.off('moveend zoomend resize', onMapMove);
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    };
  }, [map, points]);

  return null;
};

export default HeatmapLayer;
