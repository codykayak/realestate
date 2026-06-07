import { useState, useMemo } from 'react';
import { usePm } from '../context/PmContext';
import Icon from '../components/Icon';
import styles from '../pm.module.css';
import pitch from './pitch.module.css';
import { LineChart, BarChart, GroupedBar, PieChart } from '../components/charts/Charts';
import {
  DEFAULT_PORTFOLIO,
  computePortfolioRoi,
  MODULES,
  COMPETITORS,
  COMPLIANCE,
  PHASING,
  PITCH_SOURCES,
  SPEED_TO_LEAD_DATA,
  DEFLECTION_COMPARISON,
} from './pitchData';
import APP_CONFIG from '../config/appConfig';
import EnterprisePitchSection from '../components/pitch/EnterprisePitchSection';
import PitchModuleCard from '../components/pitch/PitchModuleCard';

const OPS_IMG = '/pm-pitch/pm-pitch-operations-team.png';

function formatUsd(n) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}

export default function PitchPage() {
  const { config, tenant } = usePm();
  const portfolioUnits = (tenant?.properties || []).reduce((s, p) => s + (p.units || 0), 0) || DEFAULT_PORTFOLIO.units;
  const [units, setUnits] = useState(portfolioUnits);
  const [avgRent, setAvgRent] = useState(DEFAULT_PORTFOLIO.avgRent);
  const [properties, setProperties] = useState((tenant?.properties || []).length || DEFAULT_PORTFOLIO.properties);

  const roi = useMemo(
    () => computePortfolioRoi({ units, avgRent, properties }),
    [units, avgRent, properties],
  );

  const pieData = roi.lines.map((l, i) => ({
    label: l.label,
    value: l.value,
    color: ['#f5a623', '#58a6ff', '#3fb950', '#d29922', '#a371f7', '#f85149'][i % 6],
  }));

  const trendSeries = useMemo(() => {
    const ramp = Array.from({ length: 12 }, (_, i) => Math.round(roi.monthlyTotal * (0.4 + (i / 11) * 0.6)));
    return {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      series: [{ label: 'Monthly AI impact ($)', points: ramp, color: '#f5a623' }],
    };
  }, [roi.monthlyTotal]);

  return (
    <div className={pitch.pitchRoot}>
      <EnterprisePitchSection />

      {/* ── ROI calculator ─────────────────────────────────────────────── */}
      <section className={pitch.section}>
        <h2 className={pitch.sectionTitle}>Portfolio ROI model (illustrative)</h2>
        <p className={pitch.prose}>
          Adjust the sliders to match a prospect&apos;s portfolio. Figures use transparent unit economics from the
          product&apos;s AI Impact model — validate in a 30–60 day pilot with their real deflection and lease-up metrics.
        </p>
        <div className={`${styles.grid} ${styles.cols2}`}>
          <div className={styles.card}>
            <div className={styles.field}>
              <label className={styles.label}>Units managed</label>
              <input className={styles.input} type="number" min={100} step={100} value={units} onChange={(e) => setUnits(Number(e.target.value))} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Average monthly rent ($)</label>
              <input className={styles.input} type="number" min={500} step={50} value={avgRent} onChange={(e) => setAvgRent(Number(e.target.value))} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Properties</label>
              <input className={styles.input} type="number" min={1} value={properties} onChange={(e) => setProperties(Number(e.target.value))} />
            </div>
            <div className={pitch.roiHighlight}>
              <div>
                <div className={pitch.roiBig}>{formatUsd(roi.annualTotal)}</div>
                <div className={styles.hint}>Estimated annual impact</div>
              </div>
              <div>
                <div className={pitch.roiMid}>{formatUsd(roi.monthlyTotal)}/mo</div>
                <div className={styles.hint}>{formatUsd(roi.perUnitMonthly)}/unit/mo · ~{roi.fteEquivalent} FTE equivalent</div>
              </div>
            </div>
            <p className={pitch.footnote}>
              Pitch line: <em>&ldquo;For less than the cost of one leasing associate, 24/7 coverage across every property,
              faster lease-up, and fraud screening on every application.&rdquo;</em>
            </p>
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Value breakdown</div>
            <PieChart data={pieData} size={160} formatVal={(v) => formatUsd(v)} />
          </div>
        </div>
        <div className={styles.card} style={{ marginTop: 16 }}>
          <div className={styles.cardTitle}>12-month impact ramp (pilot → scale)</div>
          <LineChart
            series={trendSeries.series}
            labels={trendSeries.labels}
            height={200}
            formatY={(v) => `$${(v / 1000).toFixed(0)}k`}
          />
        </div>
      </section>

      {/* ── Charts row ─────────────────────────────────────────────────── */}
      <section className={`${styles.grid} ${styles.cols2}`}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Speed-to-lead vs. conversion (indexed)</div>
          <p className={styles.hint} style={{ marginBottom: 10 }}>
            Industry pattern: leads contacted in minutes convert far better than those left for hours. Macro REI targets sub-5-minute auto-response on every channel.
          </p>
          <BarChart
            data={SPEED_TO_LEAD_DATA.labels.map((label, i) => ({
              label,
              value: SPEED_TO_LEAD_DATA.conversionIndex[i],
              color: i === 0 ? '#3fb950' : '#3d4f63',
            }))}
            height={200}
            formatY={(v) => `${v}`}
          />
        </div>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Inquiry volume: staff vs. automated</div>
          <p className={styles.hint} style={{ marginBottom: 10 }}>
            Target 50–70% deflection on FAQ-style resident questions (rent due, amenities, packages, pets).
          </p>
          <GroupedBar
            labels={DEFLECTION_COMPARISON.labels}
            series={DEFLECTION_COMPARISON.series}
            height={200}
            formatY={(v) => `${v}%`}
          />
        </div>
      </section>

      {/* ── Four modules ─────────────────────────────────────────────────── */}
      <section className={pitch.section}>
        <h2 className={pitch.sectionTitle}>Four modules — one operations layer</h2>
        <p className={pitch.prose}>
          Unlike point solutions that only do leasing <em>or</em> only do chat, {config.productName} bundles the work that
          actually consumes site teams: communications, leasing, maintenance, and the knowledge base + integrations that tie them together.
        </p>
        <div className={`${styles.grid} ${styles.cols2}`}>
          {MODULES.map((m) => <PitchModuleCard key={m.id} mod={m} />)}
        </div>
      </section>

      {/* ── Image + operations story ───────────────────────────────────── */}
      <section className={pitch.splitSection}>
        <img src={OPS_IMG} alt="Operations team with technology" className={pitch.splitImg} />
        <div>
          <h2 className={pitch.sectionTitle}>Built for operators, not IT science projects</h2>
          <ul className={pitch.bulletList}>
            <li><strong>Manifest-driven setup wizard</strong> — check Yardi, RealPage, AppFolio, or Entrata; paste keys; test connection. Secrets stay server-side.</li>
            <li><strong>CSV import fallback</strong> — demo and pilot before PMS paperwork is finished.</li>
            <li><strong>Human-in-the-loop</strong> — staff see every AI draft; override any conversation or work order.</li>
            <li><strong>White-label per PMC</strong> — logo, accent, product name via env; per-tenant Firestore branding on roadmap.</li>
            <li><strong>Compartmentalized code</strong> — entire product lives in one portable folder; migrate to client domains without fork.</li>
          </ul>
        </div>
      </section>

      {/* ── ROI table ────────────────────────────────────────────────────── */}
      <section className={pitch.section}>
        <h2 className={pitch.sectionTitle}>How the money shows up (CFO language)</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Lever</th>
              <th>Mechanism</th>
              <th>Illustrative impact</th>
            </tr>
          </thead>
          <tbody>
            {roi.lines.map((l) => (
              <tr key={l.key}>
                <td><strong>{l.label}</strong></td>
                <td className={pitch.tableDetail}>{l.detail}</td>
                <td>{formatUsd(l.value)}/mo</td>
              </tr>
            ))}
            <tr>
              <td colSpan={2}><strong>Total (modeled)</strong></td>
              <td><strong>{formatUsd(roi.monthlyTotal)}/mo · {formatUsd(roi.annualTotal)}/yr</strong></td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* ── Competitive ──────────────────────────────────────────────────── */}
      <section className={pitch.section}>
        <h2 className={pitch.sectionTitle}>Competitive landscape — where we win</h2>
        <p className={pitch.prose}>
          Be honest in the room: EliseAI, Knock/Funnel, and PMS-native AI are real. Differentiation is
          <strong> breadth</strong> (comms + leasing + maintenance), <strong>application fraud audit</strong>,
          <strong> mid-market speed and pricing</strong>, and an <strong>ROI dashboard</strong> baked in from day one.
        </p>
        <table className={styles.table}>
          <thead>
            <tr><th>Player</th><th>Focus</th><th>Macro REI wedge</th></tr>
          </thead>
          <tbody>
            {COMPETITORS.map((c) => (
              <tr key={c.name}>
                <td><strong>{c.name}</strong></td>
                <td>{c.focus}</td>
                <td>{c.gap}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* ── Compliance ───────────────────────────────────────────────────── */}
      <section className={pitch.section}>
        <h2 className={pitch.sectionTitle}>Compliance is a feature, not overhead</h2>
        <div className={`${styles.grid} ${styles.cols2}`}>
          {COMPLIANCE.map((c) => (
            <div key={c.title} className={styles.card}>
              <div className={styles.cardTitle}><Icon name="shield" size={16} /> {c.title}</div>
              <p className={pitch.cardBody}>{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Phasing ──────────────────────────────────────────────────────── */}
      <section className={pitch.section}>
        <h2 className={pitch.sectionTitle}>Pilot → portfolio → enterprise</h2>
        <div className={`${styles.grid} ${styles.cols3}`}>
          {PHASING.map((p) => (
            <div key={p.phase} className={styles.card}>
              <div className={styles.cardTitle}>{p.phase}</div>
              <ul className={pitch.bulletList}>
                {p.items.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing framing ──────────────────────────────────────────────── */}
      <section className={pitch.section}>
        <h2 className={pitch.sectionTitle}>Commercial model (suggested)</h2>
        <div className={`${styles.grid} ${styles.cols3}`}>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Per-unit / month</div>
            <p className={pitch.cardBody}>Aligns with how operators budget (often $2–$6/unit/mo range for ops software — position inside labor savings).</p>
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Module tiers</div>
            <p className={pitch.cardBody}>Core comms → + Leasing → + Maintenance → Enterprise (SSO, custom SLA, dedicated sync).</p>
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}>Pilot-first GTM</div>
            <p className={pitch.cardBody}>One property, 30–60 days, prove deflection % and speed-to-lead — expand on data, not slides.</p>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className={pitch.ctaBlock}>
        <Icon name="spark" size={28} style={{ color: 'var(--pm-accent)' }} />
        <h2 className={pitch.ctaTitle}>Live demo on {config.companyName}</h2>
        <p className={pitch.prose}>
          Walk prospects through <strong>Communications</strong> (auto-resolve pool hours), <strong>Leasing</strong> (pre-screen knockouts),
          <strong>Maintenance</strong> (emergency → Dispatched label — explain dispatch roadmap), and <strong>Settings → Integrations</strong>
          (manifest wizard). Then open this pitch tab for ROI and competitive talk tracks.
        </p>
        <p className={styles.hint}>
          Product: {config.productName} · Tenant demo: {tenant?.name || 'Maple Grove Residential'} · Support: {APP_CONFIG.supportEmail}
        </p>
      </section>

      {/* ── Sources ──────────────────────────────────────────────────────── */}
      <section className={pitch.section}>
        <h2 className={pitch.sectionTitle}>Research notes (talking points)</h2>
        <ul className={pitch.sourcesList}>
          {PITCH_SOURCES.map((s) => (
            <li key={s.id}><strong>{s.label}:</strong> {s.note}</li>
          ))}
        </ul>
        <p className={pitch.footnote}>
          Always replace illustrative model numbers with pilot results. NMHC and NAA publish operating benchmarks;
          Zillow and ILS partners publish speed-to-lead studies; fraud vendors publish application fraud trend reports.
        </p>
      </section>
    </div>
  );
}
