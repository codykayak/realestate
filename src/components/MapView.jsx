import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const EUGENE = [-123.0868, 44.0521];

const STATUS_COLORS = {
  'New':          '#58a6ff',
  'Contacted':    '#f5a623',
  'Negotiating':  '#e8742a',
  'Under Contract': '#27ae60',
  'Dead':         '#6e7681',
  'Closed':       '#1abc9c',
};

function pinColor(status) {
  return STATUS_COLORS[status] ?? '#58a6ff';
}

export default function MapView({ leads, selectedId, onSelectLead }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});  // id → maplibregl.Marker

  // Init map once
  useEffect(() => {
    if (mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: 'https://tiles.openfreemap.org/styles/dark',
      center: EUGENE,
      zoom: 11,
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Sync markers when leads change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    function syncMarkers() {
      const existingIds = new Set(Object.keys(markersRef.current).map(Number));
      const newIds = new Set(
        leads.filter((l) => l.geocoded).map((l) => l.id)
      );

      // Remove markers for leads no longer geocoded
      for (const id of existingIds) {
        if (!newIds.has(id)) {
          markersRef.current[id]?.remove();
          delete markersRef.current[id];
        }
      }

      // Add / update markers
      for (const lead of leads) {
        if (!lead.geocoded) continue;
        const { lat, lng } = lead.geocoded;

        if (markersRef.current[lead.id]) {
          // Update color if status changed
          const el = markersRef.current[lead.id].getElement();
          el.querySelector('circle').setAttribute('fill', pinColor(lead.status));
          continue;
        }

        // Create custom SVG pin element
        const el = document.createElement('div');
        el.innerHTML = buildPinSVG(pinColor(lead.status));
        el.style.cursor = 'pointer';
        el.style.width = '28px';
        el.style.height = '36px';
        el.title = lead.address || lead.name || `Lead ${lead.id + 1}`;

        el.addEventListener('click', (e) => {
          e.stopPropagation();
          onSelectLead(lead.id);
        });

        const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([lng, lat])
          .addTo(map);

        markersRef.current[lead.id] = marker;
      }
    }

    if (map.isStyleLoaded()) {
      syncMarkers();
    } else {
      map.once('load', syncMarkers);
    }
  }, [leads, onSelectLead]);

  // Highlight selected marker
  useEffect(() => {
    for (const [idStr, marker] of Object.entries(markersRef.current)) {
      const id = Number(idStr);
      const el = marker.getElement();
      const lead = leads.find((l) => l.id === id);
      if (!lead) continue;
      const isSelected = id === selectedId;
      el.querySelector('circle').setAttribute(
        'fill',
        isSelected ? '#ffffff' : pinColor(lead.status),
      );
      el.style.zIndex = isSelected ? '10' : '1';
    }
  }, [selectedId, leads]);

  // Fly to selected lead
  useEffect(() => {
    const map = mapRef.current;
    if (!map || selectedId == null) return;
    const lead = leads.find((l) => l.id === selectedId);
    if (!lead?.geocoded) return;
    map.flyTo({
      center: [lead.geocoded.lng, lead.geocoded.lat],
      zoom: Math.max(map.getZoom(), 14),
      duration: 600,
    });
  }, [selectedId, leads]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
  );
}

function buildPinSVG(color) {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
      <path d="M14 0C6.27 0 0 6.27 0 14c0 10.5 14 22 14 22S28 24.5 28 14C28 6.27 21.73 0 14 0z"
        fill="${color}" stroke="rgba(0,0,0,0.35)" stroke-width="1.5"/>
      <circle cx="14" cy="14" r="5" fill="${color}" stroke="white" stroke-width="2"/>
    </svg>
  `;
}
