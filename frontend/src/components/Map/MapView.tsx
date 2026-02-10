
import { useEffect, useRef, useState } from 'react';
import mapboxgl, { Map, Marker, Popup } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { LocationPoint, UserProfile } from '../../types';
import { getRiskColor } from '../../types';

interface MapViewProps {
  users: UserProfile[];
  selectedUserId: string | null;
  riskScores?: Record<string, { overall_risk: number }>;
  showHeatmap?: boolean;
  timeFilter?: { start: number; end: number };
  anonymizedLocations?: LocationPoint[];
  showOriginal?: boolean;
  showAnonymized?: boolean;
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || 'your-mapbox-token-here';
const CALGARY_CENTER: [number, number] = [-114.0719, 51.0447];

export function MapView({
  users,
  selectedUserId,
  riskScores,
  showHeatmap = false,
  timeFilter,
  anonymizedLocations,
  showOriginal = true,
  showAnonymized = false,
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<Map | null>(null);
  const markers = useRef<Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);


  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: CALGARY_CENTER,
      zoom: 11,
      pitch: 0,
    });

    map.current.on('load', () => {
      setMapLoaded(true);
      

      map.current!.addSource('trajectory', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
      
      map.current!.addSource('points', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
      
      map.current!.addSource('anonymized-points', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
      
      map.current!.addSource('heatmap', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });


      map.current!.addLayer({
        id: 'trajectory-line',
        type: 'line',
        source: 'trajectory',
        paint: {
          'line-color': '#6366f1',
          'line-width': 3,
          'line-opacity': 0.7,
        },
      });


      map.current!.addLayer({
        id: 'points-layer',
        type: 'circle',
        source: 'points',
        paint: {
          'circle-radius': 6,
          'circle-color': [
            'match', ['get', 'type'],
            'home', '#22c55e',
            'work', '#3b82f6',
            'leisure', '#f59e0b',
            'transit', '#94a3b8',
            '#6366f1'
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.9,
        },
      });


      map.current!.addLayer({
        id: 'anonymized-points-layer',
        type: 'circle',
        source: 'anonymized-points',
        paint: {
          'circle-radius': 8,
          'circle-color': '#f43f5e',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.7,
        },
      });


      map.current!.addLayer({
        id: 'heatmap-layer',
        type: 'heatmap',
        source: 'heatmap',
        paint: {
          'heatmap-weight': 1,
          'heatmap-intensity': 1,
          'heatmap-color': [
            'interpolate', ['linear'], ['heatmap-density'],
            0, 'rgba(0, 0, 255, 0)',
            0.2, 'rgb(0, 255, 255)',
            0.4, 'rgb(0, 255, 0)',
            0.6, 'rgb(255, 255, 0)',
            0.8, 'rgb(255, 128, 0)',
            1, 'rgb(255, 0, 0)',
          ],
          'heatmap-radius': 30,
          'heatmap-opacity': 0.6,
        },
        layout: {
          visibility: 'none',
        },
      });
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
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

      (map.current.getSource('trajectory') as mapboxgl.GeoJSONSource)?.setData({
        type: 'FeatureCollection',
        features: [],
      });
      (map.current.getSource('points') as mapboxgl.GeoJSONSource)?.setData({
        type: 'FeatureCollection',
        features: [],
      });
      (map.current.getSource('heatmap') as mapboxgl.GeoJSONSource)?.setData({
        type: 'FeatureCollection',
        features: [],
      });
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

    if (showAnonymized && anonymizedLocations && anonymizedLocations.length > 0) {
      const anonFeatures = anonymizedLocations.map(loc => ({
        type: 'Feature' as const,
        properties: { type: 'anonymized' },
        geometry: {
          type: 'Point' as const,
          coordinates: [loc.lon, loc.lat],
        },
      }));
      (map.current.getSource('anonymized-points') as mapboxgl.GeoJSONSource)?.setData({
        type: 'FeatureCollection',
        features: anonFeatures,
      });
    } else {
      (map.current.getSource('anonymized-points') as mapboxgl.GeoJSONSource)?.setData({
        type: 'FeatureCollection',
        features: [],
      });
    }
  }, [anonymizedLocations, showAnonymized, mapLoaded]);


  useEffect(() => {

    markers.current.forEach(m => m.remove());
    markers.current = [];

    if (!map.current || !mapLoaded) return;

    const selectedUser = users.find(u => u.user_id === selectedUserId);
    if (!selectedUser) return;


    if (selectedUser.home_location) {
      const el = document.createElement('div');
      el.className = 'home-marker';
      el.innerHTML = '🏠';
      el.style.fontSize = '24px';
      el.style.cursor = 'pointer';
      
      const marker = new mapboxgl.Marker(el)
        .setLngLat([selectedUser.home_location.lon, selectedUser.home_location.lat])
        .setPopup(new Popup().setHTML('<strong>Home Location</strong><p>Inferred from nighttime patterns</p>'))
        .addTo(map.current);
      markers.current.push(marker);
    }


    if (selectedUser.work_location) {
      const el = document.createElement('div');
      el.className = 'work-marker';
      el.innerHTML = '🏢';
      el.style.fontSize = '24px';
      el.style.cursor = 'pointer';
      
      const marker = new mapboxgl.Marker(el)
        .setLngLat([selectedUser.work_location.lon, selectedUser.work_location.lat])
        .setPopup(new Popup().setHTML('<strong>Work Location</strong><p>Inferred from weekday patterns</p>'))
        .addTo(map.current);
      markers.current.push(marker);
    }
  }, [users, selectedUserId, mapLoaded]);

  return (
    <div className="relative w-full h-full" style={{ minHeight: '400px' }}>
      <div ref={mapContainer} className="absolute inset-0 w-full h-full" />
      

      <div className="absolute bottom-5 left-5 rounded-2xl bg-[hsl(225,20%,8%)]/95 backdrop-blur-xl border border-[hsl(225,15%,18%)] p-4 min-w-[140px] shadow-xl">
        <div className="text-[9px] font-semibold text-[hsl(215,15%,45%)] uppercase tracking-widest mb-3">
          Location Types
        </div>
        <div className="space-y-2.5">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-[hsl(152,82%,45%)]" style={{ boxShadow: '0 0 8px hsl(152,82%,45%,0.5)' }} />
            <span className="text-xs text-[hsl(215,15%,55%)]">Home</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-[hsl(217,91%,60%)]" style={{ boxShadow: '0 0 8px hsl(217,91%,60%,0.5)' }} />
            <span className="text-xs text-[hsl(215,15%,55%)]">Work</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-[hsl(38,95%,55%)]" style={{ boxShadow: '0 0 8px hsl(38,95%,55%,0.5)' }} />
            <span className="text-xs text-[hsl(215,15%,55%)]">Leisure</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-[hsl(215,15%,40%)]" />
            <span className="text-xs text-[hsl(215,15%,55%)]">Transit</span>
          </div>
          {showAnonymized && (
            <div className="flex items-center gap-2.5 pt-2.5 mt-2.5 border-t border-[hsl(225,15%,15%)]">
              <span className="w-3 h-3 rounded-full bg-[hsl(252,100%,69%)]" style={{ boxShadow: '0 0 10px hsl(252,100%,69%,0.6)' }} />
              <span className="text-xs text-[hsl(215,15%,55%)]">Protected</span>
            </div>
          )}
        </div>
      </div>


      {selectedUserId && riskScores && riskScores[selectedUserId] && (
        <div 
          className="absolute top-5 left-5 rounded-2xl bg-[hsl(225,20%,8%)]/95 backdrop-blur-xl border border-[hsl(225,15%,18%)] p-5 shadow-xl animate-fade-in"
          style={{ 
            boxShadow: `0 0 40px ${getRiskColor(riskScores[selectedUserId].overall_risk)}30`
          }}
        >
          <div className="text-[9px] text-[hsl(215,15%,45%)] uppercase tracking-widest mb-1">
            Re-identification Risk
          </div>
          <div 
            className="text-4xl font-bold number-display"
            style={{ 
              color: getRiskColor(riskScores[selectedUserId].overall_risk),
              textShadow: `0 0 30px ${getRiskColor(riskScores[selectedUserId].overall_risk)}60`
            }}
          >
            {riskScores[selectedUserId].overall_risk.toFixed(0)}%
          </div>
        </div>
      )}
    </div>
  );
}
