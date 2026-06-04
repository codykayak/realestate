import { useState } from 'react';
import { usePm } from '../context/PmContext';
import Page from '../components/Page';
import Icon from '../components/Icon';
import SetupWizard from '../components/SetupWizard';
import { MANIFESTS, CATEGORY, manifestsByCategory } from '../integrations/registry';
import styles from '../pm.module.css';

export default function Settings() {
  const {
    config, tenant, features, setFeatureEnabled,
    integrations, saveIntegration, disconnectIntegration,
  } = usePm();
  const [wizard, setWizard] = useState(null); // manifest being connected
  const groups = manifestsByCategory();

  return (
    <Page title="Settings & Integrations" subtitle="Connect providers, toggle features per property manager, and manage white-label branding">
      {/* Branding / white-label */}
      <div className={styles.sectionTitle}>White-label branding</div>
      <div className={`${styles.grid} ${styles.cols3}`}>
        <div className={styles.card}>
          <div className={styles.metricLabel}><Icon name="home" size={14} /> Product</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginTop: 6 }}>{config.productName}</div>
          <div className={styles.hint}>{config.productTagline}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.metricLabel}><Icon name="users" size={14} /> Tenant</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginTop: 6 }}>{tenant?.name}</div>
          <div className={styles.hint}>{(tenant?.properties || []).length} properties · {config.companyName}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.metricLabel}><Icon name="spark" size={14} /> Accent</div>
          <div className={styles.row} style={{ marginTop: 8 }}>
            <span style={{ width: 22, height: 22, borderRadius: 6, background: config.accent, display: 'inline-block' }} />
            <code style={{ fontSize: 13 }}>{config.accent}</code>
          </div>
          <div className={styles.hint} style={{ marginTop: 6 }}>Set via VITE_PM_* env for each white-label deployment.</div>
        </div>
      </div>

      {/* Feature flags — per-tenant customization (future-proofing) */}
      <div className={styles.sectionTitle}>Features <span className={styles.hint}>— toggle per property manager</span></div>
      <div className={styles.card}>
        <div className={styles.list}>
          {features.map((f) => (
            <div key={f.id} className={styles.listItem} style={{ cursor: 'default' }}>
              <div style={{ minWidth: 0 }}>
                <div className={styles.itemTitle}><Icon name={f.icon} size={14} /> {f.name} {f.locked && <span className={`${styles.badge} ${styles.badgeGray}`}>core</span>}</div>
                <div className={styles.itemSub} style={{ whiteSpace: 'normal' }}>{f.description}</div>
              </div>
              <div
                className={`${styles.toggle} ${f.enabled ? styles.toggleOn : ''}`}
                onClick={() => !f.locked && setFeatureEnabled(f.id, !f.enabled)}
                role="switch"
                aria-checked={f.enabled}
                style={f.locked ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
              >
                <span className={styles.toggleKnob} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Integrations — manifest-driven */}
      <div className={styles.sectionTitle}>Integrations</div>
      {Object.entries(groups).map(([cat, items]) => (
        <div key={cat} style={{ marginBottom: 18 }}>
          <div className={styles.hint} style={{ marginBottom: 8, fontWeight: 600 }}>{CATEGORY[cat]}</div>
          <div className={styles.provGrid}>
            {items.map((m) => {
              const conn = integrations[m.id];
              const connected = conn?.status === 'connected';
              const pending = conn?.status === 'pending';
              return (
                <div key={m.id} className={`${styles.provCard} ${connected ? styles.provCardConnected : ''}`}>
                  <div className={styles.provHead}>
                    <span className={styles.provName}>{m.name}</span>
                    {connected ? <span className={`${styles.badge} ${styles.badgeGreen}`}>Connected</span>
                      : pending ? <span className={`${styles.badge} ${styles.badgeAmber}`}>Pending</span>
                      : m.status === 'stub' ? <span className={`${styles.badge} ${styles.badgeGray}`}>Available soon</span>
                      : <span className={`${styles.badge} ${styles.badgeBlue}`}>Available</span>}
                  </div>
                  <div className={styles.provBlurb}>{m.blurb}</div>
                  <button className={`${styles.btn} ${styles.btnSm}`} onClick={() => setWizard(m)} style={{ marginTop: 'auto' }}>
                    {conn ? 'Manage' : 'Connect'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div className={styles.banner}>
        <Icon name="bolt" size={16} style={{ marginTop: 1 }} />
        <div>
          Every integration above is defined by a manifest, so the wizard renders itself. Adding a new provider later =
          add one manifest (and a real adapter when sandbox credentials are available) — no other UI changes. {MANIFESTS.length} providers registered.
        </div>
      </div>

      {wizard && (
        <SetupWizard
          manifest={wizard}
          existing={integrations[wizard.id]}
          onConnect={saveIntegration}
          onDisconnect={disconnectIntegration}
          onClose={() => setWizard(null)}
        />
      )}
    </Page>
  );
}
