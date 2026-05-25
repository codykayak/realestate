import Papa from 'papaparse';
import * as XLSX from 'xlsx';

// ─── Field aliases ────────────────────────────────────────────────────────────
// Keys must match what the Firestore / sidebar logic uses as canonical names.

const FIELD_ALIASES = {
  address: ['address', 'addr', 'street', 'street_address', 'property_address',
            'situs', 'prop_address', 'site_address', 'location', 'property',
            'prop_street', 'mailing_address', 'mail_addr'],
  city:    ['city', 'town', 'municipality', 'situs_city', 'prop_city', 'mail_city'],
  state:   ['state', 'st', 'province', 'situs_state', 'prop_state', 'mail_state'],
  zip:     ['zip', 'zipcode', 'zip_code', 'postal', 'postal_code', 'situs_zip', 'mail_zip'],
  name:    ['name', 'owner', 'owner_name', 'contact', 'seller', 'full_name',
            'firstname', 'first_name', 'lastname', 'last_name', 'owner1',
            'owner_1', 'taxpayer', 'grantor', 'borrower'],
  // 'phone' maps only the FIRST/primary phone column.
  // All wireless_* and landline_* columns are collected separately in rowToLead.
  phone:   ['phone', 'phone_number', 'cell', 'mobile', 'telephone', 'tel',
            'phone1', 'phone_1', 'primary_phone', 'contact_phone',
            'wireless_1', 'wireless1', 'wireless 1'],
  email:   ['email', 'email_address', 'e_mail', 'email1'],
  price:   ['price', 'asking_price', 'list_price', 'arv', 'value', 'assessed_value',
            'market_value', 'est_value', 'appraised', 'est_market_value',
            'estimated_value', 'tax_value', 'land_value'],
  equity:  ['equity', 'est_equity', 'estimated_equity', 'equity_estimate',
            'est_equity_$', 'equity_$', 'est_equity_dollar'],
  sqft:    ['sq_ft', 'sqft', 'square_feet', 'sq_feet', 'living_area', 'area',
            'building_area', 'heated_area'],
  beds:    ['beds', 'bedrooms', 'bd', 'br', 'bed'],
  baths:   ['baths', 'bathrooms', 'ba', 'bath'],
  mls:     ['mls', 'mls_number', 'listing_number', 'listing_id'],
  status:  ['status', 'lead_status', 'stage', 'disposition'],
  notes:   ['notes', 'note', 'comments', 'comment', 'memo', 'description'],
  distress:['distress', 'distress_score', 'score', 'priority'],
};

