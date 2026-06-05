export const PRIORITY_FIELDS = [
  { key: 'name', label: 'Owner / Name' },
  { key: 'llcowner', label: 'LLC Owner' },
  { key: 'relative', label: 'Possible Relative' },
  { key: 'address', label: 'Address' },
  { key: 'city', label: 'City' },
  { key: 'state', label: 'State' },
  { key: 'zip', label: 'ZIP' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'price', label: 'Est. Value' },
  { key: 'equity', label: 'Est. Equity' },
  { key: 'sqft', label: 'Sq Ft' },
  { key: 'beds', label: 'Beds' },
  { key: 'baths', label: 'Baths' },
  { key: 'distress', label: 'Distress Score' },
  { key: 'mls', label: 'MLS #' },
  { key: 'status', label: 'Status' },
  { key: 'notes', label: 'Notes' },
];

export function buildLeadFieldRows(lead) {
  if (!lead) return [];
  const priorityKeys = new Set([...PRIORITY_FIELDS.map((f) => f.key), 'notes', 'status']);
  const extraFields = Object.entries(lead._raw ?? {}).filter(
    ([key, val]) => !priorityKeys.has(key.toLowerCase()) && val != null && String(val).trim().length > 0,
  );
  return [
    ...PRIORITY_FIELDS
      .map(({ key, label }) => ({ key, label, val: lead[key] }))
      .filter(({ val }) => val != null && String(val).trim() !== ''),
    ...extraFields.map(([key, val]) => ({ key, label: key, val: String(val) })),
  ];
}

export function buildListPreviewRows(listMeta) {
  if (!listMeta) return [];
  const headers = listMeta.headers ?? listMeta.selectedHeaders ?? [];
  const rows = listMeta.previewRows ?? [];
  return { headers, rows };
}
