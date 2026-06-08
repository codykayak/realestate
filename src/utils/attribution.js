const STORAGE_KEY = 'macrorei_attribution';

function readStored() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Capture UTM + click IDs on first landing (persists for the session).
 */
export function captureAttribution() {
  if (typeof window === 'undefined') return;

  const params = new URLSearchParams(window.location.search);
  const incoming = {
    utm_source: params.get('utm_source') || '',
    utm_medium: params.get('utm_medium') || '',
    utm_campaign: params.get('utm_campaign') || '',
    utm_content: params.get('utm_content') || '',
    utm_term: params.get('utm_term') || '',
    gclid: params.get('gclid') || '',
    fbclid: params.get('fbclid') || '',
  };

  const hasFreshUtm = Object.values(incoming).some(Boolean);
  const stored = readStored();

  const next = {
    ...stored,
    ...(hasFreshUtm ? incoming : {}),
    landingPage: window.location.pathname + window.location.search,
    referrer: document.referrer || stored.referrer || '',
    capturedAt: new Date().toISOString(),
  };

  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function setAttributionContext(patch) {
  const stored = readStored();
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...stored, ...patch }));
}

export function getAttribution() {
  return readStored();
}
