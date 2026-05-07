import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { ZONE_COLORS, DEFAULT_ZONE_COLOR, ZONE_DESCRIPTIONS } from '../constants/zoning';
import { buildOrZoneColorExpr, OR_ZONE_COLORS, OR_ZONE_DESCRIPTIONS, DEFAULT_OR_COLOR } from '../constants/orZoning';

const EUGENE = [-123.0868, 44.0521];

// Lead status → pin color
const STATUS_COLORS = {
  'New':            '#58a6ff',
  'Contacted':      '#f5a623',
  'Negotiating':    '#e8742a',
  'Under Contract': '#3fb950',
  'Dead':           '#6e7681',
  'Closed':         '#1abc9c',
};

// Eugene zoning layers
const ZONE_SRC    = 'eugene-zoning';
const ZONE_FILL   = 'zoning-fill';
const ZONE_LINE   = 'zoning-line';

// Regional (DLCD) zoning layers
const REG_SRC  = 'regional-zoning';
const REG_FILL = 'regional-fill';
const REG_LINE = 'regional-line';

// Lead layer (GeoJSON — GPU rendered, handles 1000+ pins easily)
const LEAD_SRC    = 'leads-src';
const LEAD_CIRCLE = 'leads-circle';
const LEAD_HALO   = 'leads-halo';    // selection ring

function buildZoneColorExpr() {
  const expr = ['match', ['get', 'zonecode']];
  for (const [code, color] of Object.entries(ZONE_COLORS)) expr.push(code, color);
  expr.push(DEFAULT_ZONE_COLOR);
  return expr;
}

function leadsToGeojson(leads) {
  return {
    type: 'FeatureCollection',
    features: leads
      .filter((l) => l.geocoded)
      .map((l) => ({
        type: 'Feature',
        id: l.id,           // numeric id required for feature state
        geometry: { type: 'Point', coordinates: [l.geocoded.lng, l.geocoded.lat] },
        properties: {
          id:       l.id,
          status:   l.status ?? 'New',
          zoneCode: l.zoneCode ?? '',
          name:     l.name ?? '',
          address:  l.address ?? l._addressForGeocode ?? '',
        },
      })),
  };
}

