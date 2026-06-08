import { useState, useEffect } from 'react';
import { DEFAULT_MISSED_TEMPLATE, DEFAULT_TEMPLATES } from '../utils/smsTemplates';
import styles from './TwilioOnboarding.module.css';

const TOKEN_HINT = '{{firstName}}, {{address}}, {{agentName}}, {{appointmentTime}}';

export default function TemplateSettingsSheet({
  open,
  onClose,
  templates: savedTemplates,
  agentName: savedAgentName,
  missedCallTemplate: savedMissed,
  onSave,
  busy = false,
  error = null,
}) {
  const [templates, setTemplates] = useState(DEFAULT_TEMPLATES);
  const [agentName, setAgentName] = useState('Macro REI');
  const [missedTpl, setMissedTpl] = useState(DEFAULT_MISSED_TEMPLATE);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    if (!open) return;
    setTemplates(savedTemplates?.length ? savedTemplates : DEFAULT_TEMPLATES);
    setAgentName(savedAgentName ?? 'Macro REI');
    setMissedTpl(savedMissed ?? DEFAULT_MISSED_TEMPLATE);
    setNotice(null);
  }, [open, savedTemplates, savedAgentName, savedMissed]);

  if (!open) return null;

  async function handleSave() {
    setNotice(null);
    try {
      await onSave({
        templates,
        agentName: agentName.trim() || 'Macro REI',
        missedCallTemplate: missedTpl,
      });
      setNotice('Templates saved.');
      setTimeout(() => onClose(), 900);
    } catch (e) {
      setNotice(e.message || 'Could not save.');
    }
  }

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Message templates">
      <div className={styles.sheet}>
        <header className={styles.header}>
          <div>
            <h2 className={styles.title}>Message Templates</h2>
            <p className={styles.sub}>Used for Text / Txt Now in the Dialer</p>
          </div>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </header>

        <div className={styles.body}>
          {error && <p className={styles.error}>{error}</p>}
          {notice && <p className={notice.startsWith('Templates') ? styles.notice : styles.error}>{notice}</p>}

          <p className={styles.lead}>
            Tokens auto-fill from each lead: <code>{TOKEN_HINT}</code>
          </p>

          <label className={styles.label}>
            Your name in texts
            <input
              className={styles.input}
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              placeholder="Cody"
            />
          </label>

          {templates.map((t, i) => (
            <label key={t.id} className={styles.label}>
              {t.label}
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
            Missed callback (when VoIP auto-reply is on)
            <textarea
              className={styles.textarea}
              rows={3}
              value={missedTpl.body}
              onChange={(e) => setMissedTpl({ ...missedTpl, body: e.target.value })}
            />
          </label>

          <button type="button" className={styles.primaryBtn} disabled={busy} onClick={handleSave}>
            {busy ? 'Saving…' : 'Save templates'}
          </button>
        </div>
      </div>
    </div>
  );
}
