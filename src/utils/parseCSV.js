import Papa from 'papaparse';

// ─── Canonical field aliases ──────────────────────────────────────────────────

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
  phone:   ['phone', 'phone_number', 'cell', 'mobile', 'telephone', 'tel', 'phone1'],
  email:   ['email', 'email_address', 'e_mail', 'email1'],
  price:   ['price', 'asking_price', 'list_price', 'arv', 'value', 'assessed_value',
            'market_value', 'est_value', 'appraised'],
  equity:  ['equity', 'est_equity', 'estimated_equity', 'equity_estimate'],
  mls:     ['mls', 'mls_number', 'listing_number', 'listing_id'],
  status:  ['status', 'lead_status', 'stage', 'disposition'],
  notes:   ['notes', 'note', 'comments', 'comment', 'memo', 'description'],
};

function normalize(str) {
  return str.toLowerCase().replace(/[\s\-_./()+]+/g, '_').replace(/^_+|_+$/g, '');
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

// ─── Address extraction ───────────────────────────────────────────────────────

// PO Box patterns — we skip these (not mappable property addresses)
const PO_BOX_RE = /\bP\.?\s*O\.?\s*Box\b/i;

/**
 * Core strategy: find where a US street number begins (1–5 digits followed
 * by a letter), then return everything from that point.
 * This handles blobs like "John Smith 123 Oak St Eugene OR 97401" perfectly —
 * Nominatim is excellent at parsing addresses that have trailing extra info.
 */
export function extractAddressFromText(text) {
  if (!text) return null;
  const str = String(text).trim();
  if (str.length < 6) return null;

  // Skip mailing/PO Box addresses
  if (PO_BOX_RE.test(str)) return null;

  // Find first occurrence of: 1-5 digit house number at a word boundary
  // followed by a space and a letter (the start of a street name)
  const match = str.match(/\b(\d{1,5})\s+([A-Za-z])/);
  if (!match) return null;

  // Sanity: skip pure year references (1995 Ford, 2020 etc with no street name context)
  const num = parseInt(match[1], 10);
  if (num > 99999 || (num >= 1800 && num <= 2100 && str.length < 20)) return null;

  // Return from the house number to end of string — let Nominatim handle parsing
  const fromStreet = str.slice(match.index).trim();

  // Must have at least a number + word, not just "123 A"
  if (fromStreet.length < 8) return null;

  console.log('[extractAddress] Found:', JSON.stringify(fromStreet), 'in', JSON.stringify(str.slice(0, 60)));
  return fromStreet;
}

/**
 * Given all cell values in a row, try to build the best geocodable address.
 * Returns { address, source } or null.
 */
function buildAddressForRow(row, lead) {
  // ── Strategy 1: dedicated columns ────────────────────────────────────────
  const colParts = [lead.address, lead.city, lead.state, lead.zip].filter(Boolean);
  if (colParts.length >= 2) {
    const addr = colParts.join(', ');
    console.log('[buildAddress] Strategy 1 (columns):', addr);
    return { address: addr, source: 'columns' };
  }

  // If we have an address column but no city/state, still try it
  if (lead.address && lead.address.trim().length > 5) {
    console.log('[buildAddress] Strategy 1b (address-only column):', lead.address);
    return { address: lead.address.trim(), source: 'address-column' };
  }

  // ── Strategy 2: scan each cell value for embedded street address ──────────
  const cellValues = Object.values(row).map((v) => String(v ?? '').trim()).filter(Boolean);

  // Try each cell individually first
  for (const val of cellValues) {
    const extracted = extractAddressFromText(val);
    if (extracted) {
      // If the cell also has city/state/zip context after the address, great.
      // Otherwise try to supplement from other cells.
      const hasLocation = /\b[A-Z]{2}\b/.test(extracted) || /\d{5}/.test(extracted);
      let final = extracted;
      if (!hasLocation) {
        // Look for city/state/zip in other cells
        const extra = cellValues
          .filter((v) => v !== val)
          .find((v) => /\b[A-Z]{2}\s+\d{5}\b/.test(v) || /\b\d{5}\b/.test(v));
        if (extra) final = extracted + ', ' + extra;
      }
      console.log('[buildAddress] Strategy 2 (cell scan):', final);
      return { address: final, source: 'cell-scan' };
    }
  }

  // ── Strategy 3: concat all cells and scan ────────────────────────────────
  const concat = cellValues.join(' ');
  const fromConcat = extractAddressFromText(concat);
  if (fromConcat) {
    console.log('[buildAddress] Strategy 3 (row concat):', fromConcat);
    return { address: fromConcat, source: 'concat' };
  }

  // ── Strategy 4: if any single cell looks like a full address blob,
  //    send the whole thing to Nominatim (it's surprisingly good) ───────────
  for (const val of cellValues) {
    if (val.length > 15 && /\d/.test(val) && /[A-Za-z]/.test(val)) {
      // Has both digits and letters — worth trying
      console.log('[buildAddress] Strategy 4 (full-cell fallback):', val.slice(0, 80));
      return { address: val, source: 'full-cell' };
    }
  }

  return null;
}

// ─── Main CSV parser ──────────────────────────────────────────────────────────

export function parseCSV(file) {
  return new Promise((resolve, reject) => {
    // Try with headers first
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
      transform: (v) => (typeof v === 'string' ? v.trim() : v),
      complete: ({ data, meta, errors }) => {
        if (!data.length && errors.length) {
          return reject(new Error(errors[0].message));
        }

        const headers = meta.fields ?? [];
        const fieldMap = mapHeaders(headers);

        console.log('[parseCSV] Rows:', data.length, '| Headers:', headers);
        console.log('[parseCSV] Field mapping:', JSON.stringify(fieldMap));

        const leads = data.map((row, idx) => {
          const lead = {
            id: idx,
            _raw: row,
            _headers: headers,
            notes: '',
            status: 'New',
            geocoded: null,
          };

          // Populate canonical fields from matched headers
          for (const [canonical, originalHeader] of Object.entries(fieldMap)) {
            if (!canonical.startsWith('_raw_')) {
              lead[canonical] = row[originalHeader] ?? '';
            }
          }

          const result = buildAddressForRow(row, lead);
          lead._addressForGeocode = result?.address ?? '';
          lead._addressSource = result?.source ?? 'none';

          if (!lead._addressForGeocode) {
            console.warn(`[parseCSV] Row ${idx}: no address found. Values:`,
              Object.values(row).map((v) => String(v).slice(0, 40)));
          }

          return lead;
        });

        const found = leads.filter((l) => l._addressForGeocode).length;
        console.log(`[parseCSV] Done — ${found}/${leads.length} addresses extracted`);

        resolve({ leads, fieldMap, headers });
      },
      error: (err) => {
        console.error('[parseCSV] Error:', err);
        reject(err);
      },
    });
  });
}