export default function MapView({
  leads, selectedId, onSelectLead,
  zoningGeojson, zoningVisible,
  regionalGeojson, regionalVisible,
  zoneFilter,
  onBoundsChange,   // fn({ west,south,east,north }, zoom)
}) {
  const containerRef  = useRef(null);
  const mapRef        = useRef(null);
  const popupRef      = useRef(null);
  const prevSelected  = useRef(null);
  const boundsRef     = useRef(onBoundsChange);
  useEffect(() => { boundsRef.current = onBoundsChange; }, [onBoundsChange]);

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

    // Fire bounds on every map move (debounced by the hook consumer)
    const fireBounds = () => {
      const b = map.getBounds();
      boundsRef.current?.(
        { west: b.getWest(), south: b.getSouth(), east: b.getEast(), north: b.getNorth() },
        map.getZoom(),
      );
    };
    map.on('moveend', fireBounds);
    map.once('load', fireBounds); // fire once on initial load too

    popupRef.current = new maplibregl.Popup({
      closeButton: true, closeOnClick: false,
      maxWidth: '240px', className: 'zone-popup',
    });

    // ── Lead layers (added after style loads) ────────────────────────────
    map.once('load', () => {
      // Source
      map.addSource(LEAD_SRC, {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
        generateId: false, // we supply numeric ids ourselves
      });

      // Halo (selected indicator)
      map.addLayer({
        id: LEAD_HALO,
        type: 'circle',
        source: LEAD_SRC,
        paint: {
          'circle-radius': 18,
          'circle-color': '#ffffff',
          'circle-opacity': ['case', ['boolean', ['feature-state', 'selected'], false], 0.25, 0],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
          'circle-stroke-opacity': ['case', ['boolean', ['feature-state', 'selected'], false], 0.8, 0],
        },
      });

      // Main circle
      map.addLayer({
        id: LEAD_CIRCLE,
        type: 'circle',
        source: LEAD_SRC,
        paint: {
          'circle-radius': [
            'interpolate', ['linear'], ['zoom'],
            10, 7,
            14, 11,
            18, 16,
          ],
          'circle-color': [
            'match', ['get', 'status'],
            'New',            '#58a6ff',
            'Contacted',      '#f5a623',
            'Negotiating',    '#e8742a',
            'Under Contract', '#3fb950',
            'Dead',           '#6e7681',
            'Closed',         '#1abc9c',
            '#58a6ff',
          ],
          'circle-stroke-width': 1.5,
          'circle-stroke-color': '#fff',
          'circle-stroke-opacity': 0.7,
        },
      });

      // Click lead circle
      map.on('click', LEAD_CIRCLE, (e) => {
        const id = e.features?.[0]?.properties?.id;
        if (id != null) onSelectLead(Number(id));
      });
      map.on('mouseenter', LEAD_CIRCLE, () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', LEAD_CIRCLE, () => { map.getCanvas().style.cursor = ''; });
    });

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Keep onSelectLead ref current (avoid stale closure) ─────────────────
  const selectRef = useRef(onSelectLead);
  useEffect(() => { selectRef.current = onSelectLead; }, [onSelectLead]);

  // ── Update lead GeoJSON source ────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const geojson = leadsToGeojson(leads);
    function update() {
      if (map.getSource(LEAD_SRC)) map.getSource(LEAD_SRC).setData(geojson);
    }
    if (map.isStyleLoaded()) update();
    else map.once('load', update);
  }, [leads]);

  // ── Apply zone filter on lead layer ──────────────────────────────────────
  // Store latest filter in a ref so the load callback always uses current value
  const zoneFilterRef = useRef(zoneFilter);
  useEffect(() => { zoneFilterRef.current = zoneFilter; }, [zoneFilter]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    function apply() {
      if (!map.getLayer(LEAD_CIRCLE)) return;
      const current = zoneFilterRef.current;
      if (!current || current.size === 0) {
        map.setFilter(LEAD_CIRCLE, null);
        map.setFilter(LEAD_HALO,   null);
      } else {
        const codes = [...current];
        const f = ['any',
          ['in', ['get', 'zoneCode'], ['literal', codes]],
          ['==', ['get', 'zoneCode'], ''],
        ];
        map.setFilter(LEAD_CIRCLE, f);
        map.setFilter(LEAD_HALO,   f);
      }
    }

    // If style + layers already loaded, apply immediately.
    // Otherwise wait for load — the callback uses the ref so it gets
    // the latest filter value even if it fires after more state changes.
    if (map.isStyleLoaded() && map.getLayer(LEAD_CIRCLE)) {
      apply();
    } else if (!map.isStyleLoaded()) {
      map.once('load', apply);
    } else {
      // Style loaded but layer not yet — retry after a frame
      const id = setTimeout(apply, 100);
      return () => clearTimeout(id);
    }
  }, [zoneFilter]);

  // ── Selected feature state ────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    if (prevSelected.current != null) {
      map.setFeatureState({ source: LEAD_SRC, id: prevSelected.current }, { selected: false });
    }
    if (selectedId != null) {
      map.setFeatureState({ source: LEAD_SRC, id: selectedId }, { selected: true });
    }
    prevSelected.current = selectedId;
  }, [selectedId]);

  // ── Fly to selected lead ──────────────────────────────────────────────────
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

  // ── Auto-fit all pins on first geocode completion ────────────────────────
  const geocodedCount = leads.filter((l) => l.geocoded).length;
  useEffect(() => {
    const map = mapRef.current;
    const pts = leads.filter((l) => l.geocoded);
    if (!map || pts.length < 2) return;
    function fit() {
      const bounds = pts.reduce(
        (b, l) => b.extend([l.geocoded.lng, l.geocoded.lat]),
        new maplibregl.LngLatBounds(
          [pts[0].geocoded.lng, pts[0].geocoded.lat],
          [pts[0].geocoded.lng, pts[0].geocoded.lat],
        ),
      );
      map.fitBounds(bounds, { padding: 70, maxZoom: 16, duration: 800 });
    }
    if (map.isStyleLoaded()) fit();
    else map.once('load', fit);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geocodedCount]);

  // ── Zoning source + layers ────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !zoningGeojson) return;
    function addZoning() {
      if (!map.getSource(ZONE_SRC)) {
        map.addSource(ZONE_SRC, { type: 'geojson', data: zoningGeojson });
      } else {
        map.getSource(ZONE_SRC).setData(zoningGeojson);
        return;
      }
      // Insert zoning BELOW lead layers
      const beforeLayer = map.getLayer(LEAD_HALO) ? LEAD_HALO : undefined;
      map.addLayer({
        id: ZONE_FILL, type: 'fill', source: ZONE_SRC,
        paint: { 'fill-color': buildZoneColorExpr(), 'fill-opacity': 0.35 },
      }, beforeLayer);
      map.addLayer({
        id: ZONE_LINE, type: 'line', source: ZONE_SRC,
        paint: { 'line-color': '#ffffff', 'line-opacity': 0.12, 'line-width': 0.6 },
      }, beforeLayer);

      map.on('click', ZONE_FILL, (e) => {
        // Don't fire if user clicked a lead circle
        const leadFeats = map.queryRenderedFeatures(e.point, { layers: [LEAD_CIRCLE] });
        if (leadFeats.length) return;
        const f = e.features?.[0];
        if (!f) return;
        const code  = f.properties.zonecode ?? '';
        const desc  = ZONE_DESCRIPTIONS[code] ?? f.properties.zonename ?? code;
        const color = ZONE_COLORS[code] ?? DEFAULT_ZONE_COLOR;
        popupRef.current
          .setLngLat(e.lngLat)
          .setHTML(`<div class="zp-inner"><span class="zp-badge" style="background:${color}">${code}</span><p class="zp-desc">${desc}</p></div>`)
          .addTo(map);
      });
      map.on('mouseenter', ZONE_FILL, () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', ZONE_FILL, () => { map.getCanvas().style.cursor = ''; });
    }
    if (map.isStyleLoaded()) addZoning();
    else map.once('load', addZoning);
  }, [zoningGeojson]);

  // ── Eugene zoning visibility ──────────────────────────────────────────────
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

  // ── Regional (DLCD) zoning source + layers ────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    function addRegional() {
      if (!map.getSource(REG_SRC)) {
        map.addSource(REG_SRC, {
          type: 'geojson',
          data: regionalGeojson ?? { type: 'FeatureCollection', features: [] },
        });
        // Insert below Eugene layer (so Eugene wins on overlap) but above basemap
        const before = map.getLayer(ZONE_FILL) ? ZONE_FILL : (map.getLayer(LEAD_HALO) ? LEAD_HALO : undefined);
        map.addLayer({
          id: REG_FILL, type: 'fill', source: REG_SRC,
          paint: { 'fill-color': buildOrZoneColorExpr(), 'fill-opacity': 0.32 },
        }, before);
        map.addLayer({
          id: REG_LINE, type: 'line', source: REG_SRC,
          paint: { 'line-color': '#ffffff', 'line-opacity': 0.1, 'line-width': 0.5 },
        }, before);

        // Click popup for regional zones
        map.on('click', REG_FILL, (e) => {
          const leadFeats = map.queryRenderedFeatures(e.point, { layers: [LEAD_CIRCLE] });
          if (leadFeats.length) return;
          const eugeneFeats = map.queryRenderedFeatures(e.point, { layers: [ZONE_FILL] });
          if (eugeneFeats.length) return; // let Eugene popup handle it
          const f = e.features?.[0];
          if (!f) return;
          const code  = f.properties.orZCode ?? '';
          const local = f.properties.localZCode ?? '';
          const desc  = f.properties.localZDesc || OR_ZONE_DESCRIPTIONS[code] || code;
          const owner = f.properties.ownerName ?? '';
          const color = OR_ZONE_COLORS[code] ?? DEFAULT_OR_COLOR;
          popupRef.current
            .setLngLat(e.lngLat)
            .setHTML(
              `<div class="zp-inner">
                <span class="zp-badge" style="background:${color}">${local || code}</span>
                <p class="zp-desc">${desc}</p>
                <p class="zp-owner">${owner}</p>
               </div>`
            )
            .addTo(map);
        });
        map.on('mouseenter', REG_FILL, () => { map.getCanvas().style.cursor = 'pointer'; });
        map.on('mouseleave', REG_FILL, () => { map.getCanvas().style.cursor = ''; });
      } else if (regionalGeojson) {
        map.getSource(REG_SRC).setData(regionalGeojson);
      }
    }

    if (map.isStyleLoaded()) addRegional();
    else map.once('load', addRegional);
  }, [regionalGeojson]);

  // ── Regional visibility ───────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const v = regionalVisible ? 'visible' : 'none';
    function apply() {
      if (map.getLayer(REG_FILL)) map.setLayoutProperty(REG_FILL, 'visibility', v);
      if (map.getLayer(REG_LINE)) map.setLayoutProperty(REG_LINE, 'visibility', v);
    }
    if (map.isStyleLoaded()) apply();
    else map.once('load', apply);
  }, [regionalVisible]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}
