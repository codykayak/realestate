import { useState, useEffect } from 'react';
import { DEFAULT_MISSED_TEMPLATE, DEFAULT_TEMPLATES } from '../utils/smsTemplates';
import { validateQuoFields } from '../utils/callableError';
import styles from './TwilioOnboarding.module.css';

const STEPS = ['welcome', 'credentials', 'templates', 'done'];

export default function QuoOnboarding({
  open,
  onClose,
  config,
  saveConfig,
  testCredentials,
  embedded = false,
}) {
  const [step, setStep] = useState(0);
  const [apiKey, setApiKey] = useState(config?.apiKey ?? '');
  const [phoneNumber, setPhoneNumber] = useState(config?.phoneNumber ?? '');
  const [phoneNumberId, setPhoneNumberId] = useState(config?.phoneNumberId ?? '');
  const [agentName, setAgentName] = useState(config?.agentName ?? 'Macro REI');
  const [templates, setTemplates] = useState(config?.templates ?? DEFAULT_TEMPLATES);
  const [missedTpl, setMissedTpl] = useState(config?.missedCallTemplate ?? DEFAULT_MISSED_TEMPLATE);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    if (!open && !embedded) return;
    setApiKey(config?.apiKey ?? '');
    setPhoneNumber(config?.phoneNumber ?? '');
    setPhoneNumberId(config?.phoneNumberId ?? '');
    setAgentName(config?.agentName ?? 'Macro REI');
    setTemplates(config?.templates ?? DEFAULT_TEMPLATES);
    setMissedTpl(config?.missedCallTemplate ?? DEFAULT_MISSED_TEMPLATE);
    if (config?.onboardingComplete) setStep(STEPS.indexOf('done'));
    else setStep(0);
  }, [open, embedded, config]);

  if (!open && !embedded) return null;

  const stepId = STEPS[step];
  const progress = ((step + 1) / STEPS.length) * 100;

  async function persistCredentials() {
    await saveConfig({
      apiKey: apiKey.trim(),
      phoneNumber,
      phoneNumberId: phoneNumberId.trim(),
      agentName,
    });
  }

  async function handleSaveCredentials() {
    setErr(null);
    setNotice(null);
    const validationErr = validateQuoFields({ apiKey, phoneNumber, phoneNumberId });
    if (validationErr) {
      setErr(validationErr);
      return;
    }
    setBusy(true);
    try {
      await persistCredentials();
      setStep(STEPS.indexOf('templates'));
    } catch (e) {
      setErr(e.message || 'Could not save settings.');
    } finally {
      setBusy(false);
    }
  }

  async function handleTestCredentials() {
    setErr(null);
    setNotice(null);
    const validationErr = validateQuoFields({ apiKey, phoneNumber, phoneNumberId });
    if (validationErr) {
      setErr(validationErr);
      return;
    }
    setBusy(true);
    try {
      const result = await testCredentials({ apiKey, phoneNumber, phoneNumberId });
      await persistCredentials();
      setStep(STEPS.indexOf('templates'));
      if (result?.phoneWarning) setNotice(result.phoneWarning);
    } catch (e) {
      setErr(e.message || 'Credentials check failed.');
      setNotice('You can still save without verifying — tap Save & continue.');
    } finally {
      setBusy(false);
    }
  }

  async function handleSaveTemplates() {
    setBusy(true);
    try {
      await saveConfig({
        apiKey,
        phoneNumber,
        phoneNumberId,
        agentName,
        templates,
        missedCallTemplate: missedTpl,
        onboardingComplete: true,
      });
      setStep(STEPS.indexOf('done'));
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  const body = (
    <>
      {!embedded && (
        <>
          <header className={styles.header}>
            <div>
              <h2 className={styles.title}>Quo Setup</h2>
              <p className={styles.sub}>Step {step + 1} of {STEPS.length}</p>
            </div>
            <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
          </header>
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>
        </>
      )}

      <div className={styles.body}>
        {err && <p className={styles.error}>{err}</p>}
        {notice && <p className={styles.notice}>{notice}</p>}

        {stepId === 'welcome' && (
          <>
            <p className={styles.lead}>
              Connect Quo to send templated texts from the Dialer and launch calls through the Quo app on your phone.
            </p>
            <ul className={styles.checklist}>
              <li>Quo workspace with API access (<a href="https://www.quo.com/docs/mdx/api-reference/authentication" target="_blank" rel="noopener noreferrer">API docs</a>)</li>
              <li>API key from Quo → Workspace Settings → API</li>
              <li>Your Quo business phone number</li>
            </ul>
            <button type="button" className={styles.primaryBtn} onClick={() => setStep(1)}>
              Enter Quo credentials →
            </button>
            <button type="button" className={styles.secondaryBtn} onClick={onClose}>
              Skip — use my phone for now
            </button>
          </>
        )}

        {stepId === 'credentials' && (
          <>
            <label className={styles.label}>
              Quo API key
              <input className={styles.input} type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value.trim())} placeholder="Paste API key" autoComplete="off" />
            </label>
            <label className={styles.label}>
              Quo phone number (sends texts &amp; calls)
              <input className={styles.input} type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="+15413212630" />
            </label>
            <label className={styles.label}>
              Phone Number ID (optional — PN… from Quo)
              <input className={styles.input} value={phoneNumberId} onChange={(e) => setPhoneNumberId(e.target.value.trim())} placeholder="PNxxxxxxxx" autoComplete="off" />
            </label>
            <label className={styles.label}>
              Your name in texts
              <input className={styles.input} value={agentName} onChange={(e) => setAgentName(e.target.value)} placeholder="Cody" />
            </label>
            <p className={styles.hint}>
              Credentials save to your account. Verify is optional and needs Cloud Functions deployed.
            </p>
            <button
              type="button"
              className={styles.primaryBtn}
              disabled={busy || !apiKey || (!phoneNumber && !phoneNumberId)}
              onClick={handleSaveCredentials}
            >
              {busy ? 'Saving…' : 'Save & continue →'}
            </button>
            <button
              type="button"
              className={styles.secondaryBtn}
              disabled={busy || !apiKey || (!phoneNumber && !phoneNumberId)}
              onClick={handleTestCredentials}
            >
              {busy ? 'Verifying…' : 'Save & verify with Quo (optional)'}
            </button>
          </>
        )}

        {stepId === 'templates' && (
          <>
            <p className={styles.lead}>Customize your Dialer templates. Use {'{{firstName}}'}, {'{{address}}'}, {'{{agentName}}'}.</p>
            {templates.map((t, i) => (
              <label key={t.id} className={styles.label}>
                Template {i + 1}: {t.label}
                <textarea
                  className={styles.textarea}
                  rows={3}
                  value={t.body}
                  onChange={(e) => {
                    const next = [...templates];
                    next[i] = { ...t, body: e.target.value };
                    setTemplates(next);
                  }}
                />
              </label>
            ))}
            <label className={styles.label}>
              Missed callback template (reference)
              <textarea
                className={styles.textarea}
                rows={3}
                value={missedTpl.body}
                onChange={(e) => setMissedTpl({ ...missedTpl, body: e.target.value })}
              />
            </label>
            <button type="button" className={styles.primaryBtn} disabled={busy} onClick={handleSaveTemplates}>
              Complete setup ✓
            </button>
          </>
        )}

        {stepId === 'done' && (
          <>
            <div className={styles.successIcon}>✓</div>
            <p className={styles.lead}>
              Quo is connected. Use <strong>Call</strong> and <strong>Txt Now</strong> in the Dialer — calls open the Quo app on mobile; texts send through the Quo API.
            </p>
            <button type="button" className={styles.primaryBtn} onClick={onClose}>
              Start dialing
            </button>
          </>
        )}
      </div>

      {step > 0 && stepId !== 'done' && !embedded && (
        <footer className={styles.footer}>
          <button type="button" className={styles.backBtn} onClick={() => setStep((s) => Math.max(0, s - 1))}>
            ← Back
          </button>
        </footer>
      )}
    </>
  );

  if (embedded) return body;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Quo setup">
      <div className={styles.sheet}>{body}</div>
    </div>
  );
}
