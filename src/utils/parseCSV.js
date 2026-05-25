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
  // 'phone' maps the first phone column found; collectAllPhones gathers the rest.
  phone:   ['phone', 'phone_number', 'cell', 'mobile', 'telephone', 'tel',
            'phone1', 'phone_1', 'primary_phone', 'contact_phone',
            'wireless_1', 'wireless1', 'wireless 1', 'wireless1',
            'landline_1', 'landline1', 'landline 1',
            'best_phone', 'owner_phone', 'alt_phone'],
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

/**
 * Does this column header name suggest it contains phone numbers?
 * Very permissive — catches all real-world skip-trace export formats:
 * "Phone 1", "Phone Number 2", "Cell Phone 1", "Primary Phone",
 * "wireless_1", "wireless_2", "Landline 1", "Owner Phone", "Best Phone", etc.
 */
function isPhoneColumn(header) {
  // Strip all non-alpha chars and lowercase for flexible comparison
  const h = String(header).toLowerCase().replace(/[^a-z]/g, '');
  return (
    h.includes('phone')    ||
    h.includes('wireless') ||
    h.includes('landline') ||
    h.includes('mobile')   ||
    h.startsWith('cell')   ||   // cell, cellphone, cell1
    h === 'tel'            ||
    h.startsWith('telephone')
  );
}

/**
 * Does this value look like a US phone number (10 or 11 digits)?
 * Used as a data-based fallback to catch phone columns with unexpected names.
 */
function looksLikePhone(val) {
  if (!val) return false;
  const s = String(val).trim();
  if (!s || s === '0') return false;
  // Must contain only digits + common phone separators
  if (/[^0-9\s\-\.\(\)\+x\/]/.test(s)) return false;
  const digits = s.replace(/\D/g, '');
  return (digits.length === 10) || (digits.length === 11 && digits[0] === '1');
}

function cleanPhone(val) {
  if (!val) return '';
  const s = String(val).replace(/[^\d+\-().x ]/g, '').trim();
  return s.replace(/\D/g, '').length >= 7 ? s : '';
}

function collectAllPhones(row, headers) {
  const phones = [];
  const seen = new Set();

  for (const header of headers) {
    const rawVal = row[header];
    const strVal = String(rawVal ?? '').trim();
    if (!strVal || strVal === '0') continue;

    // Phase 1: column name suggests it's a phone
    // Phase 2: column name doesn't look like phone, but VALUE is a 10-digit number
    const nameMatch = isPhoneColumn(header);
    const dataMatch = !nameMatch && looksLikePhone(strVal);

    if (!nameMatch && !dataMatch) continue;

    const cleaned = cleanPhone(strVal);
    if (!cleaned || seen.has(cleaned)) continue;

    seen.add(cleaned);
    const label = String(header).trim().replace(/\b\w/g, c => c.toUpperCase());
    phones.push({ label, number: cleaned });
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
      if (val == null || val === '') { lead[canonical] = ''; continue; }

      if ((canonical === 'price' || canonical === 'equity')) {
        // Accept numeric or string dollar values, format as $123,456
        const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/[$,]/g, ''));
        lead[canonical] = !isNaN(num) ? `$${Math.round(num).toLocaleString()}` : String(val).trim();
      } else if (canonical === 'zip') {
        // Strip commas: "97,402" → "97402"
        lead[canonical] = String(val).replace(/,/g, '').trim();
      } else if (canonical === 'sqft' || canonical === 'beds' || canonical === 'baths' || canonical === 'distress') {
        // Keep numeric fields readable (strip trailing .0)
        const num = parseFloat(val);
        lead[canonical] = !isNaN(num) ? (Number.isInteger(num) ? String(num) : num.toFixed(1)) : String(val).trim();
      } else {
        lead[canonical] = String(val).trim();
      }
    }
  }

  // ── Collect ALL phone numbers (wireless 1-3, landline 1-3, etc.) ──────────
  const allPhones = collectAllPhones(row, headers);

  if (allPhones.length > 0) {
    // Always ensure lead.phone is set to the first valid number
    const firstValid = allPhones[0].number;
    if (!lead.phone || !cleanPhone(lead.phone)) {
      lead.phone = firstValid;
    }
    lead.phones = allPhones;
    console.log(`[parseFile] Row ${idx}: found ${allPhones.length} phone(s):`, allPhones.map(p => `${p.label}=${p.number}`).join(', '));
  } else {
    console.warn(`[parseFile] Row ${idx}: no phones detected. Headers scanned:`, headers.join(', '));
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
// Reads as array-of-arrays so NO columns or rows are dropped due to blank cells.

function parseXLSX(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);

        // cellDates:false keeps dates as serial numbers so we don't choke
        const workbook = XLSX.read(data, { type: 'array', cellDates: false });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // ── Read as array-of-arrays (header:1) ──────────────────────────────
        // This is the most reliable mode — never drops columns due to blank
        // headers, never skips rows that have some blank cells.
        const aoa = XLSX.utils.sheet_to_json(sheet, {
          header:    1,     // return [ [row1values...], [row2values...], ... ]
          defval:    '',    // fill blank cells with '' instead of undefined
          blankrows: false, // skip rows that are entirely empty
          raw:       true,  // keep numbers as numbers (for currency columns)
        });

        if (!aoa.length) return reject(new Error('Spreadsheet appears to be empty.'));

        // Row 0 is the header row
        const rawHeaders = aoa[0].map((h) => (h != null ? String(h).trim() : ''));

        // Find the last column that has a non-empty header
        let lastCol = rawHeaders.length - 1;
        while (lastCol >= 0 && !rawHeaders[lastCol]) lastCol--;
        // But keep ALL columns, even blank-header ones, so data aligns
        // (blank headers get a placeholder name like __Col_5__)
        const headers = rawHeaders.map((h, i) => h || `__Col_${i + 1}__`);

        const dataAoa = aoa.slice(1); // everything after header row

        // Convert each row-array → object keyed by header
        const rowObjects = dataAoa.map((rowArr) => {
          const obj = {};
          for (let i = 0; i < headers.length; i++) {
            const v = rowArr[i];
            obj[headers[i]] = v != null ? v : '';
          }
          return obj;
        });

        // Filter out rows where every value is blank (safety net)
        const nonEmptyRows = rowObjects.filter((row) =>
          Object.values(row).some((v) => v !== '' && v != null),
        );

        if (!nonEmptyRows.length) return reject(new Error('No data rows found.'));

        // Only pass named headers (not placeholder ones) to field mapping
        const namedHeaders = headers.filter((h) => !h.startsWith('__Col_'));
        const fieldMap = mapHeaders(namedHeaders);

        console.log('[parseXLSX] Rows:', nonEmptyRows.length, '| All headers:', headers);
        console.log('[parseXLSX] Named headers:', namedHeaders);
        console.log('[parseXLSX] Field mapping:', JSON.stringify(fieldMap));

        const leads = nonEmptyRows.map((row, idx) =>
          rowToLead(row, idx, headers, fieldMap),
        );
        const found = leads.filter((l) => l._addressForGeocode).length;
        console.log(`[parseXLSX] Done — ${found}/${leads.length} addresses extracted`);

        resolve({ leads, fieldMap, headers: namedHeaders });
      } catch (err) {
        reject(new Error(`Failed to parse spreadsheet: ${err.message}`));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsArrayBuffer(file);
  });
}

