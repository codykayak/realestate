import { httpsCallable } from 'firebase/functions';
import { functions } from '../../firebase';

const call = (name) => httpsCallable(functions, name);

export const tartarApi = {
  init: () => call('tartarInit')(),
  getProfile: () => call('tartarGetProfile')(),
  saveCustomBuild: (build) => call('tartarSaveCustomBuild')({ build }),
  addSource: (source) => call('tartarAddSource')({ source }),
  addSearchTerm: (data) => call('tartarAddSearchTerm')(data),
  startIngestion: (data) => call('tartarStartIngestion')(data),
  detectAnomalies: (rules) => call('tartarDetectAnomalies')({ rules }),
  queryMentions: (filters) => call('tartarQueryMentions')(filters),
  queryEntities: (filters) => call('tartarQueryEntities')(filters),
  setBillingMode: (mode) => call('tartarSetBillingMode')({ mode }),
  storeApiKey: (provider, apiKey) => call('tartarStoreApiKey')({ provider, apiKey }),
};
