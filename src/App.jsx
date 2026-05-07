import { useState, useEffect, useRef, useCallback } from 'react';
import UploadScreen from './components/UploadScreen';
import MapView from './components/MapView';
import LeadSidebar from './components/LeadSidebar';
import GeocodingProgress from './components/GeocodingProgress';
import TopBar from './components/TopBar';
import ZoneLegend from './components/ZoneLegend';
import ZoneFilter from './components/ZoneFilter';
import LayerToggle from './components/LayerToggle';
import { geocodeLeads } from './utils/geocode';
import { assignZones } from './utils/assignZones';
import { saveLeads, loadLeads, clearLeads } from './utils/storage';
import { useZoningData } from './hooks/useZoningData';
import { useRegionalZoning } from './hooks/useRegionalZoning';
import './App.css';

export default function App() {
  const [leads, setLeads]                       = useState(null);
  const [selectedId, setSelectedId]             = useState(null);
  const [geocoding, setGeocoding]               = useState(false);
  const [geocodeDone, setGeocodeDone]           = useState(0);
  const [geocodeSuccesses, setGeocodeSuccesses] = useState(0);
  const [zoneFilter, setZoneFilter]             = useState(null);

  // Layer visibility
  const [eugeneVisible, setEugeneVisible]       = useState(true);
  const [enabledCounties, setEnabledCounties]   = useState(new Set()); // off by default (loads on demand)
  const [showLayerPanel, setShowLayerPanel]     = useState(false);

  // Map bounds for regional zoning bbox queries
  const [mapBounds, setMapBounds]               = useState(null);
  const [mapZoom, setMapZoom]                   = useState(11);

  const abortRef = useRef(null);

  // Eugene zoning (full load, as before)
  const { geojson: eugeneGeojson, loading: eugeneLoading } = useZoningData();

  // Regional zoning (bbox-filtered, on demand)
  const { geojson: regionalGeojson, loading: regionalLoading } = useRegionalZoning(
    mapBounds, mapZoom, enabledCounties,
  );

  // Restore leads from localStorage on mount
  useEffect(() => {
    const saved = loadLeads();
    if (saved?.length) setLeads(saved);
  }, []);

  useEffect(() => {
    if (leads) saveLeads(leads);
  }, [leads]);

  // Assign Eugene zones to leads when both are ready
  useEffect(() => {
    if (!leads || !eugeneGeojson) return;
    const needs = leads.some((l) => l.geocoded && l.zoneCode === undefined);
    if (!needs) return;
    setLeads((prev) => assignZones(prev, eugeneGeojson));
  }, [leads, eugeneGeojson]);

  const handleLeadsLoaded = useCallback(async ({ leads: parsed }) => {
    const initial = parsed.map((l) => ({ ...l, status: l.status || 'New', notes: l.notes || '' }));
    setLeads(initial);
    setSelectedId(null);
    setZoneFilter(null);
    setGeocodeDone(0);
    setGeocodeSuccesses(0);
    setGeocoding(true);

    const controller = new AbortController();
    abortRef.current = controller;

    const geocoded = await geocodeLeads(
      initial,
      (done, _total, successes) => { setGeocodeDone(done); setGeocodeSuccesses(successes); },
      controller.signal,
    );
    setLeads(geocoded);
    setGeocoding(false);
  }, []);

  const handleSkipGeocode  = useCallback(() => { abortRef.current?.abort(); setGeocoding(false); }, []);
  const handleSelectLead   = useCallback((id) => setSelectedId((p) => (p === id ? null : id)), []);
  const handleUpdateLead   = useCallback((id, patch) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }, []);
  const handleReset = useCallback(() => {
    abortRef.current?.abort();
    clearLeads();
    setLeads(null);
    setSelectedId(null);
    setGeocoding(false);
    setGeocodeDone(0);
    setGeocodeSuccesses(0);
    setZoneFilter(null);
  }, []);

  const handleBoundsChange = useCallback((bounds, zoom) => {
    setMapBounds(bounds);
    setMapZoom(zoom);
  }, []);

  const handleToggleCounty = useCallback((id) => {
    setEnabledCounties((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectedLead  = leads?.find((l) => l.id === selectedId) ?? null;
  const geocodedCount = leads?.filter((l) => l.geocoded).length ?? 0;
  const zoningLoading = eugeneLoading;
  const anyZoningOn   = eugeneVisible || enabledCounties.size > 0;

  const mapProps = {
    leads:           leads ?? [],
    selectedId,
    onSelectLead:    handleSelectLead,
    zoningGeojson:   eugeneGeojson,
    zoningVisible:   eugeneVisible,
    regionalGeojson,
    regionalVisible: enabledCounties.size > 0,
    zoneFilter,
    onBoundsChange:  handleBoundsChange,
  };

  const topBarProps = {
    leadCount: leads?.length ?? 0,
    geocodedCount,
    zoningVisible: anyZoningOn,
    onToggleZoning: () => setShowLayerPanel((p) => !p),
    zoningLoading,
    onReset: leads ? handleReset : null,
  };

  if (!leads) {
    return (
      <div className="app-shell">
        <TopBar {...topBarProps} />
        <div className="map-area">
          <MapView {...mapProps} />
          {showLayerPanel && (
            <LayerToggle
              eugeneOn={eugeneVisible}
              onToggleEugene={() => setEugeneVisible((v) => !v)}
              enabledCounties={enabledCounties}
              onToggleCounty={handleToggleCounty}
              regionalLoading={regionalLoading}
            />
          )}
          <ZoneLegend visible={anyZoningOn && !eugeneLoading} />
          <UploadScreen onLeadsLoaded={handleLeadsLoaded} />
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <TopBar {...topBarProps} />
      <div className="map-area">
        <MapView {...mapProps} />

        {showLayerPanel && (
          <LayerToggle
            eugeneOn={eugeneVisible}
            onToggleEugene={() => setEugeneVisible((v) => !v)}
            enabledCounties={enabledCounties}
            onToggleCounty={handleToggleCounty}
            regionalLoading={regionalLoading}
          />
        )}

        <ZoneFilter leads={leads} zoneFilter={zoneFilter} onChange={setZoneFilter} />
        <ZoneLegend visible={anyZoningOn && !eugeneLoading} />

        {geocoding && (
          <GeocodingProgress
            done={geocodeDone} total={leads.length}
            successes={geocodeSuccesses}
            onSkip={handleSkipGeocode}
          />
        )}

        <LeadSidebar
          lead={selectedLead}
          onClose={() => setSelectedId(null)}
          onUpdate={handleUpdateLead}
        />
      </div>
    </div>
  );
}
