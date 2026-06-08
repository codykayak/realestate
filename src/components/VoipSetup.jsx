import { useState, useEffect } from 'react';
import TwilioOnboarding from './TwilioOnboarding';
import QuoOnboarding from './QuoOnboarding';
import styles from './VoipSetup.module.css';
import sheetStyles from './TwilioOnboarding.module.css';

export default function VoipSetup({
  open,
  onClose,
  initialTab = 'quo',
  quoProps,
  twilioProps,
}) {
  const [tab, setTab] = useState(initialTab);

  useEffect(() => {
    if (open) setTab(initialTab);
  }, [open, initialTab]);

  if (!open) return null;

  return (
    <div className={sheetStyles.overlay} role="dialog" aria-modal="true" aria-label="VoIP setup">
      <div className={sheetStyles.sheet}>
        <header className={sheetStyles.header}>
          <div>
            <h2 className={sheetStyles.title}>VoIP Setup</h2>
            <p className={sheetStyles.sub}>Connect Quo or Twilio for in-app calling &amp; texting</p>
          </div>
          <button type="button" className={sheetStyles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </header>

        <div className={styles.tabs} role="tablist" aria-label="VoIP provider">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'quo'}
            className={`${styles.tab} ${tab === 'quo' ? styles.tabActive : ''}`}
            onClick={() => setTab('quo')}
          >
            Quo
            {quoProps?.isReady ? ' ✓' : quoProps?.hasCredentials ? ' •' : ''}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'twilio'}
            className={`${styles.tab} ${tab === 'twilio' ? styles.tabActive : ''}`}
            onClick={() => setTab('twilio')}
          >
            Twilio
            {twilioProps?.isReady ? ' ✓' : twilioProps?.hasCredentials ? ' •' : ''}
          </button>
        </div>

        <div className={styles.tabPanel} role="tabpanel">
          {tab === 'quo' ? (
            <QuoOnboarding {...quoProps} open embedded onClose={onClose} />
          ) : (
            <TwilioOnboarding {...twilioProps} open embedded onClose={onClose} />
          )}
        </div>
      </div>
    </div>
  );
}
