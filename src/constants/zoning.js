// Eugene zoning ArcGIS REST — Base Zones layer (id: 0)
// outSR=4326 reprojects from WKID 2914 to WGS84
export const ZONING_URL =
  'https://gis.eugene-or.gov/arcgis/rest/services/PDD/PDDZoning/MapServer/0/query' +
  '?where=1%3D1&outFields=zonecode%2Czonename&outSR=4326&f=geojson';

// Zone code → fill color (tuned for dark basemap)
export const ZONE_COLORS = {
  'R-1':   '#4a7c4e',
  'R-1.5': '#5a9e5f',
  'R-2':   '#f5a623',
  'R-3':   '#e8742a',
  'R-4':   '#d9534f',
  'C-1':   '#7b68ee',
  'C-2':   '#9b59b6',
  'C-3':   '#8e44ad',
  'GO':    '#5b8dd9',
  'E-1':   '#2980b9',
  'E-2':   '#1abc9c',
  'I-2':   '#7f8c8d',
  'I-3':   '#636e72',
  'PL':    '#3498db',
  'NR':    '#27ae60',
  'PRO':   '#16a085',
  'AG':    '#d4ac0d',
};

export const DEFAULT_ZONE_COLOR = '#30363d';

export const ZONE_DESCRIPTIONS = {
  'R-1':   'Low-Density Residential',
  'R-1.5': 'Rowhouse',
  'R-2':   'Medium-Density Residential',
  'R-3':   'Limited High-Density Residential',
  'R-4':   'High-Density Residential',
  'C-1':   'Neighborhood Commercial',
  'C-2':   'Community Commercial',
  'C-3':   'Major Commercial',
  'GO':    'General Office',
  'E-1':   'Campus Employment',
  'E-2':   'Mixed Use Employment',
  'I-2':   'Light-Medium Industrial',
  'I-3':   'Heavy Industrial',
  'PL':    'Public Land',
  'NR':    'Natural Resource',
  'PRO':   'Park & Open Space',
  'AG':    'Agricultural',
};

// Legend groups
export const ZONE_GROUPS = [
  { label: 'Residential', codes: ['R-1', 'R-1.5', 'R-2', 'R-3', 'R-4'] },
  { label: 'Commercial',  codes: ['C-1', 'C-2', 'C-3', 'GO'] },
  { label: 'Employment',  codes: ['E-1', 'E-2', 'I-2', 'I-3'] },
  { label: 'Other',       codes: ['PL', 'NR', 'PRO', 'AG'] },
];
