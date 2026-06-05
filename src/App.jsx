import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthScreen from './components/AuthScreen';
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
import TwilioOnboarding from './components/TwilioOnboarding';
import SheetsView from './components/SheetsView';
import { useTwilioConfig } from './hooks/useTwilioConfig';
import BgGeocodingBanner from './components/BgGeocodingBanner';
import { geocodeLeads, geocodeAddress } from './utils/geocode';
import { useLeadPhotos } from './hooks/useLeadPhotos';
import { lookupProperty } from './utils/propertyLookup';
import { assignZones } from './utils/assignZones';
import { saveLeads as lsSave, loadLeads as lsLoad, clearLeads as lsClear } from './utils/storage';
import { useZoningData } from './hooks/useZoningData';
import { useRegionalZoning } from './hooks/useRegionalZoning';
import { useAuth } from './hooks/useAuth';
import { useFirestoreLeads } from './hooks/useFirestoreLeads';
import { useOrgPool } from './hooks/useOrgPool';
import { useSellerPortalSync } from './hooks/useSellerPortalSync';
import TeamPoolPanel from './components/TeamPoolPanel';
import MyListsPanel from './components/MyListsPanel';
import LeadInfoModal from './components/LeadInfoModal';
import ColumnMapStep from './components/ColumnMapStep';
import { useLeadLists } from './hooks/useLeadLists';
import { parseFilePreview, buildLeadsFromImport } from './utils/parseCSV';
import { isFirebaseConfigured } from './firebase';
import './App.css';

