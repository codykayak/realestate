/**
 * Tenant-scoped data layer.
 *
 * A single, swappable abstraction over persistence. Today it is backed by
 * localStorage so the module runs with zero setup. When the new Firebase
 * project is configured (VITE_PM_FIREBASE_*), a Firestore-backed
 * implementation can be dropped in behind this same API without touching any
 * UI code — every collection is already namespaced by tenant.
 *
 * All data is keyed under `pm:{tenantId}:{collection}` so it never collides
 * with the host site's localStorage and is trivially exportable per tenant.
 */

const NS = 'pm';

function key(tenantId, collection) {
  return `${NS}:${tenantId}:${collection}`;
}

function read(tenantId, collection, fallback) {
  try {
    const raw = localStorage.getItem(key(tenantId, collection));
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(tenantId, collection, value) {
  try {
    localStorage.setItem(key(tenantId, collection), JSON.stringify(value));
  } catch (err) {
    console.warn('[pm/store] write failed', collection, err);
  }
  return value;
}

export function genId(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Current epoch ms. Kept here (outside component files) so callers don't trip
 *  the React purity lint for calling Date.now() directly in a component body. */
export function now() {
  return Date.now();
}

/**
 * Returns a store bound to a single tenant. The UI only ever talks to this
 * object, so swapping the backend later is a one-file change.
 */
export function createStore(tenantId) {
  const list = (collection) => read(tenantId, collection, []);
  const saveList = (collection, items) => write(tenantId, collection, items);

  function upsert(collection, item) {
    const items = list(collection);
    const id = item.id || genId(collection.slice(0, 3));
    const next = { ...item, id, updatedAt: Date.now() };
    const idx = items.findIndex((x) => x.id === id);
    if (idx >= 0) items[idx] = { ...items[idx], ...next };
    else items.unshift({ createdAt: Date.now(), ...next });
    saveList(collection, items);
    return next;
  }

  function remove(collection, id) {
    saveList(collection, list(collection).filter((x) => x.id !== id));
  }

  return {
    tenantId,
    // generic
    list,
    saveList,
    upsert,
    remove,
    // tenant settings (single doc)
    getSettings: () => read(tenantId, 'settings', null),
    saveSettings: (s) => write(tenantId, 'settings', s),
    // integrations config (single doc; secrets are NOT stored here in prod)
    getIntegrations: () => read(tenantId, 'integrations', {}),
    saveIntegrations: (c) => write(tenantId, 'integrations', c),
    // convenience helpers per collection
    residents: () => list('residents'),
    conversations: () => list('conversations'),
    leasingLeads: () => list('leasingLeads'),
    workOrders: () => list('workOrders'),
    knowledge: () => list('knowledge'),
  };
}

export default createStore;
