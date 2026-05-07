/**
 * Assigns the Eugene zoning code + name to each geocoded lead by doing a
 * point-in-polygon check against the loaded zoning GeoJSON.
 *
 * Uses bounding-box pre-filter for performance — handles 1000+ leads ×
 * 500+ zone polygons in well under a second.
 */

function ptInRing(px, py, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (((yi > py) !== (yj > py)) &&
        (px < ((xj - xi) * (py - yi)) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  return inside;
}

function ptInPolygonGeom(px, py, geom) {
  if (geom.type === 'Polygon') {
    // First ring is outer boundary; subsequent rings are holes
    return ptInRing(px, py, geom.coordinates[0]) &&
      !geom.coordinates.slice(1).some((hole) => ptInRing(px, py, hole));
  }
  if (geom.type === 'MultiPolygon') {
    return geom.coordinates.some(
      (poly) =>
        ptInRing(px, py, poly[0]) &&
        !poly.slice(1).some((hole) => ptInRing(px, py, hole)),
    );
  }
  return false;
}

function bbox(geom) {
  const coords =
    geom.type === 'Polygon'
      ? geom.coordinates.flat()
      : geom.coordinates.flat(2);
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const [x, y] of coords) {
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
  }
  return [minX, minY, maxX, maxY];
}

export function assignZones(leads, zoningGeojson) {
  if (!zoningGeojson?.features?.length) return leads;

  // Pre-compute bounding boxes once
  const features = zoningGeojson.features.map((f) => ({
    ...f,
    _bbox: bbox(f.geometry),
  }));

  return leads.map((lead) => {
    if (!lead.geocoded) return lead;
    const px = lead.geocoded.lng;
    const py = lead.geocoded.lat;

    for (const f of features) {
      const [x0, y0, x1, y1] = f._bbox;
      if (px < x0 || px > x1 || py < y0 || py > y1) continue; // fast reject
      if (ptInPolygonGeom(px, py, f.geometry)) {
        return {
          ...lead,
          zoneCode: f.properties.zonecode ?? '',
          zoneName: f.properties.zonename ?? '',
        };
      }
    }

    return { ...lead, zoneCode: '', zoneName: '' };
  });
}
