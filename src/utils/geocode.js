// Nominatim geocoder with simple rate-limiting (1 req/sec per OSM policy)

const NOMINATIM = 'https://nominatim.openstreetmap.org/search';
const DELAY_MS = 1100; // slightly over 1 s to be safe

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function geocodeAddress(address) {
  if (!address || address.trim().length < 5) return null;

  const params = new URLSearchParams({
    q: address,
    format: 'json',
    limit: '1',
    countrycodes: 'us',
  });

  try {
    const res = await fetch(`${NOMINATIM}?${params}`, {
      headers: { 'Accept-Language': 'en' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.length) return null;
    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      displayName: data[0].display_name,
    };
  } catch {
    return null;
  }
}

// Geocode an array of leads one by one with rate limiting.
// Calls onProgress(geocodedCount, total) after each attempt.
export async function geocodeLeads(leads, onProgress, signal) {
  const results = [...leads];
  let done = 0;

  for (let i = 0; i < leads.length; i++) {
    if (signal?.aborted) break;

    const lead = leads[i];
    if (lead._addressForGeocode) {
      const geo = await geocodeAddress(lead._addressForGeocode);
      results[i] = { ...lead, geocoded: geo };
    }

    done++;
    onProgress?.(done, leads.length);

    if (i < leads.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  return results;
}