// ─── CSV parser ───────────────────────────────────────────────────────────────

/**
 * Some exporters (Propradar, etc.) wrap every row in extra double quotes,
 * producing a single-column CSV where each "value" is the entire row:
 *   "Address,City,SqFt,..."
 *   "1755 W 15TH AVE,EUGENE,1380,..."
 *
 * Detect and unwrap this pattern before parsing normally.
 */
function unwrapSingleColumnCSV(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  // Check: every non-empty line starts and ends with a double quote
  const allWrapped = lines.every((l) => l.startsWith('"') && l.endsWith('"'));
  if (!allWrapped) return text; // normal CSV, no change

  console.log('[parseCSV] Detected single-column wrapped CSV — unwrapping...');

  // Strip outer quotes from each line and unescape internal "" → "
  const unwrapped = lines.map((l) => {
    const inner = l.slice(1, -1);          // strip outer " ... "
    return inner.replace(/""/g, '"');       // "" → " inside the row
  });

  return unwrapped.join('\n');
}

function parseCSVFile(file) {
  return new Promise((resolve, reject) => {
    // Read as text first so we can pre-process if needed
    const reader = new FileReader();
    reader.onload = (e) => {
      let text = e.target.result;

      // Fix single-column wrapped CSVs
      text = unwrapSingleColumnCSV(text);

      Papa.parse(text, {
        header:          true,
        skipEmptyLines:  'greedy',  // skip rows where ALL cells are blank
        transformHeader: (h) => (h ? h.trim() : h),
        transform:       (v) => (typeof v === 'string' ? v.trim() : v),
        complete: ({ data, meta, errors }) => {
          if (!data.length && errors.length) return reject(new Error(errors[0].message));

          const headers  = (meta.fields ?? []).filter(Boolean);
          const fieldMap = mapHeaders(headers);

          console.log('[parseCSV] Rows:', data.length, '| Headers:', headers);
          console.log('[parseCSV] Field mapping:', JSON.stringify(fieldMap));

          // Filter out rows that are entirely blank
          const nonEmpty = data.filter((row) =>
            Object.values(row).some((v) => v !== '' && v != null),
          );

          const leads = nonEmpty.map((row, idx) => rowToLead(row, idx, headers, fieldMap));
          const found = leads.filter((l) => l._addressForGeocode).length;
          console.log(`[parseCSV] Done — ${found}/${leads.length} addresses extracted`);

          resolve({ leads, fieldMap, headers });
        },
        error: (err) => { console.error('[parseCSV]', err); reject(err); },
      });
    };
    reader.onerror = () => reject(new Error('Failed to read CSV file.'));
    reader.readAsText(file, 'utf-8');
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
