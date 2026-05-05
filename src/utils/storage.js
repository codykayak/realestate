const KEY = 'motivated-leads-v1';

export function saveLeads(leads) {
  try {
    localStorage.setItem(KEY, JSON.stringify(leads));
  } catch {
    // storage full or unavailable — silent fail
  }
}

export function loadLeads() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearLeads() {
  localStorage.removeItem(KEY);
}
