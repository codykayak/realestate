import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePm } from '../context/PmContext';
import Icon from '../components/Icon';
import { LineChart, BarChart, GroupedBar, PieChart } from '../components/charts/Charts';
import { summarize, usd, pct } from '../lib/finance';
import { monthLabel } from '../data/financials';
import {
  computePortfolioRoi,
  DEFAULT_PORTFOLIO,
  MODULES,
  DEFLECTION_COMPARISON,
} from '../developer-admin/pitchData';
import gw from './gateway.module.css';

const HERO_IMG = '/pm-pitch/pm-pitch-hero-community.png';
const OPS_IMG = '/pm-pitch/pm-pitch-operations-team.png';

function hrefFor(base, route) {
  const b = (base || '/property-management').replace(/\/$/, '');
  return route ? `${b}/${route}` : b;
}

/**
 * Public-facing gateway at /property-management — pitch-style ROI & NOI story
 * with a large Enter CTA into the operations app.
 */
export default function GatewayPage() {
  const { config, tenant } = usePm();
  const navigate = useNavigate();
  const base = config.basePath;

  const units = (tenant?.properties || []).reduce((s, p) => s + (p.units || 0), 0) || DEFAULT_PORTFOLIO.units;
  const properties = (tenant?.properties || []).length || DEFAULT_PORTFOLIO.properties;

  const roi = useMemo(
    () => computePortfolioRoi({ units, avgRent: DEFAULT_PORTFOLIO.avgRent, properties }),
    [units, properties],
  );

  const fin = useMemo(() => summarize(null), []);
  const last12 = fin.series.slice(-12);
  const noiLabels = last12.map((m) => monthLabel(m.month));

  const noiSeries = {
    labels: noiLabels,
    series: [
      { label: 'NOI', points: last12.map((m) => m.noi), color: '#f5a623' },
      { label: 'Budget', points: last12.map((m) => m.budgetNOI), color: '#58a6ff', dashed: true },
    ],
  };

  const roiRamp = useMemo(() => {
    const ramp = Array.from({ length: 12 }, (_, i) => Math.round(roi.monthlyTotal * (0.35 + (i / 11) * 0.65)));
    return {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      series: [{ label: 'Monthly AI impact ($)', points: ramp, color: '#f5a623' }],
    };
  }, [roi.monthlyTotal]);

  const pieData = roi.lines.map((l, i) => ({
    label: l.label,
    value: l.value,
    color: ['#f5a623', '#58a6ff', '#3fb950', '#d29922', '#a371f7', '#f85149'][i % 6],
  }));

  const noiBar = last12.slice(-6).map((m) => ({
    label: monthLabel(m.month).split(' ')[0],
    value: m.noi,
    color: m.noi >= m.budgetNOI ? '#3fb950' : '#f5a623',
  }));

  const enter = () => navigate(hrefFor(base, 'dashboard'));

  return (
    <div className={gw.gateway}>
      <div className={gw.gatewayInner}>
        <section className={gw.hero}>
          <div>
            <div className={gw.brandRow}>
              {config.logo ? <img src={config.logo} alt={config.companyName} /> : <Icon name="home" size={40} />}
              <div>
                <div className={gw.brandName}>{config.productName}</div>
                <div className={gw.brandSub}>{config.companyName} · {config.productTagline}</div>
              </div>
            </div>
            <p className={gw.eyebrow}>Multifamily operations platform</p>
            <h1 className={gw.heroTitle}>
              Protect NOI. Prove ROI. Run the portfolio on AI — not overtime.
            </h1>
            <p className={gw.heroLead}>
              {config.productName} is the AI operations layer on top of the PMS you already use:
              24/7 resident communication, automated leasing, and maintenance triage — with owner-grade
              NOI reporting built in.
            </p>
            <button type="button" className={gw.enterBtn} onClick={enter}>
              Enter platform
              <Icon name="bolt" size={22} />
            </button>
            <p className={gw.enterHint}>
              Live demo · {tenant?.name || 'Demo tenant'} · data stored locally until Firebase is connected
            </p>
          </div>
          <div className={gw.heroVisual}>
            <img src={HERO_IMG} alt="Multifamily community" className={gw.heroImg} />
          </div>
        </section>

        <div className={gw.kpiStrip}>
          <div className={gw.kpi}>
            <div className={gw.kpiLabel}>Illustrative annual AI impact</div>
            <div className={`${gw.kpiValue} ${gw.kpiValueAccent}`}>{usd(roi.annualTotal)}</div>
            <div className={gw.kpiSub}>{usd(roi.perUnitMonthly)}/unit/mo · {roi.fteEquivalent} FTE equivalent</div>
          </div>
          <div className={gw.kpi}>
            <div className={gw.kpiLabel}>Portfolio NOI — YTD</div>
            <div className={gw.kpiValue}>{usd(fin.noiYTD)}</div>
            <div className={gw.kpiSub}>
              {fin.noiYTDvsBudgetPct >= 0 ? '+' : ''}{pct(fin.noiYTDvsBudgetPct, 1)} vs budget
            </div>
          </div>
          <div className={gw.kpi}>
            <div className={gw.kpiLabel}>NOI — month to date</div>
            <div className={gw.kpiValue}>{usd(fin.noiMTD)}</div>
            <div className={gw.kpiSub}>Operating margin {pct(fin.operatingMargin)}</div>
          </div>
          <div className={gw.kpi}>
            <div className={gw.kpiLabel}>Units under management</div>
            <div className={gw.kpiValue}>{units.toLocaleString()}</div>
            <div className={gw.kpiSub}>{properties} properties · demo portfolio</div>
          </div>
        </div>

        <section>
          <div className={gw.sectionHead}>
            <h2 className={gw.sectionTitle}>Where the ROI comes from</h2>
            <p className={gw.sectionSub}>
              Illustrative model for a {units.toLocaleString()}-unit portfolio — replace with pilot metrics after 30–60 days.
            </p>
          </div>
          <div className={gw.chartGrid}>
            <div className={gw.chartCard}>
              <div className={gw.chartLabel}>Monthly value by lever</div>
              <PieChart data={pieData} size={180} formatVal={(v) => usd(v)} />
            </div>
            <div className={gw.chartCard}>
              <div className={gw.chartLabel}>AI impact ramp (year 1)</div>
              <LineChart {...roiRamp} height={200} formatY={(v) => `$${Math.round(v / 1000)}k`} />
            </div>
            <div className={gw.chartCard}>
              <div className={gw.chartLabel}>Staff vs auto-resolved volume</div>
              <GroupedBar
                labels={DEFLECTION_COMPARISON.labels}
                series={DEFLECTION_COMPARISON.series}
                height={200}
                formatY={(v) => `${v}%`}
              />
            </div>
            <div className={gw.chartCard}>
              <div className={gw.chartLabel}>Top savings drivers</div>
              <BarChart
                data={roi.lines.slice(0, 4).map((l) => ({ label: l.key, value: l.value }))}
                height={200}
                formatY={(v) => `$${Math.round(v / 1000)}k`}
              />
            </div>
          </div>
        </section>

        <section>
          <div className={gw.sectionHead}>
            <h2 className={gw.sectionTitle}>NOI you can defend in the owner meeting</h2>
            <p className={gw.sectionSub}>
              Trailing-twelve NOI vs budget — simulated ledger data; production connects to your PMS.
            </p>
          </div>
          <div className={gw.chartGrid}>
            <div className={`${gw.chartCard} ${gw.chartCardWide}`}>
              <div className={gw.chartLabel}>NOI vs budget — last 12 months</div>
              <LineChart {...noiSeries} height={240} formatY={(v) => `$${Math.round(v / 1000)}k`} />
            </div>
            <div className={gw.chartCard}>
              <div className={gw.chartLabel}>Recent monthly NOI</div>
              <BarChart data={noiBar} height={200} formatY={(v) => `$${Math.round(v / 1000)}k`} />
            </div>
            <div className={gw.chartCard}>
              <div className={gw.chartLabel}>Operations team</div>
              <img src={OPS_IMG} alt="Property operations team" className={gw.heroImg} style={{ borderRadius: 10 }} />
            </div>
          </div>
        </section>

        <section>
          <div className={gw.sectionHead}>
            <h2 className={gw.sectionTitle}>Three modules. One platform.</h2>
            <p className={gw.sectionSub}>Everything behind the Enter button — ready to explore in the live demo.</p>
          </div>
          <div className={gw.moduleGrid}>
            {MODULES.map((mod) => (
              <div key={mod.id} className={gw.moduleCard}>
                <div className={gw.moduleTitle}>
                  <Icon name={mod.icon} size={18} />
                  {mod.title}
                </div>
                <div className={gw.moduleStat}>{mod.stat}</div>
                <div className={gw.kpiSub}>{mod.statLabel}</div>
                <ul className={gw.moduleBullets}>
                  {mod.bullets.slice(0, 2).map((b) => <li key={b}>{b}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <footer className={gw.footerCta}>
          <button type="button" className={gw.enterBtn} onClick={enter}>
            Enter {config.productName}
            <Icon name="bolt" size={22} />
          </button>
        </footer>
      </div>
    </div>
  );
}