export default function App() {
  const navigate = useNavigate();
  const {
    user, loading: authLoading, error: authError,
    setError: setAuthError,
    signInWithGoogle, signInWithEmail, signUpWithEmail,
    resetPassword, signOutUser,
  } = useAuth();
  const uid = user?.uid ?? null;
  const {
    org, members, isTeamMode, activeOrgId,
    createOrg, joinOrg, leaveOrg, usePersonalLeads,
    error: orgError, setError: setOrgError,
  } = useOrgPool(uid, user?.email ?? '');
  const editor = uid ? { uid, email: user?.email ?? '' } : null;
  const {
    loadLeads: fsLoad, saveLeads: fsSave, clearLeads: fsClear,
    logCall, getTodayCallLogs, getLeadActivity,
  } = useFirestoreLeads(uid, activeOrgId, editor);
  const { syncPortal } = useSellerPortalSync(uid, activeOrgId);
  const {
    config: twilioConfig,
    loading: twilioLoading,
    isReady: twilioReady,
    saveConfig: saveTwilioConfig,
    testCredentials,
    fetchWebhooks,
    webhooks,
    sendSms,
    scheduleAppointmentSms,
    cancelScheduledAppointmentSms,
    sending: smsSending,
    error: smsError,
    setError: setSmsError,
    templates: twilioTemplates,
  } = useTwilioConfig(uid);

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
  const [twilioSetupOpen, setTwilioSetupOpen]   = useState(false);
  const [teamOpen, setTeamOpen]                 = useState(false);
  // Background (non-blocking) geocoding for "X missing → tap to finish"
  const [bgGeocoding, setBgGeocoding]           = useState(false);
  const [bgDone, setBgDone]                     = useState(0);
  const [bgTotal, setBgTotal]                   = useState(0);
  const bgAbortRef                              = useRef(null);
  const abortRef = useRef(null);

  const { geojson: eugeneGeojson, loading: eugeneLoading } = useZoningData();
  const { uploadPhoto, deletePhoto } = useLeadPhotos(uid);
  const { geojson: regionalGeojson, loading: regionalLoading } = useRegionalZoning(mapBounds, mapZoom, enabledCounties);

  const refreshListsMeta = useCallback(async () => {
    setListsLoading(true);
    try {
      const items = await listAll();
      setListsMeta(items);
      return items;
    } finally {
      setListsLoading(false);
    }
  }, [listAll]);

  // ── Load leads on mount / auth / team pool switch ───────────────────────
  useEffect(() => {
    if (authLoading) return;
    async function init() {
      if (uid && isFirebaseConfigured && isTeamMode) {
        const fsLeads = await fsLoad();
        setLeads(fsLeads ?? []);
        setActiveListId(null);
        return;
      }
      if (uid && isFirebaseConfigured) {
        const items = await refreshListsMeta();
        let listId = getActiveListId();
        if (!listId && items.length) listId = items[0].id;
        if (!listId) {
          const legacy = await fsLoad();
          if (legacy?.length) listId = await migrateLegacyLeads(legacy);
          if (listId) await refreshListsMeta();
        }
        if (listId) {
          persistActiveListId(listId);
          setActiveListId(listId);
          const cached = leadsCacheRef.current[listId];
          if (cached) { setLeads(cached); return; }
          const doc = await loadList(listId);
          const loaded = doc?.leads ?? [];
          leadsCacheRef.current[listId] = loaded;
          setLeads(loaded.length ? loaded : null);
          return;
        }
        setLeads(null);
        return;
      }
      const items = await listAll();
      setListsMeta(items);
      let listId = getActiveListId();
      if (!listId && items.length) listId = items[0].id;
      if (listId) {
        setActiveListId(listId);
        const doc = await loadList(listId);
        setLeads(doc?.leads?.length ? doc.leads : null);
        return;
      }
      const saved = lsLoad();
      setLeads(saved?.length ? saved : null);
    }
    init();
  }, [uid, authLoading, activeOrgId, isTeamMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Persist leads ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!leads) return;
    if (uid && isFirebaseConfigured && isTeamMode) { fsSave(leads); return; }
    if (activeListId) {
      leadsCacheRef.current[activeListId] = leads;
      saveList(activeListId, { leads });
      return;
    }
    if (!uid || !isFirebaseConfigured) lsSave(leads);
  }, [leads, activeListId, isTeamMode]); // eslint-disable-line react-hooks/exhaustive-deps

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

  useEffect(() => {
    if (
      activeTab === 'dialer' && uid && !twilioLoading &&
      !twilioReady && !twilioConfig?.onboardingComplete
    ) {
      setTwilioSetupOpen(true);
    }
  }, [activeTab, uid, twilioLoading, twilioConfig, twilioReady]);

  const normalizeImportedLeads = useCallback((parsed) => parsed.map((l) => ({
    ...l,
    status: l.status || 'New',
    notes: l.notes || '',
    callCount: l.callCount ?? 0,
    smsCount: l.smsCount ?? 0,
    smsCountsByPhone: l.smsCountsByPhone ?? {},
    doNotCall: l.doNotCall ?? false,
    doNotText: l.doNotText ?? false,
    smsOptOut: l.smsOptOut ?? false,
  })), []);

  const runGeocodeIfNeeded = useCallback(async (initial) => {
    const needsGeocode = initial.some((l) => l._addressForGeocode?.trim() && !l.geocoded);
    if (!needsGeocode) return initial;
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
    setGeocoding(false);
    enrichLeadsFromPublicRecords(geocoded);
    return geocoded;
  }, []);

  // ── Lead handlers ────────────────────────────────────────────────────────
  const handleLeadsLoaded = useCallback(async (payload) => {
    const parsed = payload.leads ?? payload;
    const initial = normalizeImportedLeads(Array.isArray(parsed) ? parsed : []);
    setSelectedId(null);
    setZoneFilter(null);
    let listId = activeListId;
    if (payload.fileName && !isTeamMode) {
      listId = await createList({
        name: payload.listName || payload.fileName.replace(/\.[^.]+$/, ''),
        fileName: payload.fileName,
        headers: payload.headers,
        selectedHeaders: payload.selectedHeaders,
        previewRows: payload.previewRows,
        leads: initial,
      });
      setActiveListId(listId);
      persistActiveListId(listId);
      await refreshListsMeta();
    }
    const geocoded = await runGeocodeIfNeeded(initial);
    setLeads(geocoded);
    if (listId) {
      leadsCacheRef.current[listId] = geocoded;
      await saveList(listId, {
        leads: geocoded,
        headers: payload.headers,
        selectedHeaders: payload.selectedHeaders,
        previewRows: payload.previewRows,
        fileName: payload.fileName,
        name: payload.listName,
      });
    }
    setImportPreview(null);
    setMyListsOpen(false);
    setActiveTab('map');
  }, [activeListId, createList, isTeamMode, normalizeImportedLeads, persistActiveListId, refreshListsMeta, runGeocodeIfNeeded, saveList]);

  const switchList = useCallback(async (listId) => {
    if (listId === activeListId) { setMyListsOpen(false); return; }
    if (activeListId && leads) {
      leadsCacheRef.current[activeListId] = leads;
      await saveList(activeListId, { leads });
    }
    persistActiveListId(listId);
    setActiveListId(listId);
    let next = leadsCacheRef.current[listId];
    if (!next) {
      const doc = await loadList(listId);
      next = doc?.leads ?? [];
      leadsCacheRef.current[listId] = next;
    }
    setLeads(next.length ? next : null);
    setSelectedId(null);
    setZoneFilter(null);
    setMyListsOpen(false);
  }, [activeListId, leads, loadList, persistActiveListId, saveList]);

  const handleDeleteList = useCallback(async (listId) => {
    await deleteList(listId);
    delete leadsCacheRef.current[listId];
    const items = await refreshListsMeta();
    if (activeListId === listId) {
      const next = items[0];
      if (next) await switchList(next.id);
      else { setActiveListId(null); setLeads(null); }
    }
  }, [activeListId, deleteList, refreshListsMeta, switchList]);

  const handleAddListFile = useCallback(async (file) => {
    setImportBusy(true);
    try { setImportPreview(await parseFilePreview(file)); }
    catch (e) { console.error(e); }
    finally { setImportBusy(false); }
  }, []);

  const handleConfirmImport = useCallback(async (selectedHeaders) => {
    if (!importPreview) return;
    setImportBusy(true);
    try {
      const leadsBuilt = buildLeadsFromImport({
        rows: importPreview.rows,
        headers: importPreview.headers,
        selectedHeaders,
        startId: 0,
      });
      await handleLeadsLoaded({
        leads: leadsBuilt,
        fileName: importPreview.fileName,
        listName: importPreview.fileName.replace(/\.[^.]+$/, ''),
        headers: importPreview.headers,
        selectedHeaders,
        previewRows: importPreview.rows.slice(0, 10),
      });
    } finally { setImportBusy(false); }
  }, [handleLeadsLoaded, importPreview]);

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
    setLeads((prev) => {
      const next = prev.map((l) => {
        if (l.id !== id) return l;
        const updated = {
          ...l,
          ...patch,
          ...(user?.email ? { lastEditedBy: user.email } : {}),
        };
        if (updated.sellerDeal?.enabled) {
          syncPortal(updated).catch(() => {});
        }
        return updated;
      });
      return next;
    });
  }, [user?.email, syncPortal]);

  const handleLogCall = useCallback(async (callData) => {
    if (uid && isFirebaseConfigured) {
      await logCall({
        ...callData,
        createdByEmail: user?.email ?? '',
        createdByUid: uid,
      });
      getTodayCallLogs().then(setTodayCalls).catch(() => {});
    }
  }, [uid, user?.email, logCall, getTodayCallLogs]);

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

  // ── Auth gate (sign in OR sign up) ───────────────────────────────────────
  if (!user && isFirebaseConfigured) {
    return (
      <AuthScreen
        onSignInGoogle={signInWithGoogle}
        onSignInEmail={signInWithEmail}
        onSignUp={signUpWithEmail}
        onResetPassword={resetPassword}
        error={authError}
        setError={setAuthError}
      />
    );
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

  const activeListMeta = listsMeta.find((l) => l.id === activeListId);

  const topBarProps = {
    leadCount: leads?.length ?? 0, geocodedCount,
    zoningVisible: anyZoningOn,
    onToggleZoning: () => setShowLayerPanel((p) => !p),
    zoningLoading: eugeneLoading,
    onOpenLists: !isTeamMode ? () => setMyListsOpen(true) : undefined,
    activeListName: !isTeamMode ? activeListMeta?.name : null,
    onResumeGeocoding: unmappedCount > 0 && !bgGeocoding ? handleResumeGeocoding : undefined,
    bgGeocoding,
    teamLabel: isTeamMode ? org?.name : null,
    onOpenTeam: uid ? () => setTeamOpen(true) : undefined,
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
                onSyncPortal={syncPortal}
                onViewInSheets={() => handleViewInSheets(selectedLead?.id)}
                onShowInfo={() => setInfoModal({ lead: selectedLead })}
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
            isTeamMode={isTeamMode}
            onDialLead={handleDialLead}
            onSelectLead={handleSelectLead}
            onViewOnMap={handleViewOnMap}
            onUpdateLead={handleUpdateLead}
            onShowInfo={(lead) => setInfoModal({ lead })}
          />
        </div>
      )}

      {/* ── Dialer tab ───────────────────────────────────────────────── */}
      {activeTab === 'dialer' && (
        <div className="dialer-area">
          <DialerView
            leads={leads ?? []}
            onUpdateLead={handleUpdateLead}
            onSyncPortal={syncPortal}
            onLogCall={handleLogCall}
            todayCalls={todayCalls}
            jumpToId={dialerJumpId}
            onViewInSheets={handleViewInSheets}
            onUploadPhoto={uploadPhoto}
            onDeletePhoto={deletePhoto}
            twilioReady={twilioReady}
            twilioConfig={twilioConfig}
            twilioTemplates={twilioTemplates}
            onOpenTwilioSetup={() => { setSmsError(null); setTwilioSetupOpen(true); }}
            onSendSms={sendSms}
            scheduleAppointmentSms={scheduleAppointmentSms}
            cancelScheduledAppointmentSms={cancelScheduledAppointmentSms}
            fetchLeadActivity={getLeadActivity}
            smsSending={smsSending}
            smsError={smsError}
            onShowInfo={(lead) => setInfoModal({ lead })}
            emailTemplates={twilioConfig?.emailTemplates}
            agentName={twilioConfig?.agentName}
          />
        </div>
      )}

      <TeamPoolPanel
        open={teamOpen}
        onClose={() => { setTeamOpen(false); setOrgError(null); }}
        org={org}
        members={members}
        isTeamMode={isTeamMode}
        error={orgError}
        onCreateOrg={createOrg}
        onJoinOrg={joinOrg}
        onLeaveOrg={leaveOrg}
        onUsePersonal={usePersonalLeads}
      />

      <TwilioOnboarding
        open={twilioSetupOpen}
        onClose={() => setTwilioSetupOpen(false)}
        config={twilioConfig}
        saveConfig={saveTwilioConfig}
        testCredentials={testCredentials}
        fetchWebhooks={fetchWebhooks}
        webhooks={webhooks}
        uid={uid}
      />

      <MyListsPanel
        open={myListsOpen}
        onClose={() => setMyListsOpen(false)}
        lists={listsMeta}
        activeListId={activeListId}
        loading={listsLoading}
        onSelectList={switchList}
        onDeleteList={handleDeleteList}
        onAddList={handleAddListFile}
        onShowListInfo={async (item) => {
          const doc = await loadList(item.id);
          setInfoModal({ listMeta: { ...item, ...doc } });
        }}
      />

      <LeadInfoModal
        open={!!infoModal}
        onClose={() => setInfoModal(null)}
        lead={infoModal?.lead}
        listMeta={infoModal?.listMeta}
      />

      {importPreview && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 130, background: 'rgba(0,0,0,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        }}
        >
          <div style={{
            background: '#161b22', border: '1px solid #30363d', borderRadius: 14,
            padding: 20, maxWidth: 520, width: '100%', maxHeight: '90vh', overflow: 'auto',
          }}
          >
            <ColumnMapStep
              fileName={importPreview.fileName}
              headers={importPreview.headers}
              autoFieldMap={importPreview.autoFieldMap}
              previewRows={importPreview.rows}
              onBack={() => setImportPreview(null)}
              onConfirm={handleConfirmImport}
              busy={importBusy}
            />
          </div>
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
