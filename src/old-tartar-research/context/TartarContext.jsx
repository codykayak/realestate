import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { tartarApi } from '../lib/tartarApi';
import { listAppsForUser } from '../config/appRegistry';
import { PLATFORM_FEE_RATE } from '../config/schema';

const TartarContext = createContext(null);

export function TartarProvider({ children }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [customBuild, setCustomBuild] = useState(null);
  const [sources, setSources] = useState([]);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setCustomBuild(null);
      setSources([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await tartarApi.init();
      const data = await tartarApi.getProfile();
      setProfile(data.data.profile);
      setCustomBuild(data.data.customBuild);
      setSources(data.data.sources ?? []);
    } catch (e) {
      setError(e.message ?? 'Failed to load research profile');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const apps = listAppsForUser(customBuild, profile?.enabledApps);

  const value = {
    user,
    loading,
    error,
    profile,
    customBuild,
    sources,
    apps,
    platformFeeRate: PLATFORM_FEE_RATE,
    refresh,
    setCustomBuild,
    setProfile,
    setSources,
  };

  return <TartarContext.Provider value={value}>{children}</TartarContext.Provider>;
}

export function useTartar() {
  const ctx = useContext(TartarContext);
  if (!ctx) throw new Error('useTartar must be used within TartarProvider');
  return ctx;
}
