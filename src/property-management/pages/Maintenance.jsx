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
  const { workOrders, upsertWorkOrder, residents, featureMap, setFeatureConfig } = usePm();
  const cfg = featureMap.maintenance?.config || {};
  const technicians = cfg.technicians || [];
  const onCall = technicians.find((t) => t.id === cfg.onCallTechId) || technicians[0];
  const [adding, setAdding] = useState(false);
  const [resident, setResident] = useState(residents[0]?.name || '');
  const [unit, setUnit] = useState(residents[0]?.unit || '');
  const [issue, setIssue] = useState('');
  const [preview, setPreview] = useState(null);
  const [newTechName, setNewTechName] = useState('');

  function runTriage(text) {
    setIssue(text);
    setPreview(text.trim() ? triageRequest(text, cfg) : null);
  }

  function setOnCallTech(id) {
    setFeatureConfig('maintenance', { onCallTechId: id });
  }

  function addTechnician() {
    const name = newTechName.trim();
    if (!name) return;
    const id = `tech_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const next = [...technicians, { id, name, phone: '' }];
    setFeatureConfig('maintenance', {
      technicians: next,
      onCallTechId: cfg.onCallTechId || id,
    });
    setNewTechName('');
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
      onCallTech: t.onCallTech,
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
      subtitle="Auto-classify, detect emergencies, deflect with self-help, and route to the on-call tech"
      actions={<button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => setAdding((v) => !v)}><Icon name="plus" size={15} /> New request</button>}
    >
      <div className={styles.card} style={{ marginBottom: 18 }}>
        <div className={styles.cardTitle}>On-call maintenance</div>
        <p className={styles.hint} style={{ marginBottom: 12 }}>
          Select who receives <strong>emergency</strong> calls. When AI detects gas, fire, flooding, no heat, or
          similar issues, calls are forwarded to this technician labeled <strong>EMERGENCY</strong>.
        </p>
        <div className={`${styles.grid} ${styles.cols2}`}>
          <div className={styles.field}>
            <label className={styles.label}>On-call tech</label>
            <select
              className={styles.select}
              value={cfg.onCallTechId || ''}
              onChange={(e) => setOnCallTech(e.target.value)}
              disabled={!technicians.length}
            >
              {!technicians.length && <option value="">No technicians — add below</option>}
              {technicians.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Add technician</label>
            <div className={styles.rowWrap}>
              <input
                className={styles.input}
                value={newTechName}
                onChange={(e) => setNewTechName(e.target.value)}
                placeholder="Technician name"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnician())}
              />
              <button type="button" className={`${styles.btn} ${styles.btnSm}`} onClick={addTechnician}>Add</button>
            </div>
          </div>
        </div>
        {onCall && (
          <div className={`${styles.banner} ${styles.bannerRed}`} style={{ marginTop: 12 }}>
            <Icon name="alert" size={16} style={{ marginTop: 1 }} />
            <div>
              Emergency calls will be forwarded to <strong>{onCall.name}</strong>
              {onCall.phone ? ` at ${onCall.phone}` : ''} — labeled <strong>EMERGENCY</strong>.
            </div>
          </div>
        )}
      </div>

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
                <td style={{ maxWidth: 300 }}>
                  {wo.issue}
                  {wo.onCallTech && <div className={styles.hint} style={{ marginTop: 4 }}>On-call: {wo.onCallTech}</div>}
                  {wo.selfHelp && <div className={styles.hint} style={{ marginTop: 4 }}>Self-help sent to resident.</div>}
                </td>
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
          <div>
            Emergency detection is <strong>on</strong>: requests mentioning gas, fire, flooding, no-heat, sewage, or
            lockouts are flagged <span className={`${styles.badge} ${styles.badgeRed}`}>emergency</span> and routed to
            the on-call tech.
          </div>
        </div>
      )}
    </Page>
  );
}
