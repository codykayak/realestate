import { useState } from 'react';
import Icon from './Icon';
import { getAdapter } from '../integrations/adapters/pmsAdapter';
import styles from '../pm.module.css';

/**
 * Manifest-driven connection modal. It renders its form ENTIRELY from the
 * provider manifest's `fields`, so no provider-specific UI exists here — adding
 * a new integration is just adding a manifest.
 *
 * SECURITY: secret values are used only to "test" and are then discarded.
 * In production these post to a Cloud Function that stores them encrypted
 * (Secret Manager) per tenant; the browser keeps only the connected status.
 */
export default function SetupWizard({ manifest, existing, onConnect, onDisconnect, onClose }) {
  const [values, setValues] = useState({});
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState(null);

  const missingRequired = manifest.fields
    .filter((f) => f.required)
    .some((f) => !String(values[f.key] || '').trim());

  async function testAndConnect() {
    setTesting(true);
    setResult(null);
    try {
      if (manifest.noCredentials) {
        onConnect(manifest.id, { status: 'connected', mode: 'manual' });
        onClose();
        return;
      }
      const adapter = getAdapter(manifest);
      const res = await adapter.testConnection(values);
      setResult(res);
      // Persist connection STATUS only (never the secret values).
      onConnect(manifest.id, {
        status: res.ok ? 'connected' : 'pending',
        message: res.message,
        // Store only non-secret field keys that were filled (for display).
        configuredFields: manifest.fields.filter((f) => f.type !== 'secret' && values[f.key]).map((f) => f.key),
      });
    } catch (e) {
      setResult({ ok: false, message: e.message });
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHead}>
          <div>
            <div className={styles.cardTitle}>Connect {manifest.name}</div>
            <div className={styles.hint}>{manifest.blurb}</div>
          </div>
          <button className={`${styles.btn} ${styles.btnSm} ${styles.btnGhost}`} onClick={onClose}><Icon name="x" size={16} /></button>
        </div>

        {manifest.noCredentials ? (
          <div className={styles.hint} style={{ marginBottom: 16 }}>
            No credentials needed — this is the universal CSV/Excel import fallback. Enable it, then import files from the Residents page.
          </div>
        ) : (
          manifest.fields.map((f) => (
            <div className={styles.field} key={f.key}>
              <label className={styles.label}>{f.label}{f.required && ' *'}{f.type === 'secret' && ' (secret)'}</label>
              <input
                className={styles.input}
                type={f.type === 'secret' ? 'password' : f.type === 'email' ? 'email' : 'text'}
                placeholder={f.placeholder || ''}
                value={values[f.key] || ''}
                onChange={(e) => setValues({ ...values, [f.key]: e.target.value })}
                autoComplete="off"
              />
            </div>
          ))
        )}

        {!manifest.noCredentials && (
          <div className={styles.hint} style={{ marginBottom: 14 }}>
            <Icon name="shield" size={13} /> Secrets are sent over HTTPS to your server and stored encrypted — never kept in the browser.
            {manifest.status === 'stub' && ' This provider is wired behind the common adapter interface; live sync activates once partner approval is complete.'}
          </div>
        )}

        {result && (
          <div className={`${styles.banner} ${result.ok ? '' : styles.bannerRed}`} style={{ marginBottom: 14 }}>
            <Icon name={result.ok ? 'check' : 'alert'} size={16} style={{ marginTop: 1 }} />
            <div>{result.message}</div>
          </div>
        )}

        <div className={styles.rowWrap}>
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={testAndConnect} disabled={testing || (!manifest.noCredentials && missingRequired)}>
            {testing ? 'Testing…' : manifest.noCredentials ? 'Enable' : 'Test & connect'}
          </button>
          {existing && (
            <button className={`${styles.btn} ${styles.btnGhost} ${styles.btnDanger}`} onClick={() => { onDisconnect(manifest.id); onClose(); }}>
              Disconnect
            </button>
          )}
          <button className={`${styles.btn} ${styles.btnGhost}`} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
