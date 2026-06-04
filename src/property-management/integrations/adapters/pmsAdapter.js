/**
 * Common PMS adapter interface + a stub factory.
 *
 * Every PMS integration (Yardi, RealPage, AppFolio, Entrata) implements this
 * same shape, so the rest of the app calls `pms.getResidents()` without caring
 * which system is underneath. Real adapters get wired up once a design partner
 * provides sandbox credentials; until then `createStubAdapter` returns a
 * provider that reports "not connected" but proves the interface end-to-end.
 *
 * @typedef {Object} PmsAdapter
 * @property {() => Promise<{ok:boolean, message:string}>} testConnection
 * @property {() => Promise<Array>} getResidents
 * @property {() => Promise<Array>} getLeases
 * @property {(payload:object) => Promise<object>} createWorkOrder
 * @property {string[]} capabilities
 */

export function createStubAdapter(manifest) {
  const notReady = async () => {
    throw new Error(
      `${manifest.name} integration is not active yet. Add sandbox credentials in Settings → Integrations to enable live sync.`,
    );
  };
  return {
    id: manifest.id,
    capabilities: manifest.capabilities || [],
    async testConnection() {
      // A real adapter would ping the provider API here. The stub simulates a
      // "credentials saved, awaiting partner approval" state.
      return {
        ok: false,
        message: `${manifest.name}: credentials captured. Live sync activates once the integration is approved.`,
      };
    },
    getResidents: notReady,
    getLeases: notReady,
    createWorkOrder: notReady,
  };
}

/** Resolve an adapter for a given manifest id. */
export function getAdapter(manifest) {
  // When real adapters land, switch on manifest.id here and return them.
  return createStubAdapter(manifest);
}

export default getAdapter;
