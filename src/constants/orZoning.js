/**
 * Oregon DLCD Statewide Zoning Service
 * https://services8.arcgis.com/8PAo5HGmvRMlF2eU/ArcGIS/rest/services/Zoning/FeatureServer/0
 *
 * Covers: Eugene, Springfield, Lane County, Benton County (Corvallis),
 *         Linn County (Albany, Lebanon, Sweet Home), and 220+ other jurisdictions.
 *
 * Queried with bbox filter — only fetches the visible map area.
 */

export const DLCD_URL =
  'https://services8.arcgis.com/8PAo5HGmvRMlF2eU/ArcGIS/rest/services/Zoning/FeatureServer/0/query';

// Jurisdictions shown in the county layer toggles.
// ownerName matches the value in the DLCD dataset.
export const JURISDICTIONS = [
  {
    id: 'lane',
    label: 'Lane County',
    color: '#58a6ff',
    owners: ['Lane County', 'Eugene', 'Springfield', 'Junction City', 'Cottage Grove',
             'Creswell', 'Florence', 'Oakridge', 'Veneta', 'Coburg', 'Lowell',
             'Dunes City', 'Westfir'],
  },
  {
    id: 'benton',
    label: 'Benton County',
    color: '#3fb950',
    owners: ['Benton County', 'Corvallis', 'Philomath', 'Monroe'],
  },
  {
    id: 'linn',
    label: 'Linn County',
    color: '#f5a623',
    owners: ['Linn County', 'Albany', 'Lebanon', 'Sweet Home', 'Millersburg',
             'Halsey', 'Harrisburg', 'Tangent', 'Scio', 'Gates', 'Lyons',
             'Mill City', 'Brownsville', 'Waterloo'],
  },
];

// Oregon standardized orZCode → fill color (dark-map tuned)
export const OR_ZONE_COLORS = {
  // Residential
  'SF':   '#4a7c4e',  // Single Family
  'MF':   '#f5a623',  // Multi-Family
  'MH':   '#5a9e5f',  // Manufactured Housing
  'RR':   '#3d6b41',  // Rural Residential
  // Commercial
  'CR':   '#7b68ee',  // Commercial Retail
  'CO':   '#5b8dd9',  // Commercial Office
  'CM':   '#9b59b6',  // Commercial Mixed
  'CBD':  '#8e44ad',  // Central Business District
  // Industrial
  'I':    '#7f8c8d',  // Industrial (generic)
  'LI':   '#95a5a6',  // Light Industrial
  'HI':   '#636e72',  // Heavy Industrial
  'CI':   '#576574',  // Campus Industrial
  // Agricultural/Rural
  'AG':   '#d4ac0d',  // Agricultural
  'EFU':  '#c8a007',  // Exclusive Farm Use
  'F':    '#27ae60',  // Forestry
  // Public/Open Space
  'OS':   '#16a085',  // Open Space / Parks
  'PF':   '#3498db',  // Public Facility
  // Mixed / Transition
  'MX':   '#1abc9c',  // Mixed Use
  'UT':   '#e67e22',  // Urban Transition
  'NS':   '#2d333b',  // Not Shared (data withheld)
};

export const DEFAULT_OR_COLOR = '#30363d';

// Build a MapLibre match expression for orZCode → color
export function buildOrZoneColorExpr() {
  const expr = ['match', ['get', 'orZCode']];
  for (const [code, color] of Object.entries(OR_ZONE_COLORS)) {
    expr.push(code, color);
  }
  expr.push(DEFAULT_OR_COLOR);
  return expr;
}

// Human-readable orZCode descriptions
export const OR_ZONE_DESCRIPTIONS = {
  SF: 'Single Family Residential',
  MF: 'Multi-Family Residential',
  MH: 'Manufactured Housing',
  RR: 'Rural Residential',
  CR: 'Commercial Retail',
  CO: 'Commercial Office',
  CM: 'Commercial Mixed',
  CBD: 'Central Business District',
  I:  'Industrial',
  LI: 'Light Industrial',
  HI: 'Heavy Industrial',
  CI: 'Campus Industrial',
  AG: 'Agricultural',
  EFU: 'Exclusive Farm Use',
  F:  'Forest',
  OS: 'Open Space / Parks',
  PF: 'Public Facility',
  MX: 'Mixed Use',
  UT: 'Urban Transition',
  NS: 'Not Shared',
};
