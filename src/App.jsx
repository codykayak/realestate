import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginScreen from './components/LoginScreen';
import UploadScreen from './components/UploadScreen';
import MapView from './components/MapView';
import LeadSidebar from './components/LeadSidebar';
import GeocodingProgress from './components/GeocodingProgress';
import TopBar from './components/TopBar';
import ZoneLegend from './components/ZoneLegend';
import ZoneFilter from './components/ZoneFilter';
import LayerToggle from './components/LayerToggle';
import TabBar from './components/TabBar';
import DialerView from './components/DialerView';
import SheetsView from './components/SheetsView';
import BgGeocodingBanner from './components/BgGeocodingBanner';
import { geocodeLeads, geocodeAddress } from './utils/geocode';
import { lookupProperty } from './utils/propertyLookup';
import { assignZones } from './utils/assignZones';
import { saveLeads as lsSave, loadLeads as lsLoad, clearLeads as lsClear } from './utils/storage';
import { useZoningData } from './hooks/useZoningData';
import { useRegionalZoning } from './hooks/useRegionalZoning';
import { useAuth } from './hooks/useAuth';
import { useFirestoreLeads } from './hooks/useFirestoreLeads';
import { isFirebaseConfigured } from './firebase';
import './App.css';

export default function App() {
  const navigate = useNavigate();
  const { user, loading: authLoading, error: authError, signInWithGoogle, signOutUser } = useAuth();
  const uid = user?.uid ?? null;
  const { loadLeads: fsLoad, saveLeads: fsSave, clearLeads: fsClear, logCall, getTodayCallLogs } = useFirestoreLeads(uid);

  const [leads, setLeads]                       = useState(null);
  const [selectedId, setSelectedId]             = useState(null);
  const [geocoding, setGeocoding]               = useState(false);
  const [geocodeDone, setGeocodeDone]           = useState(0);
  const [geocodeSuccesses, setGeocodeSuccesses] = useState(0);
  const [zoneFilter, setZoneFilter]             = useState(null);
  const [eugeneVisible, setEugeneVisible]       = useState(true);
  const [enabledCounties, setEnabledCounties]   = useState(new Set());
  const [showLayerPanel, setShowLayerPanel]     = useState(false);
  const [mapBounds, setMapBounds]               = useState(null);
  const [mapZoom, setMapZoom]                   = useState(11);
  const [activeTab, setActiveTab]               = useState('map');
  const [todayCalls, setTodayCalls]             = useState([]);
  const [dialerJumpId, setDialerJumpId]         = useState(null);
  // Background (non-blocking) geocoding for "X missing → tap to finish"
  const [bgGeocoding, setBgGeocoding]           = useState(false);
  const [bgDone, setBgDone]                     = useState(0);
  const [bgTotal, setBgTotal]                   = useState(0);
  const bgAbortRef                              = useRef(null);
  const abortRef = useRef(null);

  const { geojson: eugeneGeojson, loading: eugeneLoading } = useZoningData();
  const { geojson: regionalGeojson, loading: regionalLoading } = useRegionalZoning(mapBounds, mapZoom, enabledCounties);

  // ── Load leads on mount / auth ──────────────────────────────────────────
  useEffect(() => {
    if (authLoading) return;
    async function init() {
      if (uid && isFirebaseConfigured) {
        const fsLeads = await fsLoad();
        if (fsLeads?.length) { setLeads(fsLeads); return; }
      }
      // Fallback: localStorage
      const saved = lsLoad();
      if (saved?.length) setLeads(saved);
    }
    init();
  }, [uid, authLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Persist leads ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!leads) return;
    if (uid && isFirebaseConfigured) fsSave(leads);
    else lsSave(leads);
  }, [leads]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Zone assignment ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!leads || !eugeneGeojson) return;
    if (leads.some((l) => l.geocoded && l.zoneCode === undefined)) {
      setLeads((prev) => assignZones(prev, eugeneGeojson));
    }
  }, [leads, eugeneGeojson]);

  // ── Today's call log (for dialer stats) ─────────────────────────────────
  useEffect(() => {
    if (!uid || !isFirebaseConfigured) return;
    getTodayCallLogs().then(setTodayCalls).catch(() => {});
  }, [uid]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Lead handlers ────────────────────────────────────────────────────────
  const handleLeadsLoaded = useCallback(async ({ leads: parsed }) => {
    const initial = parsed.map((l) => ({ ...l, status: l.status || 'New', notes: l.notes || '', callCount: 0 }));
    setLeads(initial);
    setSelectedId(null);
    setZoneFilter(null);
    setGeocodeDone(0);
    setGeocodeSuccesses(0);
    setGeocoding(true);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    const geocoded = await geocodeLeads(
      initial,
      (done, _, successes) => { setGeocodeDone(done); setGeocodeSuccesses(successes); },
      ctrl.signal,
    );
    setLeads(geocoded);
    setGeocoding(false);

    // After geocoding, enrich each mapped lead with Lane County property records
    // Run in the background — non-blocking, low priority
    enrichLeadsFromPublicRecords(geocoded);
  }, []);

  // Background enrichment: Lane County taxlot data for each geocoded lead
  async function enrichLeadsFromPublicRecords(geocodedLeads) {
    const mapped = geocodedLeads.filter(l => l.geocoded);
    for (const lead of mapped) {
      try {
        const rec = await lookupProperty(lead.geocoded.lat, lead.geocoded.lng);
        if (rec) {
          setLeads(prev =>
            prev.map(l => l.id === lead.id ? { ...l, publicRecord: rec } : l)
          );
        }
      } catch { /* silent fail per lead */ }
      // Small delay to avoid hammering the GIS server
      await new Promise(r => setTimeout(r, 200));
    }
  }

  const handleSkipGeocode = useCallback(() => { abortRef.current?.abort(); setGeocoding(false); }, []);
  const handleSelectLead  = useCallback((id) => setSelectedId((p) => (p === id ? null : id)), []);
  const handleUpdateLead  = useCallback((id, patch) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }, []);

  const handleReset = useCallback(async () => {
    abortRef.current?.abort();
    if (uid && isFirebaseConfigured) await fsClear();
    else lsClear();
    setLeads(null);
    setSelectedId(null);
    setGeocoding(false);
    setGeocodeDone(0);
    setGeocodeSuccesses(0);
    setZoneFilter(null);
  }, [uid, fsClear]);

  const handleLogCall = useCallback(async (callData) => {
    if (uid && isFirebaseConfigured) {
      await logCall(callData);
      // Refresh today's stats
      getTodayCallLogs().then(setTodayCalls).catch(() => {});
    }
  }, [uid, logCall, getTodayCallLogs]);

  const handleBoundsChange = useCallback((bounds, zoom) => { setMapBounds(bounds); setMapZoom(zoom); }, []);

  // Resume geocoding — processes one lead at a time, updates the map
  // immediately after each address resolves (no waiting for all to finish).
  const handleResumeGeocoding = useCallback(async () => {
    if (bgGeocoding || !leads) return;

    // Leads that still need geocoding — must have an address to try
    const pending = leads.filter((l) => !l.geocoded && l._addressForGeocode?.trim());

    console.log('[resumeGeocode] Pending leads:', pending.length);
    if (pending.length === 0) {
      console.warn('[resumeGeocode] No pending leads found. Checking why...');
      // Debug: show a sample of leads and their geocode status
      leads.slice(0, 5).forEach((l) => {
        console.log(`  Lead ${l.id}: geocoded=${JSON.stringify(l.geocoded)}, addr=${l._addressForGeocode}`);
      });
      return;
    }

    setBgGeocoding(true);
    setBgDone(0);
    setBgTotal(pending.length);

    const ctrl = new AbortController();
    bgAbortRef.current = ctrl;

    for (let i = 0; i < pending.length; i++) {
      if (ctrl.signal.aborted) {
        console.log('[resumeGeocode] Stopped after', i, 'leads');
        break;
      }

      const lead = pending[i];
      console.log(`[resumeGeocode] ${i + 1}/${pending.length}: "${lead._addressForGeocode}"`);

      const geo = await geocodeAddress(lead._addressForGeocode);

      if (geo) {
        console.log(`[resumeGeocode] ✓ ${lead._addressForGeocode} → ${geo.lat}, ${geo.lng}`);
        setLeads((prev) =>
          prev.map((l) => l.id === lead.id ? { ...l, geocoded: geo } : l),
        );
        // Enrich with public records in background
        lookupProperty(geo.lat, geo.lng).then(rec => {
          if (rec) setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, publicRecord: rec } : l));
        }).catch(() => {});
      } else {
        console.warn(`[resumeGeocode] ✗ Failed: "${lead._addressForGeocode}"`);
      }

      setBgDone(i + 1);

      // Respect Nominatim rate limit (1 req/sec)
      if (i < pending.length - 1 && !ctrl.signal.aborted) {
        await new Promise((r) => setTimeout(r, 1100));
      }
    }

    setBgGeocoding(false);
    console.log('[resumeGeocode] Complete');
  }, [bgGeocoding, leads]);

  const handleStopBgGeocoding = useCallback(() => {
    bgAbortRef.current?.abort();
    setBgGeocoding(false);
  }, []);

  // Navigate from Sheets or Sidebar → Dialer for a specific lead
  const handleDialLead = useCallback((id) => {
    setDialerJumpId(id);
    setActiveTab('dialer');
  }, []);

  // Navigate from Dialer or Sidebar → Sheets (highlight that lead)
  const handleViewInSheets = useCallback((id) => {
    if (id != null) setSelectedId(id);
    setActiveTab('sheets');
  }, []);

  // Navigate from Sheets → Map (select + fly to that lead)
  const handleViewOnMap = useCallback((id) => {
    setSelectedId(id);
    setActiveTab('map');
  }, []);
  const handleToggleCounty = useCallback((id) => {
    setEnabledCounties((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  // ── Auth loading ─────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100dvh', background:'#0d1117', color:'#8b949e', fontSize:'15px' }}>
        Loading…
      </div>
    );
  }

  // ── Login gate ───────────────────────────────────────────────────────────
  if (!user && isFirebaseConfigured) {
    return <LoginScreen onSignIn={signInWithGoogle} error={authError} />;
  }

  // ── Shared props ─────────────────────────────────────────────────────────
  const selectedLead  = leads?.find((l) => l.id === selectedId) ?? null;
  const geocodedCount = leads?.filter((l) => l.geocoded).length ?? 0;
  const anyZoningOn   = eugeneVisible || enabledCounties.size > 0;

  const mapProps = {
    leads: leads ?? [], selectedId, onSelectLead: handleSelectLead,
    zoningGeojson: eugeneGeojson, zoningVisible: eugeneVisible,
    regionalGeojson, regionalVisible: enabledCounties.size > 0,
    zoneFilter, onBoundsChange: handleBoundsChange,
  };

  const unmappedCount = (leads?.length ?? 0) - geocodedCount;

  const topBarProps = {
    leadCount: leads?.length ?? 0, geocodedCount,
    zoningVisible: anyZoningOn,
    onToggleZoning: () => setShowLayerPanel((p) => !p),
    zoningLoading: eugeneLoading,
    onReset: leads ? handleReset : null,
    onResumeGeocoding: unmappedCount > 0 && !bgGeocoding ? handleResumeGeocoding : undefined,
    bgGeocoding,
  };

  return (
    <div className="app-shell">
      <TopBar {...topBarProps} />

      {/* ── Background geocoding banner — floats above all tabs ──────── */}
      {bgGeocoding && (
        <BgGeocodingBanner
          done={bgDone}
          total={bgTotal}
          onCancel={handleStopBgGeocoding}
        />
      )}

      {/* ── Map tab ──────────────────────────────────────────────────── */}
      {activeTab === 'map' && (
        <div className="map-area">
          {!leads ? (
            <>
              <MapView {...mapProps} />
              {showLayerPanel && (
                <LayerToggle
                  eugeneOn={eugeneVisible} onToggleEugene={() => setEugeneVisible((v) => !v)}
                  enabledCounties={enabledCounties} onToggleCounty={handleToggleCounty}
                  regionalLoading={regionalLoading}
                />
              )}
              <ZoneLegend visible={anyZoningOn && !eugeneLoading} />
              <UploadScreen onLeadsLoaded={handleLeadsLoaded} />
            </>
          ) : (
            <>
              <MapView {...mapProps} />
              {showLayerPanel && (
                <LayerToggle
                  eugeneOn={eugeneVisible} onToggleEugene={() => setEugeneVisible((v) => !v)}
                  enabledCounties={enabledCounties} onToggleCounty={handleToggleCounty}
                  regionalLoading={regionalLoading}
                />
              )}
              <ZoneFilter leads={leads} zoneFilter={zoneFilter} onChange={setZoneFilter} />
              <ZoneLegend visible={anyZoningOn && !eugeneLoading} />
              {geocoding && (
                <GeocodingProgress
                  done={geocodeDone} total={leads.length}
                  successes={geocodeSuccesses} onSkip={handleSkipGeocode}
                />
              )}
              <LeadSidebar
                lead={selectedLead}
                onClose={() => setSelectedId(null)}
                onUpdate={handleUpdateLead}
                onViewInSheets={() => handleViewInSheets(selectedLead?.id)}
              />
            </>
          )}
        </div>
      )}

      {/* ── Sheets tab ───────────────────────────────────────────────── */}
      {activeTab === 'sheets' && (
        <div className="dialer-area">
          <SheetsView
            leads={leads ?? []}
            selectedId={selectedId}
            onDialLead={handleDialLead}
            onSelectLead={handleSelectLead}
            onViewOnMap={handleViewOnMap}
          />
        </div>
      )}

      {/* ── Dialer tab ───────────────────────────────────────────────── */}
      {activeTab === 'dialer' && (
        <div className="dialer-area">
          <DialerView
            leads={leads ?? []}
            onUpdateLead={handleUpdateLead}
            onLogCall={handleLogCall}
            todayCalls={todayCalls}
            jumpToId={dialerJumpId}
            onViewInSheets={handleViewInSheets}
          />
        </div>
      )}

      <TabBar
        activeTab={activeTab}
        onChange={setActiveTab}
        user={user}
        onSignOut={() => { signOutUser(); navigate('/'); }}
      />
    </div>
  );
}
