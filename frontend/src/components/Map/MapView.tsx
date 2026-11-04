import { useEffect, useRef, useState } from 'react';
import mapboxgl, { Map, Marker, Popup } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { LocationPoint, UserProfile } from '../../types';
import { getRiskColor } from '../../types';
import { tint } from '@/lib/utils';

interface MapViewProps {
  users: UserProfile[];
  selectedUserId: string | null;
  riskScores?: Record<string, { overall_risk: number }>;
  showHeatmap?: boolean;
  timeFilter?: { start: number; end: number };
  anonymizedLocations?: LocationPoint[];
  showOriginal?: boolean;
  showAnonymized?: boolean;
  dark?: boolean;
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || 'your-mapbox-token-here';
const CALGARY_CENTER: [number, number] = [-114.0719, 51.0447];

// Map paint needs real colour values (not CSS variables).
const PALETTE = {
  light: {
    style: 'mapbox://styles/mapbox/light-v11',
    route: '#1f6fea',
    casing: '#ffffff',
    home: '#15803d',
    work: '#0f2b5b',
    leisure: '#f59e0b',
    transit: '#8e8e93',
    other: '#c8102e',
    protected: '#c8102e',
    stroke: '#ffffff',
  },
  dark: {
    style: 'mapbox://styles/mapbox/dark-v11',
    route: '#5aa9ff',
    casing: '#0b1220',
    home: '#4ade80',
    work: '#e5e5ea',
    leisure: '#fbbf24',
    transit: '#8e8e93',
    other: '#ff6b81',
    protected: '#ff4d67',
    stroke: '#1c1c1e',
  },
} as const;

const HOUSE_SVG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>';
const WORK_SVG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/></svg>';

function pinElement(svg: string, color: string) {
  const el = document.createElement('div');
  el.className = 'map-pin';
  el.style.setProperty('--pin', color);
  el.innerHTML = svg;
  return el;
}

export function MapView({
  users,
  selectedUserId,
  riskScores,
  showHeatmap = false,
  timeFilter,
  anonymizedLocations,
  showOriginal = true,
  showAnonymized = false,
  dark = false,
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<Map | null>(null);
  const markers = useRef<Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const colors = dark ? PALETTE.dark : PALETTE.light;

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: colors.style,
      center: CALGARY_CENTER,
      zoom: 11,
      pitch: 0,
    });

    map.current.on('load', () => {
      setMapLoaded(true);

      const empty = { type: 'FeatureCollection' as const, features: [] };
      map.current!.addSource('trajectory', { type: 'geojson', data: empty });
      map.current!.addSource('points', { type: 'geojson', data: empty });
      map.current!.addSource('anonymized-points', { type: 'geojson', data: empty });
      map.current!.addSource('heatmap', { type: 'geojson', data: empty });

      // The route: a wide casing under a blue line so it reads on any map.
      map.current!.addLayer({
        id: 'trajectory-casing',
        type: 'line',
        source: 'trajectory',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': colors.casing, 'line-width': 7, 'line-opacity': 0.95 },
      });
      map.current!.addLayer({
        id: 'trajectory-line',
        type: 'line',
        source: 'trajectory',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': colors.route, 'line-width': 4 },
      });

      map.current!.addLayer({
        id: 'points-layer',
        type: 'circle',
        source: 'points',
        paint: {
          'circle-radius': 6,
          'circle-color': [
            'match', ['get', 'type'],
            'home', colors.home,
            'work', colors.work,
            'leisure', colors.leisure,
            'transit', colors.transit,
            colors.other,
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': colors.stroke,
        },
      });

      map.current!.addLayer({
        id: 'anonymized-points-layer',
        type: 'circle',
        source: 'anonymized-points',
        paint: {
          'circle-radius': 8,
          'circle-color': colors.protected,
          'circle-stroke-width': 2,
          'circle-stroke-color': colors.stroke,
          'circle-opacity': 0.8,
        },
      });

      // Single-hue density ramp in the brand colour.
      map.current!.addLayer({
        id: 'heatmap-layer',
        type: 'heatmap',
        source: 'heatmap',
        paint: {
          'heatmap-weight': 1,
          'heatmap-intensity': 1,
          'heatmap-color': [
            'interpolate', ['linear'], ['heatmap-density'],
            0, 'rgba(200, 16, 46, 0)',
            0.25, 'rgba(200, 16, 46, 0.25)',
            0.5, 'rgba(200, 16, 46, 0.5)',
            0.75, 'rgba(200, 16, 46, 0.75)',
            1, 'rgba(200, 16, 46, 0.95)',
          ],
          'heatmap-radius': 30,
          'heatmap-opacity': 0.7,
        },
        layout: { visibility: 'none' },
      });
    });

    map.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');

    // The map can mount while its tab is hidden; resize once it has a real size.
    const observer = new ResizeObserver(() => map.current?.resize());
    observer.observe(mapContainer.current);

    return () => {
      observer.disconnect();
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    map.current.setLayoutProperty(
      'heatmap-layer',
      'visibility',
      showHeatmap ? 'visible' : 'none'
    );
  }, [showHeatmap, mapLoaded]);

  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const selectedUser = users.find(u => u.user_id === selectedUserId);

    if (!selectedUser) {
      const empty = { type: 'FeatureCollection' as const, features: [] };
      (map.current.getSource('trajectory') as mapboxgl.GeoJSONSource)?.setData(empty);
      (map.current.getSource('points') as mapboxgl.GeoJSONSource)?.setData(empty);
      (map.current.getSource('heatmap') as mapboxgl.GeoJSONSource)?.setData(empty);
      return;
    }

