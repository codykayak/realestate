import { useMemo } from 'react';
import { usePm } from '../context/PmContext';
import Page from '../components/Page';
import Icon from '../components/Icon';
import HeroSection from '../components/HeroSection';
import styles from '../pm.module.css';

export default function Dashboard() {
  const { conversations, leasingLeads, workOrders, tenant, config, onboardingComplete } = usePm();

  const stats = useMemo(() => {
    const autoResolved = conversations.filter((c) => c.status === 'auto-resolved').length;
    const total = conversations.length || 1;
    const deflectionRate = Math.round((autoResolved / total) * 100);
    const openWO = workOrders.filter((w) => w.status !== 'closed').length;
    const emergencies = workOrders.filter((w) => w.priority === 'emergency').length;
    const selfHelp = workOrders.filter((w) => w.status === 'self-help-sent').length;
    const inPipeline = leasingLeads.filter((l) => l.stage !== 'declined' && l.stage !== 'leased').length;
    const minutesSaved = autoResolved * 4 + inPipeline * 25 + selfHelp * 30;
    const hoursSaved = (minutesSaved / 60).toFixed(1);
    const units = (tenant?.properties || []).reduce((s, p) => s + (p.units || 0), 0);
    return { deflectionRate, autoResolved, total, openWO, emergencies, selfHelp, inPipeline, hoursSaved, units };
  }, [conversations, leasingLeads, workOrders, tenant]);

  const metric = (icon, label, value, sub, accent) => (
    <div className={styles.card}>
      <div className={styles.metric}>
        <span className={styles.metricLabel}><Icon name={icon} size={15} /> {label}</span>
        <span className={styles.metricValue} style={accent ? { color: 'var(--pm-accent)' } : undefined}>{value}</span>
        {sub && <span className={styles.metricSub}>{sub}</span>}
      </div>
    </div>
  );

  return (
    <>
      <HeroSection />
      <Page
        title="Operations Dashboard"
        subtitle={`${tenant?.name || 'Demo'} · ${(tenant?.properties || []).length} properties · ${stats.units} units`}
      >
        <div className={`${styles.grid} ${styles.cols4}`}>
          {metric('chat', 'AI Deflection Rate', `${stats.deflectionRate}%`, `${stats.autoResolved} of ${stats.total} inquiries auto-resolved`, true)}
          {metric('clock', 'Staff Time Saved', `${stats.hoursSaved} hrs`, 'This period (modeled)')}
          {metric('key', 'Leasing Pipeline', stats.inPipeline, 'Active applicants being auto-screened')}
          {metric('wrench', 'Open Work Orders', stats.openWO, `${stats.emergencies} emergency · ${stats.selfHelp} self-help deflected`)}
        </div>

        <div className={styles.sectionTitle}>Where the value comes from</div>
        <div className={`${styles.grid} ${styles.cols3}`}>
          <ValueCard
            icon="chat"
            title="Inquiry deflection"
            body="Repetitive resident questions are answered instantly from your knowledge base, 24/7 — reclaiming staff hours and covering nights and weekends."
          />
          <ValueCard
            icon="key"
            title="Faster, safer leasing"
            body="Instant lead response plus automated pre-screening cuts vacancy days and keeps bad applications from reaching a human."
          />
          <ValueCard
            icon="wrench"
            title="Maintenance fast-track"
            body="AI triages every request, flags emergencies for your on-call tech, and deflects fixable issues with guided self-help."
          />
        </div>

        <div className={styles.banner} style={{ marginTop: 22 }}>
          <Icon name="spark" size={18} style={{ marginTop: 1, color: 'var(--pm-accent)' }} />
          <div>
            {onboardingComplete ? (
              <>
                <strong>{config.productName} is configured.</strong> Try Maintenance triage with an emergency phrase
                (e.g. &quot;I smell gas&quot;) to see on-call routing. Connect PMS and messaging in <strong>Settings</strong>.
              </>
            ) : (
              <>
                <strong>Welcome to {config.productName}.</strong> Use the <strong>Onboarding</strong> button at the top
                to load your company data, phone number, spreadsheets, and on-call maintenance techs.
              </>
            )}
          </div>
        </div>
      </Page>
    </>
  );
}

function ValueCard({ icon, title, body }) {
  return (
    <div className={styles.card}>
      <div className={styles.metricLabel} style={{ marginBottom: 8 }}>
        <Icon name={icon} size={16} /> <strong style={{ color: 'var(--pm-text)', fontSize: 14 }}>{title}</strong>
      </div>
      <div className={styles.hint}>{body}</div>
    </div>
  );
}
