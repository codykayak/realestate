import { useState, useEffect, useRef } from 'react';
import { DLCD_URL, JURISDICTIONS } from '../constants/orZoning';

const MIN_ZOOM = 10;         // don't load below this zoom
const DEBOUNCE_MS = 600;     // wait for map to settle before fetching
const MAX_RECORDS = 2000;    // DLCD service limit per page

/**
 * Fetches Oregon statewide zoning (DLCD) for the current map viewport.
 *
 * @param {object|null} bounds  – { west, south, east, north } in WGS84
 * @param {number}      zoom    – current map zoom
 * @param {Set<string>} enabled – set of jurisdiction IDs to include ('lane','benton','linn')
 */
export function useRegionalZoning(bounds, zoom, enabled) {
  const [geojson, setGeojson]   = useState(null);
  const [loading, setLoading]   = useState(false);
  const cacheRef    = useRef(new Map());   // objectId → feature, dedupes across requests
  const abortRef    = useRef(null);
  const timerRef    = useRef(null);
  // Track what was last fetched to skip redundant calls
  const lastFetchRef = useRef('');

  useEffect(() => {
    // Clear timer on every bounds/zoom/enabled change
    clearTimeout(timerRef.current);

    // Nothing to show
    if (!bounds || enabled.size === 0 || zoom < MIN_ZOOM) {
      if (enabled.size === 0) {
        cacheRef.current.clear();
        setGeojson(null);
      }
      return;
    }

    // Collect all ownerNames for enabled jurisdictions
    const owners = JURISDICTIONS
      .filter((j) => enabled.has(j.id))
      .flatMap((j) => j.owners);

    if (owners.length === 0) return;

    const fetchKey = `${zoom.toFixed(0)}|${bounds.west.toFixed(3)},${bounds.south.toFixed(3)},${bounds.east.toFixed(3)},${bounds.north.toFixed(3)}|${[...enabled].sort().join(',')}`;

    // Debounce
    timerRef.current = setTimeout(async () => {
      if (fetchKey === lastFetchRef.current) return;
      lastFetchRef.current = fetchKey;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);

      try {
        // Pad bbox slightly to avoid edge clipping on pan
        const pad = 0.02;
        const geometry = JSON.stringify({
          xmin: bounds.west  - pad,
          ymin: bounds.south - pad,
          xmax: bounds.east  + pad,
          ymax: bounds.north + pad,
        });

        const ownerList = owners.map((o) => `'${o}'`).join(',');
        const params = new URLSearchParams({
          geometry,
          geometryType:  'esriGeometryEnvelope',
          inSR:          '4326',
          spatialRel:    'esriSpatialRelIntersects',
          where:         `ownerName IN (${ownerList})`,
          outFields:     'OBJECTID,localZCode,localZDesc,orZCode,orZDesc,ownerName',
          geometryPrecision: '4',   // 4 decimal places ≈ ~11m precision — 60% smaller payload
          outSR:         '4326',
          f:             'geojson',
          resultRecordCount: String(MAX_RECORDS),
        });

        const res = await fetch(`${DLCD_URL}?${params}`, { signal: controller.signal });
        if (!res.ok) throw new Error(`DLCD API ${res.status}`);
        const data = await res.json();

        if (controller.signal.aborted) return;

        // Merge new features into cache (dedupes by OBJECTID)
        for (const feature of data.features ?? []) {
          const id = feature.properties?.OBJECTID;
          if (id != null) cacheRef.current.set(id, feature);
        }

        // Rebuild GeoJSON from cache
        setGeojson({
          type: 'FeatureCollection',
          features: Array.from(cacheRef.current.values()),
        });
      } catch (e) {
        if (e.name !== 'AbortError') console.error('[regionalZoning]', e);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timerRef.current);
  }, [bounds, zoom, enabled]);

  // Clear cache when enabled jurisdictions change significantly (new toggle)
  const prevEnabled = useRef(enabled);
  useEffect(() => {
    const prev = prevEnabled.current;
    const removed = [...prev].filter((id) => !enabled.has(id));
    if (removed.length > 0) {
      // Remove cached features belonging to removed jurisdictions
      const removedOwners = new Set(
        JURISDICTIONS.filter((j) => removed.includes(j.id)).flatMap((j) => j.owners),
      );
      for (const [id, feat] of cacheRef.current) {
        if (removedOwners.has(feat.properties?.ownerName)) cacheRef.current.delete(id);
      }
      const remaining = Array.from(cacheRef.current.values());
      setGeojson(remaining.length ? { type: 'FeatureCollection', features: remaining } : null);
    }
    prevEnabled.current = enabled;
  }, [enabled]);

  return { geojson, loading };
}
