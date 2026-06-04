import { useMemo, useState } from 'react';
import { usePm } from '../context/PmContext';
import Page from '../components/Page';
import Icon from '../components/Icon';
import OwnerReport from '../components/OwnerReport';
import { LineChart, GroupedBar, BarChart, PieChart } from '../components/charts/Charts';
import { PROPERTIES, monthLabel } from '../data/financials';
import { summarize, benchmark, maintenancePerUnit, forecastNOI, whatIf, usd, pct } from '../lib/finance';
import { computeAiImpact, aiImpactSeries } from '../lib/aiImpact';
import styles from '../pm.module.css';

const ACCENT = 'var(--pm-accent)';
const BLUE = '#58a6ff';
const GREEN = '#3fb950';
const RED = '#f85149';
const PURPLE = '#bc8cff';

export default function OwnerPortal() {
  const { config, conversations, workOrders, leasingLeads } = usePm();
  const [scope, setScope] = useState('all');
  const [showReport, setShowReport] = useState(false);

  const propertyIds = scope === 'all' ? null : [scope];
  const summary = useMemo(() => summarize(propertyIds), [scope]); // eslint-disable-line react-hooks/exhaustive-deps
  const bench = useMemo(() => benchmark(), []);
  const maintPU = useMemo(() => maintenancePerUnit(propertyIds), [scope]); // eslint-disable-line react-hooks/exhaustive-deps
  const fc = useMemo(() => forecastNOI(propertyIds, 6), [scope]); // eslint-disable-line react-hooks/exhaustive-deps

  const aiImpact = useMemo(() => computeAiImpact({
    inquiries: conversations.filter((c) => c.status === 'auto-resolved').length,
    truckRolls: workOrders.filter((w) => w.status === 'self-help-sent').length,
    prescreens: leasingLeads.length,
  }, summary.cap.units), [conversations, workOrders, leasingLeads, summary.cap.units]);

  const last12 = summary.series.slice(-12);
  const labels12 = last12.map((m) => monthLabel(m.month));
  const labels24 = summary.series.map((m) => monthLabel(m.month));
  const fmtK = (v) => `$${Math.round(v / 1000)}k`;

  // NOI trend + 6-month forecast (gap-aware series sharing one 30-point x-axis)
  const H = fc.forecast.length;
  const lastActual = summary.series[summary.series.length - 1].noi;
  const noiActual = [...summary.series.map((m) => m.noi), ...Array(H).fill(null)];
  const noiBudget = [...summary.series.map((m) => m.budgetNOI), ...Array(H).fill(null)];
  const noiForecast = [...Array(summary.series.length - 1).fill(null), lastActual, ...fc.forecast];
  const noiLabels = [...labels24, ...fc.forecast.map((_, i) => `+${i + 1}`)];

  return (
    <Page
      title="Owner Portal"
      subtitle={`${config.companyName} · real-time portfolio performance`}
      actions={
        <>
          <span className={`${styles.badge} ${styles.badgeAmber}`}><Icon name="spark" size={12} /> Simulated data</span>
          <select className={styles.select} style={{ width: 190 }} value={scope} onChange={(e) => setScope(e.target.value)}>
            <option value="all">Entire Portfolio</option>
            {PROPERTIES.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => setShowReport(true)}>
            <Icon name="doc" size={15} /> Generate owner report
          </button>
        </>
      }
    >
      {/* Headline KPIs */}
      <div className={`${styles.grid} ${styles.cols4}`}>
        <Kpi label="NOI — Month to Date" value={usd(summary.noiMTD)} sub={`Operating margin ${pct(summary.operatingMargin)}`} accent />
        <Kpi label="NOI — Year to Date" value={usd(summary.noiYTD)} sub={<DeltaPair a={summary.noiYTDvsBudgetPct} aLabel="vs Budget" b={summary.noiYTDvsPriorPct} bLabel="vs Last Yr" />} />
        <Kpi label="Cash-on-Cash (T12)" value={pct(summary.cashOnCash)} sub={`${usd(summary.cashFlowT12)} annual cash flow`} />
        <Kpi label="Trailing-12 NOI" value={usd(summary.noiT12)} sub={`${summary.cap.units} units · ${usd(summary.noiT12 / (summary.cap.units || 1))}/unit`} />
      </div>

      {/* AI Impact widget */}
      <div className={styles.card} style={{ marginTop: 16, borderColor: 'rgba(245,166,35,0.4)' }}>
        <div className={styles.cardHead}>
          <span className={styles.cardTitle}><Icon name="spark" size={16} /> AI Impact — estimated value created this month</span>
          <span className={styles.metricValue} style={{ fontSize: 26, color: ACCENT }}>{usd(aiImpact.monthlyTotal)}</span>
        </div>
        <div className={`${styles.grid} ${styles.cols2}`} style={{ alignItems: 'center' }}>
          <div>
            <table className={styles.table}>
              <tbody>
                {aiImpact.lines.map((l) => (
                  <tr key={l.key}>
                    <td>{l.label}</td>
                    <td style={{ textAlign: 'right', color: 'var(--pm-muted)' }}>{l.key === 'afterHours' ? '—' : l.count.toLocaleString()}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{usd(l.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className={styles.hint} style={{ marginTop: 8 }}>
              ≈ {aiImpact.staffHoursSaved.toLocaleString()} staff hours saved · {aiImpact.inquiriesHandled.toLocaleString()} inquiries auto-handled · annualized ≈ <strong>{usd(aiImpact.annualizedTotal)}</strong>
            </div>
          </div>
          <div>
            <div className={styles.hint} style={{ marginBottom: 6 }}>AI savings trend (last 12 months)</div>
            <LineChart height={180} labels={labels12} series={[{ color: ACCENT, points: aiImpactSeries(aiImpact.monthlyTotal) }]} formatY={fmtK} />
          </div>
        </div>
      </div>

      {/* NOI trend + forecast */}
      <div className={styles.sectionTitle}>NOI trend & forecast</div>
      <div className={styles.card}>
        <LineChart
          height={250}
          labels={noiLabels}
          series={[
            { label: 'Actual NOI', color: ACCENT, points: noiActual },
            { label: 'Budget NOI', color: BLUE, dashed: true, points: noiBudget },
            { label: 'Forecast (6mo)', color: GREEN, dashed: true, points: noiForecast },
          ]}
          formatY={fmtK}
        />
      </div>

      {/* Income vs Expense + expense mix */}
      <div className={styles.sectionTitle}>Income vs expense</div>
      <div className={`${styles.grid} ${styles.cols2}`}>
        <div className={styles.card}>
          <div className={styles.cardTitle} style={{ marginBottom: 12 }}>Income vs Expense (last 12 months)</div>
          <GroupedBar
            height={230}
            labels={labels12}
            series={[
              { label: 'Income', color: GREEN, values: last12.map((m) => m.income) },
              { label: 'Expense', color: RED, values: last12.map((m) => m.totalExpense) },
            ]}
            formatY={fmtK}
          />
        </div>
        <div className={styles.card}>
          <div className={styles.cardTitle} style={{ marginBottom: 12 }}>Operating expense mix (this month)</div>
          <PieChart data={summary.expenseBreakdown} formatVal={(v) => usd(v)} />
        </div>
      </div>

      {/* Expense category trends */}
      <div className={styles.sectionTitle}>Expense category trends</div>
      <div className={styles.card}>
        <LineChart
          height={230}
          labels={labels24}
          area={false}
          series={[
            { label: 'Maintenance', color: ACCENT, points: summary.series.map((m) => m.expenses.maintenance) },
            { label: 'Utilities', color: BLUE, points: summary.series.map((m) => m.expenses.utilities) },
            { label: 'Turnover', color: PURPLE, points: summary.series.map((m) => m.expenses.turnover) },
          ]}
          formatY={fmtK}
        />
      </div>

      {/* Occupancy / renewals / delinquency */}
      <div className={styles.sectionTitle}>Occupancy, renewals & delinquency</div>
      <div className={`${styles.grid} ${styles.cols2}`}>
        <div className={styles.card}>
          <div className={styles.cardTitle} style={{ marginBottom: 12 }}>Vacancy rate vs lease-renewal rate</div>
          <LineChart
            height={210}
            labels={labels24}
            area={false}
            series={[
              { label: 'Vacancy %', color: RED, points: summary.series.map((m) => +(m.vacancyRate * 100).toFixed(2)) },
              { label: 'Renewal %', color: GREEN, points: summary.series.map((m) => +(m.renewalRate * 100).toFixed(2)) },
            ]}
            formatY={(v) => `${v.toFixed(0)}%`}
          />
        </div>
        <div className={styles.card}>
          <div className={styles.cardTitle} style={{ marginBottom: 12 }}>Bad debt / delinquency ($)</div>
          <BarChart height={210} data={summary.series.map((m) => ({ label: monthLabel(m.month), value: m.badDebt }))} color={RED} formatY={fmtK} />
        </div>
      </div>

      {/* Phase 2: Benchmarking */}
      <div className={styles.sectionTitle}>Portfolio benchmarking <span className={styles.hint}>— Phase 2</span></div>
      <div className={styles.card}>
        <table className={styles.table}>
          <thead>
            <tr><th>Property</th><th>Units</th><th>NOI / unit (T12)</th><th>Cash-on-Cash</th><th>Vacancy</th><th>Renewal</th><th>Maint / unit</th><th>Op. margin</th></tr>
          </thead>
          <tbody>
            {bench.map((b) => (
              <tr key={b.id}>
                <td><strong>{b.name}</strong></td>
                <td>{b.units}</td>
                <td>{usd(b.noiPerUnit)}</td>
                <td>{pct(b.cashOnCash)}</td>
                <td>{pct(b.vacancyRate)}</td>
                <td>{pct(b.renewalRate)}</td>
                <td>{usd(b.maintPerUnitT12)}</td>
                <td>{pct(b.operatingMargin)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Phase 2: Maintenance cost per unit */}
      <div className={styles.sectionTitle}>Maintenance cost per unit <span className={styles.hint}>— Phase 2</span></div>
      <div className={styles.card}>
        <BarChart height={200} data={maintPU.map((m) => ({ label: monthLabel(m.month), value: m.value }))} color={ACCENT} formatY={(v) => `$${Math.round(v)}`} />
      </div>

      {/* Phase 2: CapEx + What-If */}
      <div className={`${styles.grid} ${styles.cols2}`}>
        <CapExPlanner units={summary.cap.units} />
        <WhatIfSimulator propertyIds={propertyIds} scope={scope} />
      </div>

      {showReport && (
        <OwnerReport scope={scope} summary={summary} aiImpact={aiImpact} onClose={() => setShowReport(false)} />
      )}
    </Page>
  );
}

function Kpi({ label, value, sub, accent }) {
  return (
    <div className={styles.card}>
      <div className={styles.metric}>
        <span className={styles.metricLabel}>{label}</span>
        <span className={styles.metricValue} style={accent ? { color: ACCENT } : undefined}>{value}</span>
        <span className={styles.metricSub}>{sub}</span>
      </div>
    </div>
  );
}

function DeltaPair({ a, aLabel, b, bLabel }) {
  const chip = (v, label) => (
    <span style={{ color: v >= 0 ? GREEN : RED, marginRight: 10 }}>
      {v >= 0 ? '▲' : '▼'} {pct(Math.abs(v))} {label}
    </span>
  );
  return <span>{chip(a, aLabel)}{chip(b, bLabel)}</span>;
}

function SliderRow({ label, val, set, min, max, suffix }) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}: <strong style={{ color: 'var(--pm-text)' }}>{val > 0 ? '+' : ''}{val}{suffix}</strong></label>
      <input type="range" min={min} max={max} value={val} onChange={(e) => set(Number(e.target.value))} style={{ width: '100%' }} />
    </div>
  );
}

function CapExPlanner({ units }) {
  const [perUnit, setPerUnit] = useState(1200);
  const [years, setYears] = useState(5);
  const annual = units * perUnit;
  return (
    <div>
      <div className={styles.sectionTitle} style={{ marginTop: 22 }}>CapEx planning <span className={styles.hint}>— Phase 2</span></div>
      <div className={styles.card}>
        <div className={`${styles.grid} ${styles.cols2}`}>
          <div className={styles.field}><label className={styles.label}>Reserve $/unit/yr</label><input className={styles.input} type="number" value={perUnit} onChange={(e) => setPerUnit(Number(e.target.value) || 0)} /></div>
          <div className={styles.field}><label className={styles.label}>Horizon (years)</label><input className={styles.input} type="number" value={years} onChange={(e) => setYears(Number(e.target.value) || 0)} /></div>
        </div>
        <div className={styles.metric}>
          <span className={styles.metricLabel}>Recommended reserve</span>
          <span className={styles.metricValue} style={{ color: ACCENT }}>{usd(annual)}/yr</span>
          <span className={styles.metricSub}>{usd(annual * years)} over {years} years · {units} units</span>
        </div>
      </div>
    </div>
  );
}

function WhatIfSimulator({ propertyIds, scope }) {
  const [vac, setVac] = useState(-2);
  const [rent, setRent] = useState(2);
  const [maint, setMaint] = useState(-5);
  const result = useMemo(
    () => whatIf(propertyIds, { vacancyDelta: vac / 100, rentDelta: rent / 100, maintenanceDelta: maint / 100 }),
    [vac, rent, maint, scope], // eslint-disable-line react-hooks/exhaustive-deps
  );
  return (
    <div>
      <div className={styles.sectionTitle} style={{ marginTop: 22 }}>&quot;What-if&quot; simulator <span className={styles.hint}>— Phase 2</span></div>
      <div className={styles.card}>
        <SliderRow label="Change vacancy" val={vac} set={setVac} min={-5} max={5} suffix=" pts" />
        <SliderRow label="Change rents" val={rent} set={setRent} min={-5} max={10} suffix="%" />
        <SliderRow label="Change maintenance" val={maint} set={setMaint} min={-25} max={25} suffix="%" />
        <div className={styles.divider} />
        <div className={`${styles.grid} ${styles.cols2}`}>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Monthly NOI impact</span>
            <span className={styles.metricValue} style={{ fontSize: 22, color: result.monthlyDelta >= 0 ? GREEN : RED }}>{result.monthlyDelta >= 0 ? '+' : ''}{usd(result.monthlyDelta)}</span>
            <span className={styles.metricSub}>{result.annualNOIdelta >= 0 ? '+' : ''}{usd(result.annualNOIdelta)} annualized</span>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>New cash-on-cash</span>
            <span className={styles.metricValue} style={{ fontSize: 22 }}>{pct(result.newCashOnCash)}</span>
            <span className={styles.metricSub}>from {pct(result.baseCashOnCash)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
