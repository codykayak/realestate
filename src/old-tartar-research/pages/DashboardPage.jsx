import { useState } from 'react';
import { useTartar } from '../context/TartarContext';
import { CreditBalance } from '../components/AppCard';
import { tartarApi } from '../lib/tartarApi';
import styles from '../tartar.module.css';

export default function DashboardPage() {
  const { profile, sources, customBuild, refresh } = useTartar();
  const [busy, setBusy] = useState(false);
  const [lastJob, setLastJob] = useState(null);
  const [anomalyCount, setAnomalyCount] = useState(null);

  const enabledSources = sources.filter((s) => s.enabled);

  async function runIngestion() {
    setBusy(true);
    try {
      const res = await tartarApi.startIngestion({
        sourceIds: customBuild?.enabledSourceIds?.length
          ? customBuild.enabledSourceIds
          : enabledSources.map((s) => s.id),
        searchTerms: ['Tartaria', 'Tartary', 'architect', 'builder'],
        aiProvider: profile?.defaultAiProvider ?? 'gemini',
      });
      setLastJob(res.data);
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  async function runAnomalies() {
    setBusy(true);
    try {
      const res = await tartarApi.detectAnomalies(customBuild?.anomalyRules ?? {});
      setAnomalyCount(res.data.count);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <h1 className={styles.pageTitle}>Research dashboard</h1>
      <p className={styles.pageSub}>
        Ingest archival sources, extract entity mentions, and detect statistical anomalies in narrow time windows.
      </p>

      <div className={styles.statRow}>
        <CreditBalance />
        <div className={styles.stat}>
          <div className={styles.statVal}>{enabledSources.length}</div>
          <div className={styles.statLabel}>Active sources</div>
        </div>
        <div className={styles.stat}>
          <div className={styles.statVal}>{customBuild?.name ? '✓' : '—'}</div>
          <div className={styles.statLabel}>Custom build</div>
        </div>
        {anomalyCount != null && (
          <div className={styles.stat}>
            <div className={styles.statVal}>{anomalyCount}</div>
            <div className={styles.statLabel}>Anomalies flagged</div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={runIngestion} disabled={busy}>
          {busy ? 'Running…' : 'Start ingestion'}
        </button>
        <button type="button" className={styles.btn} onClick={runAnomalies} disabled={busy}>
          Detect anomalies
        </button>
      </div>

      {lastJob && (
        <div className={`${styles.alert} ${styles.alertInfo}`}>
          Job {lastJob.jobId}: processed {lastJob.itemsProcessed ?? 0} items, extracted {lastJob.mentionsExtracted ?? 0} mentions.
        </div>
      )}
    </>
  );
}
