const LISTS_KEY = 'motivated-lead-lists-v1';
const ACTIVE_KEY = 'motivated-active-list-id';

export function loadListsLocal() {
  try {
    const raw = localStorage.getItem(LISTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveListsLocal(listsById) {
  try {
    localStorage.setItem(LISTS_KEY, JSON.stringify(listsById));
  } catch { /* ignore */ }
}

export function loadActiveListIdLocal() {
  return localStorage.getItem(ACTIVE_KEY);
}

export function saveActiveListIdLocal(id) {
  if (id) localStorage.setItem(ACTIVE_KEY, id);
  else localStorage.removeItem(ACTIVE_KEY);
}