function normalize(str) {
  return String(str ?? '')
    .toLowerCase()
    .replace(/[\s\-_./$()+]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function matchField(header, aliases) {
  const n = normalize(header);
  return aliases.some((a) => {
    const an = normalize(a);
    return an === n || n === an || n.startsWith(an) || an.startsWith(n);
  });
}

function mapHeaders(headers) {
  const mapping = {};
  for (const header of headers) {
    if (header == null || String(header).trim() === '') continue;
    for (const [canonical, aliases] of Object.entries(FIELD_ALIASES)) {
      if (!mapping[canonical] && matchField(header, aliases)) {
        mapping[canonical] = header;
        break;
      }
    }
    if (!Object.values(mapping).includes(header)) {
      mapping[`_raw_${header}`] = header;
    }
  }
  return mapping;
}

// ─── Address extraction from free-text ────────────────────────────────────────

const PO_BOX_RE = /\bP\.?\s*O\.?\s*Box\b/i;

export function extractAddressFromText(text) {
  if (!text) return null;
  const str = String(text).trim();
  if (str.length < 6) return null;
  if (PO_BOX_RE.test(str)) return null;

  const match = str.match(/\b(\d{1,5})\s+([A-Za-z])/);
  if (!match) return null;

  const num = parseInt(match[1], 10);
  if (num >= 1800 && num <= 2100 && str.length < 20) return null;

  const fromStreet = str.slice(match.index).trim();
  if (fromStreet.length < 8) return null;
  return fromStreet;
}

// ─── Build geocode address from a row ────────────────────────────────────────

function buildAddressForRow(row, lead) {
  // When State is missing, default to Oregon (this app targets OR properties)
  const stateDefault = 'Oregon';
  const state = (lead.state && lead.state.trim()) || stateDefault;

  // Strategy 1: dedicated address columns
  const colParts = [lead.address, lead.city, state, lead.zip].filter(Boolean);
  if (colParts.length >= 2) {
    const addr = colParts.join(', ');
    console.log('[buildAddress] columns:', addr);
    return { address: addr, source: 'columns' };
  }

  if (lead.address?.trim().length > 5) {
    const addr = [lead.address.trim(), stateDefault].join(', ');
    console.log('[buildAddress] address-only column:', addr);
    return { address: addr, source: 'address-column' };
  }

  // Strategy 2: scan each cell for embedded street address
  const cellValues = Object.values(row).map((v) => String(v ?? '').trim()).filter(Boolean);

  for (const val of cellValues) {
    const extracted = extractAddressFromText(val);
    if (extracted) {
      const hasLocation = /\b[A-Z]{2}\b/.test(extracted) || /\d{5}/.test(extracted);
      let final = extracted;
      if (!hasLocation) {
        const extra = cellValues.find((v) => v !== val && (/\b[A-Z]{2}\s+\d{5}\b/.test(v) || /\b\d{5}\b/.test(v)));
        final = extra ? `${extracted}, ${extra}` : `${extracted}, ${stateDefault}`;
      }
      console.log('[buildAddress] cell-scan:', final);
      return { address: final, source: 'cell-scan' };
    }
  }

  // Strategy 3: full-row concat
  const concat = cellValues.join(' ');
  const fromConcat = extractAddressFromText(concat);
  if (fromConcat) {
    const final = /\b[A-Z]{2}\b/.test(fromConcat) || /\d{5}/.test(fromConcat)
      ? fromConcat
      : `${fromConcat}, ${stateDefault}`;
    console.log('[buildAddress] concat:', final);
    return { address: final, source: 'concat' };
  }

  return null;
}

// ─── Phone number helpers ─────────────────────────────────────────────────────

// Column patterns that represent phone numbers (checked against every header)
const PHONE_COL_RE = /^(wireless|landline|cell|mobile|phone|telephone)\s*\d*$/i;

function cleanPhone(val) {
  if (!val) return '';
  const s = String(val).replace(/[^\d+\-().x ]/g, '').trim();
  // Must have at least 7 digits to be a real number
  return s.replace(/\D/g, '').length >= 7 ? s : '';
}

function collectAllPhones(row, headers) {
  // Returns array of { label, number } for every non-empty phone column
  const phones = [];
  for (const header of headers) {
    if (!PHONE_COL_RE.test(String(header).trim())) continue;
    const val = cleanPhone(row[header]);
    if (val) {
      // Pretty label: "Wireless 1", "Landline 2", etc.
      const label = String(header).trim().replace(/\b\w/g, c => c.toUpperCase());
      phones.push({ label, number: val });
    }
  }
  return phones;
}

// ─── Row → lead object ────────────────────────────────────────────────────────

function rowToLead(row, idx, headers, fieldMap) {
  const lead = {
    id:        idx,
    _raw:      row,
    _headers:  headers,
    notes:     '',
    status:    'New',
    geocoded:  null,
    callCount: 0,
  };

  for (const [canonical, originalHeader] of Object.entries(fieldMap)) {
    if (!canonical.startsWith('_raw_')) {
      const val = row[originalHeader];

      if ((canonical === 'price' || canonical === 'equity') && typeof val === 'number') {
        // Format currency as $123,456
        lead[canonical] = `$${Math.round(val).toLocaleString()}`;
      } else if (canonical === 'zip') {
        // Strip commas from ZIP codes: "97,402" → "97402"
        lead[canonical] = val != null ? String(val).replace(/,/g, '').trim() : '';
      } else {
        lead[canonical] = val != null ? String(val).trim() : '';
      }
    }
  }

  // ── Collect ALL phone numbers (wireless 1-3, landline 1-3, etc.) ──────────
  const allPhones = collectAllPhones(row, headers);

  if (allPhones.length > 0) {
    // Primary phone = first one found (for dialer / tel: links)
    if (!lead.phone || !cleanPhone(lead.phone)) {
      lead.phone = allPhones[0].number;
    }
    // Store the full list for the sidebar and dialer multi-number display
    lead.phones = allPhones;
  }

  const result = buildAddressForRow(row, lead);
  lead._addressForGeocode = result?.address ?? '';
  lead._addressSource     = result?.source  ?? 'none';

  if (!lead._addressForGeocode) {
    console.warn(`[parseFile] Row ${idx}: no address.`, Object.values(row).map(v => String(v).slice(0, 30)));
  }

  return lead;
}

// ─── XLSX parser ─────────────────────────────────────────────────────────────

function parseXLSX(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Convert to array of objects (header row = keys)
        const rows = XLSX.utils.sheet_to_json(sheet, {
          defval: '',       // empty cells → ''
          raw:    false,    // parse numbers as strings where needed
          rawNumbers: true, // keep numbers as numbers for currency
        });

        if (!rows.length) return reject(new Error('Spreadsheet appears to be empty.'));

        const headers = Object.keys(rows[0]);
        const fieldMap = mapHeaders(headers);

        console.log('[parseXLSX] Rows:', rows.length, '| Headers:', headers);
        console.log('[parseXLSX] Field mapping:', JSON.stringify(fieldMap));

        const leads = rows.map((row, idx) => rowToLead(row, idx, headers, fieldMap));
        const found = leads.filter((l) => l._addressForGeocode).length;
        console.log(`[parseXLSX] Done — ${found}/${leads.length} addresses extracted`);

        resolve({ leads, fieldMap, headers });
      } catch (err) {
        reject(new Error(`Failed to parse spreadsheet: ${err.message}`));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsArrayBuffer(file);
  });
}

// ─── CSV parser ───────────────────────────────────────────────────────────────

function parseCSVFile(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header:        true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
      transform:     (v) => (typeof v === 'string' ? v.trim() : v),
      complete: ({ data, meta, errors }) => {
        if (!data.length && errors.length) return reject(new Error(errors[0].message));

        const headers  = meta.fields ?? [];
        const fieldMap = mapHeaders(headers);

        console.log('[parseCSV] Rows:', data.length, '| Headers:', headers);
        console.log('[parseCSV] Field mapping:', JSON.stringify(fieldMap));

        const leads = data.map((row, idx) => rowToLead(row, idx, headers, fieldMap));
        const found = leads.filter((l) => l._addressForGeocode).length;
        console.log(`[parseCSV] Done — ${found}/${leads.length} addresses extracted`);

        resolve({ leads, fieldMap, headers });
      },
      error: (err) => { console.error('[parseCSV]', err); reject(err); },
    });
  });
}

// ─── Unified entry point ──────────────────────────────────────────────────────

export function parseCSV(file) {
  const name = file.name.toLowerCase();
  if (name.endsWith('.xlsx') || name.endsWith('.xls') || name.endsWith('.xlsm')) {
    return parseXLSX(file);
  }
  return parseCSVFile(file);
}