    let locations = selectedUser.locations;
    if (timeFilter) {
      const startTime = timeFilter.start;
      const endTime = timeFilter.end;
      locations = locations.filter(loc => {
        const locTime = new Date(loc.timestamp).getTime();
        return locTime >= startTime && locTime <= endTime;
      });
    }

    const sortedLocations = [...locations].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const trajectoryCoords = sortedLocations.map(loc => [loc.lon, loc.lat]);
    (map.current.getSource('trajectory') as mapboxgl.GeoJSONSource)?.setData({
      type: 'FeatureCollection',
      features: trajectoryCoords.length > 1 ? [{
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: trajectoryCoords,
        },
      }] : [],
    });

    const pointFeatures = sortedLocations.map(loc => ({
      type: 'Feature' as const,
      properties: {
        type: loc.location_type || 'other',
        timestamp: loc.timestamp,
      },
      geometry: {
        type: 'Point' as const,
        coordinates: [loc.lon, loc.lat],
      },
    }));

    if (showOriginal) {
      (map.current.getSource('points') as mapboxgl.GeoJSONSource)?.setData({
        type: 'FeatureCollection',
        features: pointFeatures,
      });
    }

    const heatmapFeatures = users.flatMap(user =>
      user.locations.map(loc => ({
        type: 'Feature' as const,
        properties: {},
        geometry: {
          type: 'Point' as const,
          coordinates: [loc.lon, loc.lat],
        },
      }))
    );
    (map.current.getSource('heatmap') as mapboxgl.GeoJSONSource)?.setData({
      type: 'FeatureCollection',
      features: heatmapFeatures,
    });

    if (sortedLocations.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      sortedLocations.forEach(loc => bounds.extend([loc.lon, loc.lat]));
      map.current.fitBounds(bounds, { padding: 60 });
    }
  }, [users, selectedUserId, timeFilter, showOriginal, mapLoaded]);

  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    const features = showAnonymized && anonymizedLocations
      ? anonymizedLocations.map(loc => ({
          type: 'Feature' as const,
          properties: { type: 'anonymized' },
          geometry: {
            type: 'Point' as const,
            coordinates: [loc.lon, loc.lat],
          },
        }))
      : [];
    (map.current.getSource('anonymized-points') as mapboxgl.GeoJSONSource)?.setData({
      type: 'FeatureCollection',
      features,
    });
  }, [anonymizedLocations, showAnonymized, mapLoaded]);

  useEffect(() => {
    markers.current.forEach(m => m.remove());
    markers.current = [];

    if (!map.current || !mapLoaded) return;

    const selectedUser = users.find(u => u.user_id === selectedUserId);
    if (!selectedUser) return;

    if (selectedUser.home_location) {
      const marker = new mapboxgl.Marker(pinElement(HOUSE_SVG, colors.home))
        .setLngLat([selectedUser.home_location.lon, selectedUser.home_location.lat])
        .setPopup(new Popup({ offset: 24 }).setHTML('<strong>Home</strong><p>Inferred from nighttime patterns</p>'))
        .addTo(map.current);
      markers.current.push(marker);
    }

    if (selectedUser.work_location) {
      const marker = new mapboxgl.Marker(pinElement(WORK_SVG, colors.work))
        .setLngLat([selectedUser.work_location.lon, selectedUser.work_location.lat])
        .setPopup(new Popup({ offset: 24 }).setHTML('<strong>Work</strong><p>Inferred from weekday patterns</p>'))
        .addTo(map.current);
      markers.current.push(marker);
    }
  }, [users, selectedUserId, mapLoaded, colors]);

  const legend = [
    { label: 'Home', color: colors.home },
    { label: 'Work', color: colors.work },
    { label: 'Leisure', color: colors.leisure },
    { label: 'Transit', color: colors.transit },
    { label: 'Route', color: colors.route },
  ];

  const selectedRisk = selectedUserId && riskScores ? riskScores[selectedUserId] : undefined;

  return (
    <div className="relative h-full w-full min-h-[320px]">
      <div ref={mapContainer} className="absolute inset-0" />

      <div className="material absolute bottom-3 left-3 max-w-[calc(100%-1.5rem)] rounded-[20px] px-4 py-3 sm:bottom-4 sm:left-4">
        <div className="eyebrow mb-2 hidden sm:block">Location types</div>
        <ul className="flex flex-wrap gap-x-4 gap-y-1.5 sm:max-w-[140px] sm:flex-col sm:gap-y-2">
          {legend.map(item => (
            <li key={item.label} className="flex items-center gap-2 text-[13px] font-semibold text-ink">
              <span className="size-3 rounded-full" style={{ background: item.color }} />
              {item.label}
            </li>
          ))}
          {showAnonymized && (
            <li className="flex items-center gap-2 text-[13px] font-semibold text-ink sm:mt-1 sm:border-t sm:border-line sm:pt-2">
              <span className="size-3 rounded-full" style={{ background: colors.protected }} />
              Protected
            </li>
          )}
        </ul>
      </div>

      {selectedRisk && (
        <div className="material animate-fade-in absolute left-3 top-3 rounded-[20px] px-4 py-3 sm:left-4 sm:top-4 sm:px-5 sm:py-4">
          <div className="eyebrow mb-0.5">Re-identification risk</div>
          <div
            className="num text-[34px] leading-none sm:text-[40px]"
            style={{ color: getRiskColor(selectedRisk.overall_risk) }}
          >
            {selectedRisk.overall_risk.toFixed(0)}%
          </div>
          <div
            className="mt-2 h-1.5 w-full overflow-hidden rounded-full"
            style={{ background: tint(getRiskColor(selectedRisk.overall_risk), 18) }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min(100, selectedRisk.overall_risk)}%`,
                background: getRiskColor(selectedRisk.overall_risk),
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
