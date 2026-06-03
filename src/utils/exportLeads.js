import Papa from 'papaparse';

const EXPORT_COLUMNS = [
  'id', 'name', 'address', 'city', 'state', 'zip', 'phone', 'email',
  'status', 'notes', 'callCount', 'smsCount', 'doNotCall', 'doNotText', 'smsOptOut',
  'appointmentAt', 'price', 'equity', 'distress',
];

/** @param {Record<string, unknown>[]} leads */
export function exportLeadsCsv(leads, filename = 'macrorei-leads.csv') {
  const rows = leads.map((l) => {
    const row = {};
    for (const key of EXPORT_COLUMNS) {
      row[key] = l[key] ?? '';
    }
    if (l.phones?.length) {
      row.phones = l.phones.map((p) => `${p.label}: ${p.number}`).join('; ');
    }
    return row;
  });

  const csv = Papa.unparse(rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
