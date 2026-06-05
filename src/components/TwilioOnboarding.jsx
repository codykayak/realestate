import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_MISSED_TEMPLATE, DEFAULT_TEMPLATES } from '../utils/smsTemplates';
import { validateTwilioFields } from '../utils/callableError';
import styles from './TwilioOnboarding.module.css';

const STEPS = ['welcome', 'credentials', 'webhooks', 'templates', 'test', 'done'];

export default function TwilioOnboarding({
  open,
  onClose,
  config,
  saveConfig,
  testCredentials,
  fetchWebhooks,
  webhooks,
  uid,
}) {
  const [step, setStep] = useState(0);
  const [accountSid, setAccountSid] = useState(config?.accountSid ?? '');
  const [authToken, setAuthToken] = useState(config?.authToken ?? '');
  const [phoneNumber, setPhoneNumber] = useState(config?.phoneNumber ?? '');
  const [agentPhone, setAgentPhone] = useState(config?.agentPhone ?? '');
  const [agentName, setAgentName] = useState(config?.agentName ?? 'Macro REI');
  const [templates, setTemplates] = useState(config?.templates ?? DEFAULT_TEMPLATES);
  const [missedTpl, setMissedTpl] = useState(config?.missedCallTemplate ?? DEFAULT_MISSED_TEMPLATE);
  const [ringSeconds, setRingSeconds] = useState(config?.ringSeconds ?? 25);
  const [autoMissed, setAutoMissed] = useState(config?.autoMissedCallSms !== false);
  const [testPhone, setTestPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [notice, setNotice] = useState(null);
  const [copied, setCopied] = useState('');

  useEffect(() => {
    if (!open) return;
    setAccountSid(config?.accountSid ?? '');
    setAuthToken(config?.authToken ?? '');
    setPhoneNumber(config?.phoneNumber ?? '');
    setAgentPhone(config?.agentPhone ?? '');
    setAgentName(config?.agentName ?? 'Macro REI');
    setTemplates(config?.templates ?? DEFAULT_TEMPLATES);
    setEmailTemplates(config?.emailTemplates ?? DEFAULT_EMAIL_TEMPLATES);
    setSendgridApiKey(config?.sendgridApiKey ?? '');
    setSendgridFromEmail(config?.sendgridFromEmail ?? '');
    setMissedTpl(config?.missedCallTemplate ?? DEFAULT_MISSED_TEMPLATE);
    setRingSeconds(config?.ringSeconds ?? 25);
    setAutoMissed(config?.autoMissedCallSms !== false);
    if (config?.onboardingComplete) setStep(STEPS.indexOf('done'));
    else setStep(0);
  }, [open, config]);

  useEffect(() => {
    if (open && step === STEPS.indexOf('webhooks') && uid) {
      fetchWebhooks?.();
    }
  }, [open, step, uid, fetchWebhooks]);

  const copyText = useCallback((label, text) => {
    navigator.clipboard?.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  }, []);

  async function saveCredentialsStep() {
    await saveConfig({
      accountSid: accountSid.trim(),
      authToken: authToken.trim(),
      phoneNumber,
      agentPhone,
      agentName,
      ringSeconds,
      autoMissedCallSms: autoMissed,
    });
    setStep(STEPS.indexOf('webhooks'));
  }

  async function handleTestCredentials() {
    setErr(null);
    setNotice(null);
    const validationErr = validateTwilioFields({ accountSid, authToken, phoneNumber, agentPhone });
    if (validationErr) {
      setErr(validationErr);
      return;
    }
    setBusy(true);
    try {
      const result = await testCredentials({ accountSid, authToken, phoneNumber });
      await saveCredentialsStep();
      if (result?.phoneWarning) {
        setErr(result.phoneWarning);
      }
    } catch (e) {
      const msg = e.message || 'Credentials check failed.';
      setErr(msg);
      setNotice('Your credentials were not verified. Use Save & continue below to save them and move to webhooks.');
    } finally {
      setBusy(false);
    }
  }

  async function handleSaveWithoutVerify() {
    setErr(null);
    setNotice(null);
    const validationErr = validateTwilioFields({ accountSid, authToken, phoneNumber, agentPhone });
    if (validationErr) {
      setErr(validationErr);
      return;
    }
    setBusy(true);
    try {
      await saveCredentialsStep();
      setNotice('Credentials saved. Finish webhooks and templates — deploy Cloud Functions before using Txt Now in production.');
    } catch (e) {
      setErr(e.message || 'Could not save settings.');
    } finally {
      setBusy(false);
    }
  }

  async function handleSaveTemplates() {
    setBusy(true);
    try {
      await saveConfig({
        accountSid,
        authToken,
        phoneNumber,
        agentPhone,
        agentName,
        templates,
        missedCallTemplate: missedTpl,
        ringSeconds,
        autoMissedCallSms: autoMissed,
      });
      setStep(STEPS.indexOf('test'));
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleFinish() {
    setBusy(true);
    try {
      await saveConfig({
        accountSid,
        authToken,
        phoneNumber,
        agentPhone,
        agentName,
        templates,
        missedCallTemplate: missedTpl,
        ringSeconds,
        autoMissedCallSms: autoMissed,
        onboardingComplete: true,
        voiceWebhookConfigured: true,
      });
      setStep(STEPS.indexOf('done'));
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (!open) return null;

  const stepId = STEPS[step];
  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Twilio setup">
      <div className={styles.sheet}>
        <header className={styles.header}>
          <div>
            <h2 className={styles.title}>Twilio SMS Setup</h2>
            <p className={styles.sub}>Step {step + 1} of {STEPS.length}</p>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </header>

        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>

        <div className={styles.body}>
          {err && <p className={styles.error}>{err}</p>}
          {notice && <p className={styles.notice}>{notice}</p>}

          {stepId === 'welcome' && (
            <>
              <p className={styles.lead}>
                Connect your own Twilio account to send texts from the Dialer and auto-reply when you miss a callback.
              </p>
              <ul className={styles.checklist}>
                <li>Twilio account (<a href="https://www.twilio.com/try-twilio" target="_blank" rel="noopener noreferrer">free trial</a> works)</li>
                <li>A Twilio phone number with SMS + Voice</li>
                <li>Your cell number (rings on inbound calls)</li>
              </ul>
              <button type="button" className={styles.primaryBtn} onClick={() => setStep(1)}>
                Get started →
              </button>
            </>
          )}

          {stepId === 'credentials' && (
            <>
              <label className={styles.label}>
                Account SID
                <input className={styles.input} value={accountSid} onChange={(e) => setAccountSid(e.target.value.trim())} placeholder="ACxxxxxxxx" autoComplete="off" />
              </label>
              <label className={styles.label}>
                Auth Token
                <input className={styles.input} type="password" value={authToken} onChange={(e) => setAuthToken(e.target.value.trim())} placeholder="••••••••" autoComplete="off" />
              </label>
              <label className={styles.label}>
                Twilio phone number (sends texts)
                <input className={styles.input} type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="+15413212630" />
              </label>
              <label className={styles.label}>
                Your cell (rings when leads call back)
                <input className={styles.input} type="tel" value={agentPhone} onChange={(e) => setAgentPhone(e.target.value)} placeholder="+15415551234" />
              </label>
              <label className={styles.label}>
                Your name in texts
                <input className={styles.input} value={agentName} onChange={(e) => setAgentName(e.target.value)} placeholder="Cody" />
              </label>
              <label className={styles.label}>
                Ring time before missed-call text (seconds)
                <input className={styles.input} type="number" min={10} max={60} value={ringSeconds} onChange={(e) => setRingSeconds(Number(e.target.value))} />
              </label>
              <label className={styles.checkRow}>
                <input type="checkbox" checked={autoMissed} onChange={(e) => setAutoMissed(e.target.checked)} />
                Auto-text when I miss an inbound callback
              </label>
              <p className={styles.hint}>
                Credentials save to your account. Twilio API verify is optional and needs Cloud Functions deployed.
              </p>
              <button
                type="button"
                className={styles.primaryBtn}
                disabled={busy || !accountSid || !authToken || !phoneNumber || !agentPhone}
                onClick={handleSaveWithoutVerify}
              >
                {busy ? 'Saving…' : 'Save & continue →'}
              </button>
              <button
                type="button"
                className={styles.secondaryBtn}
                disabled={busy || !accountSid || !authToken || !phoneNumber || !agentPhone}
                onClick={handleTestCredentials}
              >
                {busy ? 'Verifying…' : 'Save & verify with Twilio (optional)'}
              </button>
            </>
          )}

          {stepId === 'webhooks' && (
            <>
              <p className={styles.lead}>
                In <strong>Twilio Console → Phone Numbers → your number → Configure</strong>, paste these URLs:
              </p>
              <WebhookRow
                label="Voice → A call comes in"
                url={webhooks?.voiceUrl}
                copied={copied}
                onCopy={copyText}
              />
              <p className={styles.hint}>
                When a lead calls your Twilio number, it rings your cell for {ringSeconds}s. If you don&apos;t answer, the missed-call template is sent automatically.
              </p>
              <button type="button" className={styles.secondaryBtn} onClick={() => fetchWebhooks?.()}>
                Refresh URLs
              </button>
              <button type="button" className={styles.primaryBtn} onClick={() => setStep(STEPS.indexOf('templates'))}>
                I pasted the webhook →
              </button>
            </>
          )}

          {stepId === 'templates' && (
            <>
              <p className={styles.lead}>Customize your 3 Dialer templates. Use {'{{firstName}}'}, {'{{address}}'}, {'{{agentName}}'}.</p>
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
                Missed inbound call (auto)
                <textarea
                  className={styles.textarea}
                  rows={3}
                  value={missedTpl.body}
                  onChange={(e) => setMissedTpl({ ...missedTpl, body: e.target.value })}
                />
              </label>
              <button type="button" className={styles.primaryBtn} disabled={busy} onClick={handleSaveTemplates}>
                Save templates →
              </button>
            </>
          )}

          {stepId === 'test' && (
            <>
              <p className={styles.lead}>Send a test text to your phone to confirm everything works.</p>
              <label className={styles.label}>
                Test phone number
                <input className={styles.input} type="tel" value={testPhone} onChange={(e) => setTestPhone(e.target.value)} placeholder={agentPhone || '+1…'} />
              </label>
              <p className={styles.hint}>You can finish setup and test from the Dialer with &quot;Txt Now&quot; as well.</p>
              <button type="button" className={styles.primaryBtn} disabled={busy} onClick={handleFinish}>
                Complete setup ✓
              </button>
            </>
          )}

          {stepId === 'done' && (
            <>
              <div className={styles.successIcon}>✓</div>
              <p className={styles.lead}>Twilio is connected. Use <strong>Txt Now</strong> in the Dialer to send templated texts with name and address filled in.</p>
              <button type="button" className={styles.primaryBtn} onClick={onClose}>
                Start dialing
              </button>
            </>
          )}
        </div>

        {step > 0 && stepId !== 'done' && (
          <footer className={styles.footer}>
            <button type="button" className={styles.backBtn} onClick={() => setStep((s) => Math.max(0, s - 1))}>
              ← Back
            </button>
          </footer>
        )}
      </div>
    </div>
  );
}

function WebhookRow({ label, url, copied, onCopy }) {
  if (!url) return <p className={styles.hint}>Loading webhook URLs…</p>;
  return (
    <div className={styles.webhookBlock}>
      <span className={styles.webhookLabel}>{label}</span>
      <code className={styles.webhookUrl}>{url}</code>
      <button type="button" className={styles.copyBtn} onClick={() => onCopy(label, url)}>
        {copied === label ? 'Copied!' : 'Copy'}
      </button>
    </div>
  );
}
