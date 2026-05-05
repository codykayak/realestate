import Papa from 'papaparse';

// ─── Field alias matching ─────────────────────────────────────────────────────

const FIELD_ALIASES = {
  address: ['address', 'addr', 'street', 'street_address', 'property_address',
            'situs', 'prop_address', 'site_address', 'mailing_address'],
  city:    ['city', 'town', 'municipality', 'situs_city', 'prop_city'],
  state:   ['state', 'st', 'province', 'situs_state', 'prop_state'],
  zip:     ['zip', 'zipcode', 'zip_code', 'postal', 'postal_code', 'situs_zip'],
  name:    ['name', 'owner', 'owner_name', 'contact', 'seller', 'full_name',
            'firstname', 'first_name', 'lastname', 'last_name', 'owner1'],
  phone:   ['phone', 'phone_number', 'cell', 'mobile', 'telephone', 'tel'],
  email:   ['email', 'email_address', 'e_mail'],
  price:   ['price', 'asking_price', 'list_price', 'arv', 'value', 'assessed_value'],
  equity:  ['equity', 'est_equity', 'estimated_equity'],
  mls:     ['mls', 'mls_number', 'listing_number'],
  status:  ['status', 'lead_status', 'stage'],
  notes:   ['notes', 'note', 'comments', 'comment', 'memo'],
};

function normalize(str) {
  return str.toLowerCase().replace(/[\s\-_.]+/g, '_').trim();
}

function matchField(header, aliases) {
  const n = normalize(header);
  return aliases.some((a) => normalize(a) === n || n.includes(normalize(a)));
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

// ─── Address extraction from arbitrary text ──────────────────────────────────

// US street number + street name pattern.
// Handles: "123 Main St", "4567 NE Oak Avenue", "1 W 34th St", "P.O. Box 42"
const STREET_TYPES =
  'St(?:reet)?|Ave(?:nue)?|Blvd|Rd|Road|Dr(?:ive)?|Ln|Lane|Ct|Court|Pl(?:ace)?|' +
  'Way|Ter(?:race)?|Cir(?:cle)?|Hwy|Highway|Pkwy|Pkway|Parkway|Trl|Trail|' +
  'Run|Loop|Pass|Bend|Ridge|Glen|Park|Pike|Row|Walk|Path';

// Matches: house number + optional directional + street name + street type
//          optionally followed by unit/apt + city, state + zip
const ADDRESS_RE = new RegExp(
  '(?:^|[\\s,;|])' +
  '(\\d{1,5}\\s+' +                          // house number
  '(?:[NSEW](?:orth|outh|ast|est)?\\s+)?' +  // optional directional
  '[A-Za-z0-9][A-Za-z0-9 .\'\\-]{1,40}\\s+' + // street name
  '(?:' + STREET_TYPES + ')' +               // street type (required)
  '(?:[.,]?\\s*(?:Apt|Unit|Suite|#|Ste)[\\.\\s]?[A-Za-z0-9\\-]+)?' + // optional unit
  '(?:[,\\s]+[A-Za-z ]{2,25})?'  +          // optional city
  '(?:[,\\s]+[A-Z]{2})?' +                   // optional state abbreviation
  '(?:[,\\s]+\\d{5}(?:-\\d{4})?)?)',         // optional zip
  'i',
);

// Fallback: just look for a zip code neighborhood (city, ST 99999)
const CITY_STATE_ZIP_RE = /([A-Za-z ]{2,25}),?\s+([A-Z]{2})\s+(\d{5}(?:-\d{4})?)/;

/**
 * Given a freeform string (e.g. "John Smith, 123 Main St, Eugene OR 97401"),
 * tries to extract a geocodable address.
 * Returns a clean address string or null.
 */
export function extractAddressFromText(text) {
  if (!text) return null;
  const str = String(text).trim();

  // Try the full street-address pattern first
  const m = str.match(ADDRESS_RE);
  if (m) {
    // Also grab trailing city/state/zip if not already captured
    const addrChunk = m[1].trim();
    // Check if we captured city+state+zip already
    if (CITY_STATE_ZIP_RE.test(addrChunk)) return addrChunk;

    // Try to find city/state/zip right after the matched address
    const afterMatch = str.slice(str.indexOf(m[1]) + m[1].length);
    const cityStateZip = afterMatch.match(/^[,\s]*([A-Za-z ]{2,25}[,\s]+[A-Z]{2}[,\s]+\d{5}(?:-\d{4})?)/);
    if (cityStateZip) return (addrChunk + ', ' + cityStateZip[1].trim()).replace(/\s+/g, ' ');
    return addrChunk;
  }

  // Looser fallback: if a zip code is present, grab the 60 chars before it
  const zipMatch = str.match(/(.{0,60})\b(\d{5}(?:-\d{4})?)\b/);
  if (zipMatch) {
    const candidate = (zipMatch[1] + zipMatch[2]).replace(/^[\s,;|]+/, '').trim();
    if (candidate.length > 8) return candidate;
  }

  return null;
}

// ─── Main CSV parser ──────────────────────────────────────────────────────────

export function parseCSV(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: ({ data, meta, errors }) => {
        if (errors.length && !data.length) {
          return reject(new Error(errors[0].message));
        }

        const headers = meta.fields ?? [];
        const fieldMap = mapHeaders(headers);

        console.log('[parseCSV] Headers detected:', headers);
        console.log('[parseCSV] Field mapping:', fieldMap);

        const leads = data.map((row, idx) => {
          const lead = {
            id: idx,
            _raw: row,
            _headers: headers,
            notes: '',
            status: 'New',
            geocoded: null,
          };

          // Populate canonical fields
          for (const [canonical, originalHeader] of Object.entries(fieldMap)) {
            if (!canonical.startsWith('_raw_')) {
              lead[canonical] = row[originalHeader] ?? '';
            }
          }

          // ── Strategy 1: build from dedicated address columns ──────────────
          const fromColumns = [lead.address, lead.city, lead.state, lead.zip]
            .filter(Boolean)
            .join(', ')
            .trim();

          // ── Strategy 2: scan every cell value for an embedded address ──────
          let fromScan = null;
          if (!fromColumns) {
            for (const val of Object.values(row)) {
              const extracted = extractAddressFromText(String(val ?? ''));
              if (extracted) {
                fromScan = extracted;
                console.log(`[parseCSV] Row ${idx}: extracted address from cell "${val}" → "${extracted}"`);
                break;
              }
            }
          }

          // ── Strategy 3: whole-row concat for single-column CSVs ────────────
          // If a row has only one meaningful column (or the header itself looks
          // like an address blob), concatenate all cell values and scan that.
          let fromConcat = null;
          if (!fromColumns && !fromScan) {
            const allValues = Object.values(row).map((v) => String(v ?? '').trim()).filter(Boolean);
            const concat = allValues.join(' ');
            fromConcat = extractAddressFromText(concat);
            if (fromConcat) {
              console.log(`[parseCSV] Row ${idx}: extracted address from full-row concat → "${fromConcat}"`);
            }
          }

          const addressForGeocode = fromColumns || fromScan || fromConcat || '';

          if (!addressForGeocode) {
            console.warn(`[parseCSV] Row ${idx}: could not find any address. Raw:`, row);
          }

          lead._addressForGeocode = addressForGeocode;
          return lead;
        });

        console.log(`[parseCSV] Parsed ${leads.length} leads. Addresses found: ${leads.filter(l => l._addressForGeocode).length}`);
        resolve({ leads, fieldMap, headers });
      },
      error: (err) => {
        console.error('[parseCSV] PapaParse error:', err);
        reject(err);
      },
    });
  });
}
