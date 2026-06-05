// Nominatim geocoder — rate-limited (1 req/sec per OSM policy)

const NOMINATIM    = 'https://nominatim.openstreetmap.org/search';
const DELAY_MS     = 1100;
const USER_AGENT   = 'MotivatedSellerMap/1.0 (Macro Real Estate Investing lead tool)';

// Bounding box for western Oregon + surrounding area.
// Biases Nominatim results toward this region without hard-excluding other states.
// Format: west,south,east,north (WGS84)
const OR_VIEWBOX   = '-124.6,41.8,-116.5,46.3';

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

export async function geocodeAddress(address) {
  if (!address || address.trim().length < 5) {
    console.warn('[geocode] Skipping — too short:', JSON.stringify(address));
    return null;
  }

  const params = new URLSearchParams({
    q:            address,
    format:       'json',
    limit:        '1',
    countrycodes: 'us',
    viewbox:      OR_VIEWBOX, // bias toward Oregon
    bounded:      '0',        // 0 = fall back outside viewbox if nothing found inside
    addressdetails: '0',
  });

  const url = `${NOMINATIM}?${params}`;
  console.log('[geocode] →', url);

  try {
    const res = await fetch(url, {
      headers: {
        'Accept-Language': 'en',
        'User-Agent':      USER_AGENT,
      },
    });

    console.log('[geocode] Status:', res.status, 'for:', address);

    if (!res.ok) {
      console.warn('[geocode] Non-OK response:', res.status, 'for:', address);
      return null;
    }

    const data = await res.json();
    console.log('[geocode] Results:', data.length, 'hit(s) for:', JSON.stringify(address));

    if (!data.length) {
      // Retry: strip unit/SPC suffix and try again (e.g. "123 MAIN ST SPC 84, EUGENE, Oregon")
      const stripped = address.replace(/\s*(SPC|APT|UNIT|#|LOT)\s*\S+/gi, '').trim();
      if (stripped !== address) {
        console.log('[geocode] Retrying without unit suffix:', stripped);
        return geocodeAddress(stripped);
      }
      return null;
    }

    const result = {
      lat:         parseFloat(data[0].lat),
      lng:         parseFloat(data[0].lon),
      displayName: data[0].display_name,
    };
    console.log('[geocode] ✓', address, '→', result.lat, result.lng);
    return result;

  } catch (err) {
    console.error('[geocode] Error for:', address, err);
    return null;
  }
}

export async function geocodeLeads(leads, onProgress, signal, onUpdate) {
  const results  = [...leads];
  let done       = 0;
  let successes  = 0;

  console.log(`[geocode] Starting batch of ${leads.length} leads`);

  for (let i = 0; i < leads.length; i++) {
    if (signal?.aborted) {
      console.log('[geocode] Aborted after', done, 'leads');
      break;
    }

    const lead = leads[i];
    const addr = lead._addressForGeocode;

    if (addr) {
      const geo = await geocodeAddress(addr);
      results[i] = { ...lead, geocoded: geo };
      if (geo) successes++;
    } else {
      console.warn(`[geocode] Lead ${i} (id=${lead.id}): no _addressForGeocode. Raw:`,
        Object.values(lead._raw ?? {}).map(v => String(v).slice(0, 40)));
      results[i] = { ...lead, geocoded: null };
    }

    done++;
    onProgress?.(done, leads.length, successes);
    onUpdate?.([...results]);

    if (i < leads.length - 1) await sleep(DELAY_MS);
  }

  console.log(`[geocode] Done — ${successes}/${done} succeeded`);
  return results;
}
