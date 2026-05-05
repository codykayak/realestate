import { useState, useEffect, useRef, useCallback } from 'react';
import UploadScreen from './components/UploadScreen';
import MapView from './components/MapView';
import LeadSidebar from './components/LeadSidebar';
import GeocodingProgress from './components/GeocodingProgress';
import TopBar from './components/TopBar';
import { geocodeLeads } from './utils/geocode';
import { saveLeads, loadLeads, clearLeads } from './utils/storage';
import './App.css';

export default function App() {
  const [leads, setLeads] = useState(null);          // null = no file loaded yet
  const [selectedId, setSelectedId] = useState(null);
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeDone, setGeocodeDone] = useState(0);
  const abortRef = useRef(null);

  // Restore from localStorage on mount
  useEffect(() => {
    const saved = loadLeads();
    if (saved?.length) setLeads(saved);
  }, []);

  // Persist whenever leads change
  useEffect(() => {
    if (leads) saveLeads(leads);
  }, [leads]);

  const handleLeadsLoaded = useCallback(async ({ leads: parsed }) => {
    // Pre-populate status/notes from CSV if present, else defaults
    const initialLeads = parsed.map((l) => ({
      ...l,
      status: l.status || 'New',
      notes:  l.notes  || '',
    }));

    setLeads(initialLeads);
    setSelectedId(null);
    setGeocodeDone(0);
    setGeocoding(true);

    const controller = new AbortController();
    abortRef.current = controller;

    const geocoded = await geocodeLeads(
      initialLeads,
      (done) => setGeocodeDone(done),
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
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...patch } : l))
    );
  }, []);

  const handleReset = useCallback(() => {
    abortRef.current?.abort();
    clearLeads();
    setLeads(null);
    setSelectedId(null);
    setGeocoding(false);
  }, []);

  const selectedLead = leads?.find((l) => l.id === selectedId) ?? null;
  const geocodedCount = leads?.filter((l) => l.geocoded).length ?? 0;

  if (!leads) {
    return <UploadScreen onLeadsLoaded={handleLeadsLoaded} />;
  }

  return (
    <div className="app-shell">
      <TopBar
        leadCount={leads.length}
        geocodedCount={geocodedCount}
        onReset={handleReset}
      />

      <div className="map-area">
        <MapView
          leads={leads}
          selectedId={selectedId}
          onSelectLead={handleSelectLead}
        />

        {geocoding && (
          <GeocodingProgress
            done={geocodeDone}
            total={leads.length}
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
