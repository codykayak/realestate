import { useMemo, useState } from 'react';
import { usePm } from '../context/PmContext';
import Page from '../components/Page';
import Icon from '../components/Icon';
import { prescreenApplicant } from '../lib/prescreen';
import styles from '../pm.module.css';

const STAGES = [
  { id: 'new', label: 'New Lead' },
  { id: 'prescreen', label: 'Pre-Screen' },
  { id: 'tour', label: 'Tour' },
  { id: 'application', label: 'Application' },
  { id: 'leased', label: 'Approved' },
];

const DECISION_BADGE = {
  qualified: styles.badgeGreen,
  review: styles.badgeAmber,
  declined: styles.badgeRed,
};

export default function Leasing() {
  const { leasingLeads, upsertLeasingLead, featureMap } = usePm();
  const cfg = useMemo(() => featureMap.leasing?.config || {}, [featureMap]);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: '', unitType: '1BR', income: '', credit: '', rent: '', pets: false });

  const screened = useMemo(
    () => leasingLeads.map((l) => ({
      ...l,
      screen: prescreenApplicant({ ...l, targetRent: l.rent }, cfg),
    })),
    [leasingLeads, cfg],
  );

  function advance(lead) {
    const idx = STAGES.findIndex((s) => s.id === lead.stage);
    const next = STAGES[Math.min(idx + 1, STAGES.length - 1)].id;
    upsertLeasingLead({ ...lead, stage: next });
  }

  function addLead(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    upsertLeasingLead({
      name: form.name.trim(),
      unitType: form.unitType,
      income: Number(form.income) || 0,
      credit: Number(form.credit) || 0,
      rent: Number(form.rent) || 0,
      pets: form.pets,
      stage: 'new',
      createdAt: Date.now(),
    });
    setForm({ name: '', unitType: '1BR', income: '', credit: '', rent: '', pets: false });
    setAdding(false);
  }

  return (
    <Page
      title="Automated Leasing"
      subtitle={`Auto pre-screen rules: income ≥ ${cfg.incomeToRentMultiple ?? 3}× rent · credit ≥ ${cfg.minCreditScore ?? 620} · pets ${cfg.petsAllowed ? 'allowed' : 'not allowed'}`}
      actions={<button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => setAdding((v) => !v)}><Icon name="plus" size={15} /> New applicant</button>}
    >
      {adding && (
        <form className={styles.card} style={{ marginBottom: 18 }} onSubmit={addLead}>
          <div className={`${styles.grid} ${styles.cols3}`}>
            <div className={styles.field}><label className={styles.label}>Name</label><input className={styles.input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className={styles.field}><label className={styles.label}>Unit type</label>
              <select className={styles.select} value={form.unitType} onChange={(e) => setForm({ ...form, unitType: e.target.value })}>
                <option>Studio</option><option>1BR</option><option>2BR</option><option>3BR</option>
              </select>
            </div>
            <div className={styles.field}><label className={styles.label}>Monthly income ($)</label><input className={styles.input} type="number" value={form.income} onChange={(e) => setForm({ ...form, income: e.target.value })} /></div>
            <div className={styles.field}><label className={styles.label}>Credit score</label><input className={styles.input} type="number" value={form.credit} onChange={(e) => setForm({ ...form, credit: e.target.value })} /></div>
            <div className={styles.field}><label className={styles.label}>Target rent ($)</label><input className={styles.input} type="number" value={form.rent} onChange={(e) => setForm({ ...form, rent: e.target.value })} /></div>
            <div className={styles.field} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 22 }}>
              <input id="pets" type="checkbox" checked={form.pets} onChange={(e) => setForm({ ...form, pets: e.target.checked })} />
              <label htmlFor="pets" className={styles.label} style={{ margin: 0 }}>Has pets</label>
            </div>
          </div>
          <div className={styles.rowWrap}>
            <button className={`${styles.btn} ${styles.btnPrimary}`} type="submit">Add & auto-screen</button>
            <button className={`${styles.btn} ${styles.btnGhost}`} type="button" onClick={() => setAdding(false)}>Cancel</button>
          </div>
        </form>
      )}

      <div className={styles.pipeline}>
        {STAGES.map((stage) => {
          const items = screened.filter((l) => l.stage === stage.id);
          return (
            <div key={stage.id} className={styles.pipeCol}>
              <div className={styles.pipeHead}><span>{stage.label}</span><span>{items.length}</span></div>
              {items.map((lead) => (
                <div key={lead.id} className={styles.pipeCard}>
                  <div className={styles.row} style={{ justifyContent: 'space-between' }}>
                    <strong style={{ fontSize: 13.5 }}>{lead.name}</strong>
                    <span className={`${styles.badge} ${DECISION_BADGE[lead.screen.decision]}`}>{lead.screen.decision}</span>
                  </div>
                  <div className={styles.itemSub}>{lead.unitType} · ${Number(lead.income).toLocaleString()}/mo · {lead.credit || '—'} credit</div>
                  <div className={styles.hint} style={{ margin: '6px 0' }}>{lead.screen.summary}</div>
                  {stage.id !== 'leased' && (
                    <button className={`${styles.btn} ${styles.btnSm}`} style={{ width: '100%' }} onClick={() => advance(lead)}>
                      Advance →
                    </button>
                  )}
                </div>
              ))}
              {items.length === 0 && <div className={styles.hint} style={{ textAlign: 'center', padding: 10 }}>—</div>}
            </div>
          );
        })}
      </div>

      <div className={styles.sectionTitle}>Application audit (fraud screening)</div>
      <div className={styles.card}>
        <div className={styles.hint}>
          When a real screening provider (e.g. TransUnion SmartMove) is connected in <strong>Settings → Integrations</strong>,
          this is where verified credit/criminal/eviction results and <strong>document-fraud checks</strong> appear —
          cross-checking pay stubs against bank deposits, validating employers, and flagging edited PDFs or identity
          mismatches before a human ever reviews the file.
        </div>
      </div>
    </Page>
  );
}
