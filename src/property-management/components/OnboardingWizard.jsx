import { useState } from 'react';
import Icon from './Icon';
import styles from '../pm.module.css';

const STEPS = ['welcome', 'company', 'data', 'maintenance', 'done'];

export default function OnboardingWizard({ open, onClose, onComplete, defaultTechnicians }) {
  const [step, setStep] = useState(0);
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [propertyName, setPropertyName] = useState('');
  const [propertyUnits, setPropertyUnits] = useState('');
  const [spreadsheetName, setSpreadsheetName] = useState('');
  const [techInput, setTechInput] = useState('');
  const [technicians, setTechnicians] = useState(defaultTechnicians || []);
  const [onCallTechId, setOnCallTechId] = useState(defaultTechnicians?.[0]?.id || '');

  if (!open) return null;

  const stepId = STEPS[step];
  const onCall = technicians.find((t) => t.id === onCallTechId) || technicians[0];

  function addTech() {
    const name = techInput.trim();
    if (!name) return;
    const id = `tech_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const next = [...technicians, { id, name, phone: '' }];
    setTechnicians(next);
    if (!onCallTechId) setOnCallTechId(id);
    setTechInput('');
  }

  function removeTech(id) {
    const next = technicians.filter((t) => t.id !== id);
    setTechnicians(next);
    if (onCallTechId === id) setOnCallTechId(next[0]?.id || '');
  }

  function finish() {
    onComplete({
      companyName: companyName.trim() || 'My Portfolio',
      contactName: contactName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      spreadsheetName: spreadsheetName.trim(),
      properties: propertyName.trim()
        ? [{ name: propertyName.trim(), units: Number(propertyUnits) || 0 }]
        : [],
      technicians,
      onCallTechId: onCallTechId || technicians[0]?.id || null,
    });
    onClose();
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Onboarding">
      <div className={styles.modal} style={{ maxWidth: 560 }}>
        <div className={styles.modalHead}>
          <div>
            <div className={styles.pageTitle}>Onboarding</div>
            <div className={styles.pageSub}>Step {step + 1} of {STEPS.length}</div>
          </div>
          <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={onClose} aria-label="Close">✕</button>
        </div>

        {stepId === 'welcome' && (
          <>
            <p className={styles.hint} style={{ fontSize: 14, marginBottom: 14 }}>
              <strong>How ManyDoors AI works</strong>
            </p>
            <ul className={styles.onboardList}>
              <li>
                <strong>Maintenance triage</strong> — Residents describe issues in plain language. AI classifies
                urgency, suggests self-help when safe, and routes <strong>emergencies</strong> to your on-call tech.
              </li>
              <li>
                <strong>Emergency forwarding</strong> — When a request mentions gas, fire, flooding, no heat, etc.,
                calls are forwarded to the tech you select as <strong>On-call tech</strong>, labeled <strong>EMERGENCY</strong>.
              </li>
              <li>
                <strong>Sample data</strong> — Upload a spreadsheet or enter a property name so the dashboard reflects
                your portfolio during the demo.
              </li>
            </ul>
            <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => setStep(1)}>
              Continue →
            </button>
          </>
        )}

        {stepId === 'company' && (
          <>
            <div className={styles.field}>
              <label className={styles.label}>Company / portfolio name</label>
              <input className={styles.input} value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="e.g. Maple Grove Residential" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Your name</label>
              <input className={styles.input} value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Property manager" />
            </div>
            <div className={`${styles.grid} ${styles.cols2}`}>
              <div className={styles.field}>
                <label className={styles.label}>Phone (for call forwarding)</label>
                <input className={styles.input} type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(541) 555-0100" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Email</label>
                <input className={styles.input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
              </div>
            </div>
            <div className={styles.rowWrap} style={{ marginTop: 16 }}>
              <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => setStep(2)}>Next →</button>
              <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={() => setStep(0)}>Back</button>
            </div>
          </>
        )}

        {stepId === 'data' && (
          <>
            <p className={styles.hint} style={{ marginBottom: 12 }}>
              Add a sample property or upload a resident/unit spreadsheet (.csv, .xlsx). Data stays in this browser until you connect Firebase.
            </p>
            <div className={`${styles.grid} ${styles.cols2}`}>
              <div className={styles.field}>
                <label className={styles.label}>Property name</label>
                <input className={styles.input} value={propertyName} onChange={(e) => setPropertyName(e.target.value)} placeholder="e.g. Riverbend Commons" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Units</label>
                <input className={styles.input} type="number" min="0" value={propertyUnits} onChange={(e) => setPropertyUnits(e.target.value)} placeholder="96" />
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Upload spreadsheet (optional)</label>
              <input
                className={styles.input}
                type="file"
                accept=".csv,.xlsx,.xls,.xlsm"
                onChange={(e) => setSpreadsheetName(e.target.files?.[0]?.name || '')}
              />
              {spreadsheetName && <p className={styles.hint} style={{ marginTop: 6 }}>Selected: {spreadsheetName}</p>}
            </div>
            <div className={styles.rowWrap} style={{ marginTop: 16 }}>
              <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => setStep(3)}>Next →</button>
              <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={() => setStep(1)}>Back</button>
            </div>
          </>
        )}

        {stepId === 'maintenance' && (
          <>
            <p className={styles.hint} style={{ marginBottom: 12 }}>
              Add maintenance technicians, then choose who is <strong>on call</strong>. Emergency maintenance calls
              will be forwarded to that person and labeled <strong>EMERGENCY</strong>.
            </p>
            <div className={styles.rowWrap} style={{ marginBottom: 12 }}>
              <input
                className={styles.input}
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                placeholder="Technician name"
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTech())}
              />
              <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={addTech}>
                <Icon name="plus" size={14} /> Add tech
              </button>
            </div>
            {technicians.length > 0 && (
              <ul className={styles.techList}>
                {technicians.map((t) => (
                  <li key={t.id} className={styles.techListItem}>
                    <span>{t.name}</span>
                    <button type="button" className={`${styles.btn} ${styles.btnSm} ${styles.btnGhost}`} onClick={() => removeTech(t.id)}>Remove</button>
                  </li>
                ))}
              </ul>
            )}
            <div className={styles.field} style={{ marginTop: 14 }}>
              <label className={styles.label}>On-call tech</label>
              <select
                className={styles.select}
                value={onCallTechId}
                onChange={(e) => setOnCallTechId(e.target.value)}
                disabled={!technicians.length}
              >
                {!technicians.length && <option value="">Add a technician first</option>}
                {technicians.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            {onCall && (
              <div className={`${styles.banner} ${styles.bannerRed}`} style={{ marginTop: 12 }}>
                <Icon name="alert" size={16} style={{ marginTop: 1 }} />
                <div>
                  Emergency calls will be forwarded to <strong>{onCall.name}</strong> and labeled{' '}
                  <strong>EMERGENCY</strong> for immediate dispatch.
                </div>
              </div>
            )}
            <div className={styles.rowWrap} style={{ marginTop: 16 }}>
              <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => setStep(4)} disabled={!technicians.length}>
                Finish →
              </button>
              <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={() => setStep(2)}>Back</button>
            </div>
          </>
        )}

        {stepId === 'done' && (
          <>
            <div className={styles.onboardDoneIcon}>✓</div>
            <p style={{ fontSize: 15, lineHeight: 1.5, marginBottom: 16 }}>
              <strong>{companyName || 'Your portfolio'}</strong> is ready. Explore the dashboard, try maintenance
              triage with an emergency phrase, and connect integrations in Settings when you are ready.
            </p>
            <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={finish}>
              Go to dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}
