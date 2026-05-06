import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const EUGENE = [-123.0868, 44.0521];

const STATUS_COLORS = {
  'New':            '#58a6ff',
  'Contacted':      '#f5a623',
  'Negotiating':    '#e8742a',
  'Under Contract': '#3fb950',
  'Dead':           '#6e7681',
  'Closed':         '#1abc9c',
};

function pinColor(status) {
  return STATUS_COLORS[status] ?? '#58a6ff';
}

// Larger pins on mobile for thumb tapping
function pinSize() {
  return window.innerWidth <= 640 ? { w: 36, h: 46 } : { w: 28, h: 36 };
}

function buildPinSVG(color, w, h) {
  const cx = w / 2;
  const r = w * 0.3;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <path d="M${cx} 0C${cx * 0.45} 0 0 ${cx * 0.45} 0 ${cx}c0 ${cx * 0.75} ${cx} ${h - cx} ${cx} ${h - cx}S${w} ${cx + cx * 0.75} ${w} ${cx}C${w} ${cx * 0.45} ${cx * 1.55} 0 ${cx} 0z"
      fill="${color}" stroke="rgba(0,0,0,0.4)" stroke-width="1.2"/>
    <circle cx="${cx}" cy="${cx}" r="${r}" fill="white" opacity="0.9"/>
  </svg>`;
}

export default function MapView({ leads, selectedId, onSelectLead }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});

  // Init map once
  useEffect(() => {
    if (mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: 'https://tiles.openfreemap.org/styles/dark',
      center: EUGENE,
      zoom: 11,
      // Better touch behavior on mobile
      touchZoomRotate: { around: 'center' },
      cooperativeGestures: false,
    });

    // Put nav controls bottom-right so they don't clash with bottom sheet
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');
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
      const newIds = new Set(leads.filter((l) => l.geocoded).map((l) => l.id));

      // Remove stale markers
      for (const id of existingIds) {
        if (!newIds.has(id)) {
          markersRef.current[id]?.remove();
          delete markersRef.current[id];
        }
      }

      for (const lead of leads) {
        if (!lead.geocoded) continue;
        const { lat, lng } = lead.geocoded;
        const { w, h } = pinSize();

        if (markersRef.current[lead.id]) {
          // Refresh color
          const el = markersRef.current[lead.id].getElement();
          el.innerHTML = buildPinSVG(pinColor(lead.status), w, h);
          continue;
        }

        const el = document.createElement('div');
        el.innerHTML = buildPinSVG(pinColor(lead.status), w, h);
        el.style.cursor = 'pointer';
        el.style.width = `${w}px`;
        el.style.height = `${h}px`;
        // Larger touch target
        el.style.padding = '6px';
        el.style.margin = '-6px';
        el.title = lead.name || lead.address || `Lead ${lead.id + 1}`;

        el.addEventListener('click', (e) => { e.stopPropagation(); onSelectLead(lead.id); });
        el.addEventListener('touchend', (e) => { e.stopPropagation(); onSelectLead(lead.id); }, { passive: true });

        markersRef.current[lead.id] = new maplibregl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([lng, lat])
          .addTo(map);
      }
    }

    if (map.isStyleLoaded()) syncMarkers();
    else map.once('load', syncMarkers);
  }, [leads, onSelectLead]);

  // Highlight selected
  useEffect(() => {
    const { w, h } = pinSize();
    for (const [idStr, marker] of Object.entries(markersRef.current)) {
      const id = Number(idStr);
      const lead = leads.find((l) => l.id === id);
      if (!lead) continue;
      const isSelected = id === selectedId;
      const el = marker.getElement();
      el.innerHTML = buildPinSVG(isSelected ? '#ffffff' : pinColor(lead.status), w, h);
      el.style.zIndex = isSelected ? '10' : '1';
      el.style.transform = isSelected ? 'scale(1.25)' : 'scale(1)';
      el.style.transition = 'transform 0.15s ease';
    }
  }, [selectedId, leads]);

  // Fly to selected
  useEffect(() => {
    const map = mapRef.current;
    if (!map || selectedId == null) return;
    const lead = leads.find((l) => l.id === selectedId);
    if (!lead?.geocoded) return;

    // On mobile, offset upward so pin isn't hidden behind the bottom sheet
    const isMobile = window.innerWidth <= 640;
    map.flyTo({
      center: [lead.geocoded.lng, lead.geocoded.lat],
      zoom: Math.max(map.getZoom(), 14),
      duration: 500,
      offset: isMobile ? [0, -80] : [0, 0],
    });
  }, [selectedId, leads]);

  // Auto-fit all pins when first loaded
  useEffect(() => {
    const map = mapRef.current;
    const geocoded = leads.filter((l) => l.geocoded);
    if (!map || geocoded.length < 2) return;

    function fitBounds() {
      const bounds = geocoded.reduce(
        (b, l) => b.extend([l.geocoded.lng, l.geocoded.lat]),
        new maplibregl.LngLatBounds(
          [geocoded[0].geocoded.lng, geocoded[0].geocoded.lat],
          [geocoded[0].geocoded.lng, geocoded[0].geocoded.lat],
        ),
      );
      map.fitBounds(bounds, { padding: 60, maxZoom: 16, duration: 800 });
    }

    if (map.isStyleLoaded()) fitBounds();
    else map.once('load', fitBounds);
  // Only run when geocoded count changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leads.filter((l) => l.geocoded).length]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}
