import { useState, useMemo } from 'react';
import { mergeTemplate, smsCountForPhone } from '../utils/smsTemplates';
import styles from './TxtNowSheet.module.css';

export default function TxtNowSheet({
  open,
  onClose,
  lead,
  activePhone,
  templates,
  config,
  onSend,
  sending,
  error,
}) {
  const safeTemplates = templates?.length ? templates : [];
  const [templateId, setTemplateId] = useState(safeTemplates[0]?.id ?? 'intro');
  const [selectedPhone, setSelectedPhone] = useState(activePhone || lead?.phone || '');
  const [sent, setSent] = useState(false);

  const template = safeTemplates.find((t) => t.id === templateId) ?? safeTemplates[0];
  const preview = useMemo(() => {
    if (!template?.body || !lead) return '';
    return mergeTemplate(template.body, lead, config ?? {});
  }, [template, lead, config]);

  const phoneOptions = useMemo(() => {
    const list = [];
    if (lead?.phones?.length) {
      for (const p of lead.phones) list.push({ label: p.label, number: p.number });
    } else if (lead?.phone) {
      list.push({ label: 'Primary', number: lead.phone });
    }
    return list;
  }, [lead]);

  const smsOnPhone = smsCountForPhone(lead, selectedPhone);
  const totalSms = lead?.smsCount ?? 0;

  if (!open || !lead) return null;

  async function handleSend() {
    setSent(false);
    try {
      await onSend({
        leadId: lead.id,
        templateId,
        toPhone: selectedPhone,
        leadSnapshot: lead,
      });
      setSent(true);
      setTimeout(() => onClose(), 1200);
    } catch {
      /* error shown via prop */
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div
        className={styles.sheet}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Send text message"
      >
        <div className={styles.handle} aria-hidden="true" />

        <header className={styles.header}>
          <h3 className={styles.title}>Txt Now</h3>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </header>

        <p className={styles.leadName}>{lead.name || `Lead ${lead.id + 1}`}</p>
        <p className={styles.leadAddr}>
          {[lead.address, lead.city, lead.state].filter(Boolean).join(', ')}
        </p>

        {(totalSms > 0 || smsOnPhone > 0) && (
          <p className={styles.tally}>
            💬 {smsOnPhone > 0 ? `${smsOnPhone} text${smsOnPhone !== 1 ? 's' : ''} to this #` : ''}
            {smsOnPhone > 0 && totalSms > smsOnPhone ? ' · ' : ''}
            {totalSms > 0 ? `${totalSms} total on lead` : ''}
          </p>
        )}

        {phoneOptions.length > 1 && (
          <div className={styles.phonePick}>
            <span className={styles.pickLabel}>Send to</span>
            <div className={styles.phoneChips}>
              {phoneOptions.map((p) => (
                <button
                  key={p.label + p.number}
                  type="button"
                  className={`${styles.chip} ${selectedPhone === p.number ? styles.chipActive : ''}`}
                  onClick={() => setSelectedPhone(p.number)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <p className={styles.sectionLabel}>Choose template</p>
        <div className={styles.templateGrid}>
          {safeTemplates.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`${styles.templateBtn} ${templateId === t.id ? styles.templateBtnActive : ''}`}
              onClick={() => setTemplateId(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className={styles.preview}>
          <span className={styles.previewLabel}>Preview</span>
          <p className={styles.previewText}>{preview}</p>
        </div>

        {error && <p className={styles.error}>{error}</p>}
        {sent && <p className={styles.success}>Text sent!</p>}

        <button
          type="button"
          className={styles.sendBtn}
          disabled={sending || !selectedPhone}
          onClick={handleSend}
        >
          {sending ? 'Sending…' : sent ? 'Sent ✓' : 'Send text'}
        </button>
      </div>
    </div>
  );
}
