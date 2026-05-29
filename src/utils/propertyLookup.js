/**
 * Lane County property records lookup via public ArcGIS REST API.
 *
 * Data source: Lane County Taxlots — updated weekly from Lane County
 * Assessment & Taxation (LCAT) / RLIDgeo geodatabase.
 *
 * Endpoint: gis.eugene-or.gov (same server as Eugene zoning — CORS-enabled)
 *
 * Returns: owner, assessed value, taxable value, land/improvement value,
 *          year built, property class, acreage, zoning, neighborhood,
 *          tax account #, and a direct link to the RLID full report
 *          (which includes tax balance due / delinquency status).
 */

const TAXLOT_URL =
  'https://gis.eugene-or.gov/arcgis/rest/services/PWM/COE_Basemap_Tiled_Pro/MapServer/2/query';

const FIELDS = [
  'ownname', 'acctno', 'maptaxlot',
  'propcl', 'propcldes',        // property class (e.g. "101 = Single Family Residential")
  'statcl', 'statcldes',        // status class (e.g. "A = Active", "D = Delinquent")
  'landval', 'impval', 'totval',
  'assdtotval',                  // assessed total value
  'taxable_value',
  'exm_amt_reg_value',           // exemption amount
  'exemptdesc',                  // exemption description (homestead, senior, etc.)
  'bldgtype',                    // building type
  'yearblt',                     // year built
  'mapacres',                    // lot acreage
  'zoningdesc',                  // zoning description
  'geocity_name',                // incorporated city
  'neighborhood_name',
  'rlid_link',                   // direct URL to full RLID property report
].join(',');

function fmt$(n) {
  if (!n || n === 0) return null;
  return `$${Math.round(n).toLocaleString()}`;
}

/**
 * Look up Lane County property records by lat/lon.
 * @param {number} lat
 * @param {number} lng
 * @returns {Promise<object|null>}  Null if not found or outside Lane County.
 */
export async function lookupProperty(lat, lng) {
  if (!lat || !lng) return null;

  const params = new URLSearchParams({
    geometry:     JSON.stringify({ x: lng, y: lat }),
    geometryType: 'esriGeometryPoint',
    inSR:         '4326',
    spatialRel:   'esriSpatialRelIntersects',
    outFields:    FIELDS,
    outSR:        '4326',
    f:            'json',
    resultRecordCount: '1',
  });

  try {
    const res  = await fetch(`${TAXLOT_URL}?${params}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const feat = data.features?.[0]?.attributes;
    if (!feat) return null;

    const assessed  = feat.assdtotval  || 0;
    const market    = feat.totval      || 0;
    const taxable   = feat.taxable_value || 0;
    const landVal   = feat.landval     || 0;
    const impVal    = feat.impval      || 0;
    const exemption = feat.exm_amt_reg_value || 0;

    // Equity gap: difference between market value and assessed value
    const assessedGap = market > assessed ? market - assessed : 0;

    // Tax account link (direct RLID record — shows tax balance due)
    const acctno    = feat.acctno?.trim();
    const rlidLink  = feat.rlid_link?.trim() ||
      (acctno ? `https://rlid.org/standard/property/?acct=${acctno}` : null);

    // Lane County tax payment lookup (shows if taxes are delinquent and by how much)
    const taxPayLink = acctno
      ? `https://apps.lanecounty.org/TaxPayment/?Acct=${acctno}`
      : null;

    return {
      // Ownership
      ownerFromRecords: feat.ownname  || null,
      taxAccount:       acctno        || null,
      mapTaxlot:        feat.maptaxlot || null,

      // Values
      marketValue:    fmt$(market)    || null,
      assessedValue:  fmt$(assessed)  || null,
      taxableValue:   fmt$(taxable)   || null,
      landValue:      fmt$(landVal)   || null,
      improvementValue: fmt$(impVal)  || null,
      exemptionAmount: exemption > 0 ? fmt$(exemption) : null,
      exemptionType:   feat.exemptdesc || null,

      // Assessed vs market gap (distress indicator)
      assessedVsMarketGap: assessedGap > 0 ? fmt$(assessedGap) : null,

      // Property details
      propertyClass:  feat.propcldes || feat.propcl || null,
      statusClass:    feat.statcldes || feat.statcl || null,
      buildingType:   feat.bldgtype  || null,
      yearBuilt:      feat.yearblt   || null,
      acreage:        feat.mapacres  ? `${Number(feat.mapacres).toFixed(2)} ac` : null,
      zoningFromRecords: feat.zoningdesc || null,
      city:           feat.geocity_name || null,
      neighborhood:   feat.neighborhood_name || null,

      // Links
      rlidLink,
      taxPayLink,

      _raw: feat,
    };
  } catch (err) {
    console.error('[propertyLookup]', err);
    return null;
  }
}
