import { useState, useEffect, useRef, useCallback } from 'react';
import UploadScreen from './components/UploadScreen';
import MapView from './components/MapView';
import LeadSidebar from './components/LeadSidebar';
import GeocodingProgress from './components/GeocodingProgress';
import TopBar from './components/TopBar';
import ZoneLegend from './components/ZoneLegend';
import { geocodeLeads } from './utils/geocode';
import { saveLeads, loadLeads, clearLeads } from './utils/storage';
import { useZoningData } from './hooks/useZoningData';
import './App.css';

export default function App() {
  const [leads, setLeads]                     = useState(null);
  const [selectedId, setSelectedId]           = useState(null);
  const [geocoding, setGeocoding]             = useState(false);
  const [geocodeDone, setGeocodeDone]         = useState(0);
  const [geocodeSuccesses, setGeocodeSuccesses] = useState(0);
  const [zoningVisible, setZoningVisible]     = useState(true);
  const abortRef = useRef(null);

  // Fetch zoning data in background (works even before CSV is loaded)
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

  const handleLeadsLoaded = useCallback(async ({ leads: parsed }) => {
    const initialLeads = parsed.map((l) => ({
      ...l,
      status: l.status || 'New',
      notes:  l.notes  || '',
    }));

    setLeads(initialLeads);
    setSelectedId(null);
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

  const handleSelectLead = useCallback((id) => {
    setSelectedId((prev) => (prev === id ? null : id));
  }, []);

  const handleUpdateLead = useCallback((id, patch) => {
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
  }, []);

  const selectedLead = leads?.find((l) => l.id === selectedId) ?? null;
  const geocodedCount = leads?.filter((l) => l.geocoded).length ?? 0;

  // ── Upload screen (no CSV loaded yet) ────────────────────────────────────
  if (!leads) {
    return (
      <div className="app-shell">
        {/* Show map + zoning in the background even before CSV upload */}
        <TopBar
          leadCount={0}
          geocodedCount={0}
          zoningVisible={zoningVisible}
          onToggleZoning={() => setZoningVisible((v) => !v)}
          zoningLoading={zoningLoading}
          onReset={null}
        />
        <div className="map-area">
          <MapView
            leads={[]}
            selectedId={null}
            onSelectLead={() => {}}
            zoningGeojson={zoningGeojson}
            zoningVisible={zoningVisible}
          />
          <ZoneLegend visible={zoningVisible && !zoningLoading} />
        </div>
        <UploadScreen onLeadsLoaded={handleLeadsLoaded} />
      </div>
    );
  }

  // ── Main map view ─────────────────────────────────────────────────────────
  return (
    <div className="app-shell">
      <TopBar
        leadCount={leads.length}
        geocodedCount={geocodedCount}
        zoningVisible={zoningVisible}
        onToggleZoning={() => setZoningVisible((v) => !v)}
        zoningLoading={zoningLoading}
        onReset={handleReset}
      />

      <div className="map-area">
        <MapView
          leads={leads}
          selectedId={selectedId}
          onSelectLead={handleSelectLead}
          zoningGeojson={zoningGeojson}
          zoningVisible={zoningVisible}
        />

        <ZoneLegend visible={zoningVisible && !zoningLoading} />

        {geocoding && (
          <GeocodingProgress
            done={geocodeDone}
            total={leads.length}
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
