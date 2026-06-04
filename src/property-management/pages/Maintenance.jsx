import { useState } from 'react';
import { usePm } from '../context/PmContext';
import Page from '../components/Page';
import Icon from '../components/Icon';
import { triageRequest } from '../lib/maintenanceTriage';
import styles from '../pm.module.css';

const PRIORITY_BADGE = {
  emergency: styles.badgeRed,
  high: styles.badgeAmber,
  normal: styles.badgeBlue,
  low: styles.badgeGray,
};
const STATUS_LABEL = {
  open: 'Open',
  dispatched: 'Dispatched',
  'self-help-sent': 'Self-help sent',
  closed: 'Closed',
};

export default function Maintenance() {
  const { workOrders, upsertWorkOrder, residents, featureMap } = usePm();
  const cfg = featureMap.maintenance?.config || {};
  const [adding, setAdding] = useState(false);
  const [resident, setResident] = useState(residents[0]?.name || '');
  const [unit, setUnit] = useState(residents[0]?.unit || '');
  const [issue, setIssue] = useState('');
  const [preview, setPreview] = useState(null);

  function runTriage(text) {
    setIssue(text);
    setPreview(text.trim() ? triageRequest(text, cfg) : null);
  }

  function submit(e) {
    e.preventDefault();
    if (!issue.trim()) return;
    const t = triageRequest(issue, cfg);
    upsertWorkOrder({
      resident,
      unit,
      issue: issue.trim(),
      category: t.category,
      priority: t.priority,
      status: t.recommendedStatus,
      selfHelp: t.selfHelp || '',
      routing: t.routing,
      createdAt: Date.now(),
    });
    setIssue(''); setPreview(null); setAdding(false);
  }

  function setStatus(wo, status) {
    upsertWorkOrder({ ...wo, status });
  }

  return (
    <Page
      title="AI Maintenance Triage"
      subtitle="Auto-classify, detect emergencies, deflect with self-help, and route to the right queue"
      actions={<button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => setAdding((v) => !v)}><Icon name="plus" size={15} /> New request</button>}
    >
      {adding && (
        <form className={styles.card} style={{ marginBottom: 18 }} onSubmit={submit}>
          <div className={`${styles.grid} ${styles.cols2}`}>
            <div className={styles.field}>
              <label className={styles.label}>Resident</label>
              <select className={styles.select} value={resident} onChange={(e) => {
                setResident(e.target.value);
                const r = residents.find((x) => x.name === e.target.value);
                if (r) setUnit(r.unit);
              }}>
                {residents.map((r) => <option key={r.id} value={r.name}>{r.name}</option>)}
              </select>
            </div>
            <div className={styles.field}><label className={styles.label}>Unit</label><input className={styles.input} value={unit} onChange={(e) => setUnit(e.target.value)} /></div>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Describe the issue (as a resident would text it)</label>
            <textarea className={styles.textarea} value={issue} onChange={(e) => runTriage(e.target.value)} placeholder="e.g. my garbage disposal just hums and won't spin / I smell gas in the kitchen" />
          </div>
          {preview && (
            <div className={`${styles.banner} ${preview.isEmergency ? styles.bannerRed : ''}`} style={{ marginBottom: 12 }}>
              <Icon name={preview.isEmergency ? 'alert' : 'spark'} size={16} style={{ marginTop: 1 }} />
              <div>
                <strong>AI triage:</strong> {preview.category} · <span className={`${styles.badge} ${PRIORITY_BADGE[preview.priority]}`}>{preview.priority}</span>
                <div style={{ marginTop: 4 }}>{preview.routing}</div>
                {preview.selfHelp && <div style={{ marginTop: 6 }}><strong>Self-help suggested:</strong> {preview.selfHelp}</div>}
              </div>
            </div>
          )}
          <div className={styles.rowWrap}>
            <button className={`${styles.btn} ${styles.btnPrimary}`} type="submit">Create work order</button>
            <button className={`${styles.btn} ${styles.btnGhost}`} type="button" onClick={() => { setAdding(false); setPreview(null); }}>Cancel</button>
          </div>
        </form>
      )}

      <div className={styles.card}>
        <table className={styles.table}>
          <thead>
            <tr><th>Unit / Resident</th><th>Issue</th><th>Category</th><th>Priority</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {workOrders.length === 0 && <tr><td colSpan={6}><div className={styles.empty}>No work orders.</div></td></tr>}
            {workOrders.map((wo) => (
              <tr key={wo.id}>
                <td><strong>{wo.unit}</strong><div className={styles.itemSub}>{wo.resident}</div></td>
                <td style={{ maxWidth: 300 }}>{wo.issue}{wo.selfHelp && <div className={styles.hint} style={{ marginTop: 4 }}>Self-help sent to resident.</div>}</td>
                <td>{wo.category}</td>
                <td><span className={`${styles.badge} ${PRIORITY_BADGE[wo.priority] || styles.badgeGray}`}>{wo.priority}</span></td>
                <td><span className={`${styles.badge} ${wo.status === 'closed' ? styles.badgeGreen : styles.badgeGray}`}>{STATUS_LABEL[wo.status] || wo.status}</span></td>
                <td>
                  {wo.status !== 'closed'
                    ? <button className={`${styles.btn} ${styles.btnSm}`} onClick={() => setStatus(wo, 'closed')}>Close</button>
                    : <button className={`${styles.btn} ${styles.btnSm} ${styles.btnGhost}`} onClick={() => setStatus(wo, 'open')}>Reopen</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {cfg.emergencyAlerts && (
        <div className={styles.banner} style={{ marginTop: 18 }}>
          <Icon name="shield" size={16} style={{ marginTop: 1 }} />
          <div>Emergency detection is <strong>on</strong>: requests mentioning gas, fire, flooding, no-heat, sewage, or lockouts are flagged <span className={`${styles.badge} ${styles.badgeRed}`}>emergency</span> and escalated for immediate dispatch.</div>
        </div>
      )}
    </Page>
  );
}
