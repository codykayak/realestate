import { useRef, useState } from 'react';
import { parseFilePreview, buildLeadsFromImport } from '../utils/parseCSV';
import ColumnMapStep from './ColumnMapStep';
import styles from './UploadScreen.module.css';

const ACCEPTED_TYPES = ['.csv', '.xlsx', '.xls', '.xlsm'];

function isAcceptedFile(file) {
  const name = file.name.toLowerCase();
  return ACCEPTED_TYPES.some((ext) => name.endsWith(ext));
}

export default function UploadScreen({ onLeadsLoaded, listName }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  async function handleFile(file) {
    if (!file || !isAcceptedFile(file)) {
      setError('Please upload a CSV or Excel (.xlsx) file.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const result = await parseFilePreview(file);
      if (!result.rows.length) {
        setError('The file appears to be empty or has no data rows.');
        return;
      }
      setPreview(result);
    } catch (e) {
      setError(e.message ?? 'Failed to parse file. Check the format and try again.');
    } finally {
      setLoading(false);
    }
  }

  function onInputChange(e) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  }

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  async function handleConfirmColumns(selectedHeaders) {
    if (!preview) return;
    setLoading(true);
    setError(null);
    try {
      const leads = buildLeadsFromImport({
        rows: preview.rows,
        headers: preview.headers,
        selectedHeaders,
        startId: 0,
      });
      onLeadsLoaded({
        leads,
        fieldMap: preview.autoFieldMap,
        headers: preview.headers,
        selectedHeaders,
        fileName: preview.fileName,
        listName: listName || preview.fileName?.replace(/\.[^.]+$/, '') || 'New list',
        previewRows: preview.rows.slice(0, 10),
      });
      setPreview(null);
    } catch (e) {
      setError(e.message ?? 'Import failed.');
    } finally {
      setLoading(false);
    }
  }

  if (preview) {
    return (
      <div className={styles.screen}>
        <div className={styles.card}>
          <ColumnMapStep
            fileName={preview.fileName}
            headers={preview.headers}
            autoFieldMap={preview.autoFieldMap}
            previewRows={preview.rows}
            onBack={() => setPreview(null)}
            onConfirm={handleConfirmColumns}
            busy={loading}
          />
          {error && <p className={styles.error}>{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.screen}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"
              stroke="#58a6ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="10" r="3" stroke="#58a6ff" strokeWidth="1.5"/>
          </svg>
        </div>
        <h1 className={styles.title}>Motivated Seller Map</h1>
        <p className={styles.subtitle}>Upload a CSV or Excel file — pick columns on the next step</p>

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
            accept=".csv,.xlsx,.xls,.xlsm"
            className={styles.fileInput}
            onChange={onInputChange}
          />
          {loading ? (
            <div className={styles.loadingState}>
              <span className={styles.spinner} />
              <p className={styles.loadingText}>Reading file…</p>
            </div>
          ) : (
            <>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className={styles.uploadIcon}>
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="17 8 12 3 7 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="12" y1="3" x2="12" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <p className={styles.dropText}>
                {dragging ? 'Drop it here' : 'Drag & drop or tap to browse'}
              </p>
              <p className={styles.dropHint}>
                Homeowners, attorneys, property managers — any column layout
              </p>
            </>
          )}
        </div>

        {error && <p className={styles.error}>{error}</p>}
      </div>
    </div>
  );
}
