import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { ZONE_COLORS, DEFAULT_ZONE_COLOR, ZONE_DESCRIPTIONS } from '../constants/zoning';

const EUGENE = [-123.0868, 44.0521];

const STATUS_COLORS = {
  'New':            '#58a6ff',
  'Contacted':      '#f5a623',
  'Negotiating':    '#e8742a',
  'Under Contract': '#3fb950',
  'Dead':           '#6e7681',
  'Closed':         '#1abc9c',
};

function pinColor(status) { return STATUS_COLORS[status] ?? '#58a6ff'; }

function pinSize() {
  return window.innerWidth <= 640 ? { w: 36, h: 46 } : { w: 28, h: 36 };
}

function buildPinSVG(color, w, h) {
  const cx = w / 2;
  const r  = w * 0.28;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <path d="M${cx} 0C${cx*0.45} 0 0 ${cx*0.45} 0 ${cx}c0 ${cx*0.75} ${cx} ${h-cx} ${cx} ${h-cx}S${w} ${cx+cx*0.75} ${w} ${cx}C${w} ${cx*0.45} ${cx*1.55} 0 ${cx} 0z"
      fill="${color}" stroke="rgba(0,0,0,0.4)" stroke-width="1.5"/>
    <circle cx="${cx}" cy="${cx}" r="${r}" fill="white" opacity="0.9"/>
  </svg>`;
}

// MapLibre match expression from zone color map
function buildZoneColorExpr() {
  const expr = ['match', ['get', 'zonecode']];
  for (const [code, color] of Object.entries(ZONE_COLORS)) {
    expr.push(code, color);
  }
  expr.push(DEFAULT_ZONE_COLOR);
  return expr;
}

const ZONE_SRC   = 'eugene-zoning';
const ZONE_FILL  = 'zoning-fill';
const ZONE_LINE  = 'zoning-line';

export default function MapView({
  leads, selectedId, onSelectLead,
  zoningGeojson, zoningVisible,
}) {
  const containerRef = useRef(null);
  const mapRef       = useRef(null);
  const markersRef   = useRef({});
  const popupRef     = useRef(null);

  // ── Init map ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: 'https://tiles.openfreemap.org/styles/dark',
      center: EUGENE,
      zoom: 11,
      cooperativeGestures: false,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');

    popupRef.current = new maplibregl.Popup({
      closeButton: true,
      closeOnClick: false,
      maxWidth: '240px',
      className: 'zone-popup',
    });

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // ── Zoning layer ──────────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !zoningGeojson) return;

    function addZoning() {
      if (!map.getSource(ZONE_SRC)) {
        map.addSource(ZONE_SRC, { type: 'geojson', data: zoningGeojson });
      } else {
        map.getSource(ZONE_SRC).setData(zoningGeojson);
        return; // layers already added
      }

      map.addLayer({
        id: ZONE_FILL,
        type: 'fill',
        source: ZONE_SRC,
        paint: {
          'fill-color': buildZoneColorExpr(),
          'fill-opacity': 0.35,
        },
      });

      map.addLayer({
        id: ZONE_LINE,
        type: 'line',
        source: ZONE_SRC,
        paint: {
          'line-color': '#ffffff',
          'line-opacity': 0.12,
          'line-width': 0.6,
        },
      });

      // Click → zone popup
      map.on('click', ZONE_FILL, (e) => {
        const f = e.features?.[0];
        if (!f) return;
        const code = f.properties.zonecode ?? '';
        const desc = ZONE_DESCRIPTIONS[code] ?? f.properties.zonename ?? code;
        const color = ZONE_COLORS[code] ?? DEFAULT_ZONE_COLOR;

        popupRef.current
          .setLngLat(e.lngLat)
          .setHTML(
            `<div class="zp-inner">
               <span class="zp-badge" style="background:${color}">${code}</span>
               <p class="zp-desc">${desc}</p>
             </div>`
          )
          .addTo(map);
      });

      map.on('mouseenter', ZONE_FILL, () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', ZONE_FILL, () => { map.getCanvas().style.cursor = ''; });
    }

    if (map.isStyleLoaded()) addZoning();
    else map.once('load', addZoning);
  }, [zoningGeojson]);

  // ── Zoning visibility toggle ──────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const v = zoningVisible ? 'visible' : 'none';
    function apply() {
      if (map.getLayer(ZONE_FILL)) map.setLayoutProperty(ZONE_FILL, 'visibility', v);
      if (map.getLayer(ZONE_LINE)) map.setLayoutProperty(ZONE_LINE, 'visibility', v);
      if (!zoningVisible) popupRef.current?.remove();
    }
    if (map.isStyleLoaded()) apply();
    else map.once('load', apply);
  }, [zoningVisible]);

  // ── Lead markers ──────────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    function syncMarkers() {
      const existingIds = new Set(Object.keys(markersRef.current).map(Number));
      const newIds = new Set(leads.filter((l) => l.geocoded).map((l) => l.id));

      for (const id of existingIds) {
        if (!newIds.has(id)) { markersRef.current[id]?.remove(); delete markersRef.current[id]; }
      }

      for (const lead of leads) {
        if (!lead.geocoded) continue;
        const { lat, lng } = lead.geocoded;
        const { w, h } = pinSize();

        if (markersRef.current[lead.id]) {
          markersRef.current[lead.id].getElement().innerHTML = buildPinSVG(pinColor(lead.status), w, h);
          continue;
        }

        const el = document.createElement('div');
        el.innerHTML = buildPinSVG(pinColor(lead.status), w, h);
        el.style.cssText = `cursor:pointer;width:${w}px;height:${h}px;padding:6px;margin:-6px;`;
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

  // ── Highlight selected pin ────────────────────────────────────────────────
  useEffect(() => {
    const { w, h } = pinSize();
    for (const [idStr, marker] of Object.entries(markersRef.current)) {
      const id = Number(idStr);
      const lead = leads.find((l) => l.id === id);
      if (!lead) continue;
      const sel = id === selectedId;
      const el = marker.getElement();
      el.innerHTML = buildPinSVG(sel ? '#ffffff' : pinColor(lead.status), w, h);
      el.style.zIndex = sel ? '10' : '1';
      el.style.transform = sel ? 'scale(1.3)' : 'scale(1)';
      el.style.transition = 'transform 0.15s ease';
    }
  }, [selectedId, leads]);

  // ── Fly to selected ───────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || selectedId == null) return;
    const lead = leads.find((l) => l.id === selectedId);
    if (!lead?.geocoded) return;
    map.flyTo({
      center: [lead.geocoded.lng, lead.geocoded.lat],
      zoom: Math.max(map.getZoom(), 14),
      duration: 500,
      offset: window.innerWidth <= 640 ? [0, -80] : [0, 0],
    });
  }, [selectedId, leads]);

  // ── Auto-fit all pins on first load ──────────────────────────────────────
  const geocodedCount = leads.filter((l) => l.geocoded).length;
  useEffect(() => {
    const map = mapRef.current;
    const geocoded = leads.filter((l) => l.geocoded);
    if (!map || geocoded.length < 2) return;
    function fit() {
      const bounds = geocoded.reduce(
        (b, l) => b.extend([l.geocoded.lng, l.geocoded.lat]),
        new maplibregl.LngLatBounds(
          [geocoded[0].geocoded.lng, geocoded[0].geocoded.lat],
          [geocoded[0].geocoded.lng, geocoded[0].geocoded.lat],
        ),
      );
      map.fitBounds(bounds, { padding: 60, maxZoom: 16, duration: 800 });
    }
    if (map.isStyleLoaded()) fit();
    else map.once('load', fit);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geocodedCount]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}
