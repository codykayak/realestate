import { useRef, useState } from 'react';
import { parseCSV } from '../utils/parseCSV';
import styles from './UploadScreen.module.css';

export default function UploadScreen({ onLeadsLoaded }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleFile(file) {
    if (!file || !file.name.toLowerCase().endsWith('.csv')) {
      setError('Please upload a CSV file.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const result = await parseCSV(file);
      onLeadsLoaded(result);
    } catch (e) {
      setError(e.message ?? 'Failed to parse CSV.');
    } finally {
      setLoading(false);
    }
  }

  function onInputChange(e) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div className={styles.screen}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="#58a6ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="10" r="3" stroke="#58a6ff" strokeWidth="1.5"/>
          </svg>
        </div>
        <h1 className={styles.title}>Motivated Seller Map</h1>
        <p className={styles.subtitle}>Upload a CSV of leads to plot them on the map</p>

        <div
          className={`${styles.dropzone} ${dragging ? styles.dragging : ''}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            className={styles.fileInput}
            onChange={onInputChange}
          />
          {loading ? (
            <span className={styles.spinner} />
          ) : (
            <>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className={styles.uploadIcon}>
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="17 8 12 3 7 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <p className={styles.dropText}>
                {dragging ? 'Drop it here' : 'Drag & drop your CSV or click to browse'}
              </p>
              <p className={styles.dropHint}>Flexible column names — address, name, phone, price, and more</p>
            </>
          )}
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.exampleBox}>
          <p className={styles.exampleTitle}>Supported columns (any order, any name variation):</p>
          <div className={styles.tags}>
            {['address', 'city', 'state', 'zip', 'name / owner', 'phone', 'email', 'price', 'equity', 'status', 'notes'].map((t) => (
              <span key={t} className={styles.tag}>{t}</span>
            ))}
          </div>
          <p className={styles.exampleHint}>All other columns are preserved and shown in the detail panel.</p>
        </div>
      </div>
    </div>
  );
}
