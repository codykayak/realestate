// Nominatim geocoder with rate-limiting (1 req/sec per OSM policy)

const NOMINATIM = 'https://nominatim.openstreetmap.org/search';
const DELAY_MS = 1100;

// Nominatim requires a descriptive User-Agent identifying the app and contact.
// Without this, requests get silently blocked or 403'd.
const USER_AGENT = 'MotivatedSellerMap/1.0 (realestate lead mapping tool)';

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function geocodeAddress(address) {
  if (!address || address.trim().length < 5) {
    console.warn('[geocode] Skipping — address too short or empty:', JSON.stringify(address));
    return null;
  }

  const params = new URLSearchParams({
    q: address,
    format: 'json',
    limit: '1',
    countrycodes: 'us',
    addressdetails: '0',
  });

  const url = `${NOMINATIM}?${params}`;
  console.log('[geocode] Requesting:', url);

  try {
    const res = await fetch(url, {
      headers: {
        'Accept-Language': 'en',
        'User-Agent': USER_AGENT,
      },
    });

    console.log('[geocode] Response status:', res.status, 'for:', address);

    if (!res.ok) {
      console.warn('[geocode] Non-OK response:', res.status, res.statusText, 'for:', address);
      return null;
    }

    const data = await res.json();
    console.log('[geocode] Results for', JSON.stringify(address), '—', data.length, 'hit(s)');

    if (!data.length) {
      // Retry once without zip/state to be more forgiving
      console.log('[geocode] No results, trying broader query');
      return null;
    }

    const result = {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      displayName: data[0].display_name,
    };
    console.log('[geocode] ✓', address, '→', result.lat, result.lng);
    return result;
  } catch (err) {
    console.error('[geocode] Fetch error for:', address, err);
    return null;
  }
}

// Geocode an array of leads one by one with rate limiting.
// Calls onProgress(geocodedCount, total, successCount) after each attempt.
export async function geocodeLeads(leads, onProgress, signal) {
  const results = [...leads];
  let done = 0;
  let successes = 0;

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
      console.warn(`[geocode] Lead ${i} (id=${lead.id}) has no _addressForGeocode — raw data:`, lead._raw);
      results[i] = { ...lead, geocoded: null };
    }

    done++;
    onProgress?.(done, leads.length, successes);

    if (i < leads.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  console.log(`[geocode] Done — ${successes}/${done} succeeded`);
  return results;
}
