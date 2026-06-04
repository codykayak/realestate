/**
 * Real CSV / XLS / XLSX importer for residents & units.
 *
 * Self-contained (uses papaparse + SheetJS xlsx, both already in the project)
 * so the module has no dependency on host-site parsing code. Flexible header
 * matching maps common PMS/spreadsheet column names to our canonical resident
 * shape; unmatched columns are preserved on `_raw` for display.
 */

import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { genId } from '../../data/store';

const ALIASES = {
  name: ['name', 'resident', 'tenant', 'full_name', 'first_name', 'occupant', 'lease_holder', 'primary_resident'],
  unit: ['unit', 'unit_number', 'apt', 'apartment', 'unit_no', 'suite', 'space'],
  property: ['property', 'property_name', 'building', 'community', 'site'],
  phone: ['phone', 'cell', 'mobile', 'telephone', 'phone_number', 'contact_phone'],
  email: ['email', 'email_address', 'e_mail', 'contact_email'],
  balance: ['balance', 'amount_due', 'past_due', 'current_balance', 'ar_balance'],
  leaseEnd: ['lease_end', 'lease_expiration', 'lease_end_date', 'move_out', 'expiration'],
  rent: ['rent', 'monthly_rent', 'market_rent', 'lease_rent'],
};

function normalize(s) {
  return String(s ?? '').toLowerCase().replace(/[\s\-_./$()+]+/g, '_').replace(/^_+|_+$/g, '');
}

function mapHeaders(headers) {
  const map = {};
  for (const h of headers) {
    const n = normalize(h);
    if (!n) continue;
    for (const [canonical, aliases] of Object.entries(ALIASES)) {
      if (map[canonical]) continue;
      if (aliases.some((a) => normalize(a) === n || n.startsWith(normalize(a)))) {
        map[canonical] = h;
        break;
      }
    }
  }
  return map;
}

function rowToResident(row, map) {
  const get = (canonical) => {
    const header = map[canonical];
    const v = header ? row[header] : '';
    return v == null ? '' : String(v).trim();
  };
  const balanceRaw = get('balance').replace(/[$,]/g, '');
  return {
    id: genId('res'),
    name: get('name') || '(Unnamed)',
    unit: get('unit'),
    property: get('property'),
    phone: get('phone'),
    email: get('email'),
    rent: get('rent'),
    balance: balanceRaw && !isNaN(Number(balanceRaw)) ? Number(balanceRaw) : 0,
    leaseEnd: get('leaseEnd'),
    _raw: row,
    createdAt: Date.now(),
  };
}

function parseCsv(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: (h) => (h ? h.trim() : h),
      complete: ({ data, meta }) => {
        const headers = (meta.fields || []).filter(Boolean);
        const map = mapHeaders(headers);
        const rows = data.filter((r) => Object.values(r).some((v) => v !== '' && v != null));
        resolve(rows.map((r) => rowToResident(r, map)));
      },
      error: reject,
    });
  });
}

function parseExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        if (!rows.length) return reject(new Error('Spreadsheet has no data rows.'));
        const headers = Object.keys(rows[0]);
        const map = mapHeaders(headers);
        resolve(rows.map((r) => rowToResident(r, map)));
      } catch (err) {
        reject(new Error(`Failed to parse spreadsheet: ${err.message}`));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsArrayBuffer(file);
  });
}

/** Accepts .csv, .xls, .xlsx, .xlsm and returns an array of resident objects. */
export async function importResidentsFromFile(file) {
  const name = (file.name || '').toLowerCase();
  if (/\.(xlsx|xls|xlsm)$/.test(name)) return parseExcel(file);
  return parseCsv(file);
}

export default importResidentsFromFile;
