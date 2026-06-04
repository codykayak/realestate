import { useRef, useState } from 'react';
import { usePm } from '../context/PmContext';
import Page from '../components/Page';
import Icon from '../components/Icon';
import { importResidentsFromFile } from '../integrations/adapters/fileImport';
import styles from '../pm.module.css';

export default function Residents() {
  const { residents, replaceResidents } = usePm();
  const fileRef = useRef(null);
  const [importing, setImporting] = useState(false);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true); setMsg(null); setErr(null);
    try {
      const imported = await importResidentsFromFile(file);
      // Merge: keep existing + append imported (deduped by name+unit)
      const seen = new Set(residents.map((r) => `${r.name}|${r.unit}`));
      const merged = [...residents];
      let added = 0;
      for (const r of imported) {
        const k = `${r.name}|${r.unit}`;
        if (!seen.has(k)) { merged.push(r); seen.add(k); added += 1; }
      }
      replaceResidents(merged);
      setMsg(`Imported ${imported.length} row(s) from ${file.name} — ${added} new resident(s) added.`);
    } catch (e2) {
      setErr(e2.message || 'Import failed.');
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  return (
    <Page
      title="Residents & Units"
      subtitle={`${residents.length} residents · imported from CSV/Excel or a connected PMS`}
      actions={
        <>
          <input ref={fileRef} type="file" accept=".csv,.xls,.xlsx,.xlsm" style={{ display: 'none' }} onChange={handleFile} />
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => fileRef.current?.click()} disabled={importing}>
            <Icon name="upload" size={15} /> {importing ? 'Importing…' : 'Import CSV / Excel'}
          </button>
        </>
      }
    >
      {msg && <div className={styles.banner} style={{ marginBottom: 14 }}><Icon name="check" size={16} /><div>{msg}</div></div>}
      {err && <div className={`${styles.banner} ${styles.bannerRed}`} style={{ marginBottom: 14 }}><Icon name="alert" size={16} /><div>{err}</div></div>}

      <div className={styles.card}>
        <table className={styles.table}>
          <thead>
            <tr><th>Name</th><th>Unit</th><th>Property</th><th>Phone</th><th>Balance</th><th>Lease ends</th></tr>
          </thead>
          <tbody>
            {residents.length === 0 && <tr><td colSpan={6}><div className={styles.empty}>No residents yet — import a CSV or Excel file to get started.</div></td></tr>}
            {residents.map((r) => (
              <tr key={r.id}>
                <td><strong>{r.name}</strong><div className={styles.itemSub}>{r.email}</div></td>
                <td>{r.unit || '—'}</td>
                <td>{r.property || '—'}</td>
                <td>{r.phone || '—'}</td>
                <td>{Number(r.balance) > 0 ? <span className={`${styles.badge} ${styles.badgeAmber}`}>${Number(r.balance).toLocaleString()}</span> : <span className={`${styles.badge} ${styles.badgeGreen}`}>$0</span>}</td>
                <td>{r.leaseEnd || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.hint} style={{ marginTop: 14 }}>
        Accepts <strong>.csv, .xls, .xlsx</strong>. Common column names (name, unit, property, phone, email, balance, lease end) are matched automatically. This file import is the universal fallback that works before any PMS integration is live.
      </div>
    </Page>
  );
}
