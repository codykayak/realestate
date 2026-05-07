import { useState, useEffect, useRef, useCallback } from 'react';
import UploadScreen from './components/UploadScreen';
import MapView from './components/MapView';
import LeadSidebar from './components/LeadSidebar';
import GeocodingProgress from './components/GeocodingProgress';
import TopBar from './components/TopBar';
import ZoneLegend from './components/ZoneLegend';
import ZoneFilter from './components/ZoneFilter';
import { geocodeLeads } from './utils/geocode';
import { assignZones } from './utils/assignZones';
import { saveLeads, loadLeads, clearLeads } from './utils/storage';
import { useZoningData } from './hooks/useZoningData';
import './App.css';

export default function App() {
  const [leads, setLeads]                       = useState(null);
  const [selectedId, setSelectedId]             = useState(null);
  const [geocoding, setGeocoding]               = useState(false);
  const [geocodeDone, setGeocodeDone]           = useState(0);
  const [geocodeSuccesses, setGeocodeSuccesses] = useState(0);
  const [zoningVisible, setZoningVisible]       = useState(true);
  const [zoneFilter, setZoneFilter]             = useState(null); // null = all
  const abortRef = useRef(null);

  const { geojson: zoningGeojson, loading: zoningLoading } = useZoningData();

  // Restore leads from localStorage on mount
  useEffect(() => {
    const saved = loadLeads();
    if (saved?.length) setLeads(saved);
  }, []);

  // Persist whenever leads change
  useEffect(() => {
    if (leads) saveLeads(leads);
  }, [leads]);

  // Assign zones whenever BOTH leads and zoningGeojson are ready
  useEffect(() => {
    if (!leads || !zoningGeojson) return;
    // Only assign if some leads don't have a zone yet
    const needsAssignment = leads.some((l) => l.geocoded && l.zoneCode === undefined);
    if (!needsAssignment) return;
    setLeads((prev) => assignZones(prev, zoningGeojson));
  }, [leads, zoningGeojson]);

  const handleLeadsLoaded = useCallback(async ({ leads: parsed }) => {
    const initialLeads = parsed.map((l) => ({
      ...l,
      status: l.status || 'New',
      notes:  l.notes  || '',
    }));

    setLeads(initialLeads);
    setSelectedId(null);
    setZoneFilter(null);
    setGeocodeDone(0);
    setGeocodeSuccesses(0);
    setGeocoding(true);

    const controller = new AbortController();
    abortRef.current = controller;

    const geocoded = await geocodeLeads(
      initialLeads,
      (done, _total, successes) => {
        setGeocodeDone(done);
        setGeocodeSuccesses(successes);
      },
      controller.signal,
    );

    setLeads(geocoded);
    setGeocoding(false);
  }, []);

  const handleSkipGeocode = useCallback(() => {
    abortRef.current?.abort();
    setGeocoding(false);
  }, []);

  const handleSelectLead  = useCallback((id) => setSelectedId((p) => (p === id ? null : id)), []);
  const handleUpdateLead  = useCallback((id, patch) => {
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

  const selectedLead  = leads?.find((l) => l.id === selectedId) ?? null;
  const geocodedCount = leads?.filter((l) => l.geocoded).length ?? 0;

  const mapProps = {
    leads:         leads ?? [],
    selectedId,
    onSelectLead:  handleSelectLead,
    zoningGeojson,
    zoningVisible,
    zoneFilter,
  };

  // ── No CSV yet: show map + zoning in background, upload overlay on top ──
  if (!leads) {
    return (
      <div className="app-shell">
        <TopBar
          leadCount={0} geocodedCount={0}
          zoningVisible={zoningVisible}
          onToggleZoning={() => setZoningVisible((v) => !v)}
          zoningLoading={zoningLoading}
          onReset={null}
        />
        <div className="map-area">
          <MapView {...mapProps} />
          <ZoneLegend visible={zoningVisible && !zoningLoading} />
          <UploadScreen onLeadsLoaded={handleLeadsLoaded} />
        </div>
      </div>
    );
  }

  // ── Main view ─────────────────────────────────────────────────────────────
  return (
    <div className="app-shell">
      <TopBar
        leadCount={leads.length} geocodedCount={geocodedCount}
        zoningVisible={zoningVisible}
        onToggleZoning={() => setZoningVisible((v) => !v)}
        zoningLoading={zoningLoading}
        onReset={handleReset}
      />

      <div className="map-area">
        <MapView {...mapProps} />

        <ZoneFilter
          leads={leads}
          zoneFilter={zoneFilter}
          onChange={setZoneFilter}
        />

        <ZoneLegend visible={zoningVisible && !zoningLoading} />

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
