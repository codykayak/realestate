import Papa from 'papaparse';

// Canonical field names we look for (case-insensitive, flexible)
const FIELD_ALIASES = {
  address:   ['address', 'addr', 'street', 'street_address', 'property_address', 'situs'],
  city:      ['city', 'town', 'municipality'],
  state:     ['state', 'st', 'province'],
  zip:       ['zip', 'zipcode', 'zip_code', 'postal', 'postal_code'],
  name:      ['name', 'owner', 'owner_name', 'contact', 'seller', 'full_name', 'firstname', 'first_name', 'lastname', 'last_name'],
  phone:     ['phone', 'phone_number', 'cell', 'mobile', 'telephone', 'tel'],
  email:     ['email', 'email_address', 'e_mail'],
  price:     ['price', 'asking_price', 'list_price', 'arv', 'value', 'assessed_value'],
  equity:    ['equity', 'est_equity', 'estimated_equity'],
  mls:       ['mls', 'mls_number', 'listing_number'],
  status:    ['status', 'lead_status', 'stage'],
  notes:     ['notes', 'note', 'comments', 'comment', 'memo'],
};

function normalize(str) {
  return str.toLowerCase().replace(/[\s\-_.]+/g, '_').trim();
}

function matchField(header, aliases) {
  const n = normalize(header);
  return aliases.some((alias) => normalize(alias) === n || n.includes(normalize(alias)));
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
    // Always preserve every original header too
    if (!Object.values(mapping).includes(header)) {
      mapping[`_raw_${header}`] = header;
    }
  }
  return mapping;
}

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

          // Build a full address string for geocoding
          const addrParts = [
            lead.address,
            lead.city,
            lead.state,
            lead.zip,
          ].filter(Boolean).join(', ');

          lead._addressForGeocode = addrParts || '';
          return lead;
        });

        resolve({ leads, fieldMap, headers });
      },
      error: reject,
    });
  });
}
