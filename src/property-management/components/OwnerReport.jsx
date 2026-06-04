import { usePm } from '../context/PmContext';
import Icon from './Icon';
import { LineChart, PieChart } from './charts/Charts';
import { PROPERTIES, monthLabel } from '../data/financials';
import { usd, pct } from '../lib/finance';
import pm from '../pm.module.css';
import styles from './OwnerReport.module.css';

/**
 * One-click monthly owner report. Renders a clean, light "paper" document with
 * an executive summary, an AI Performance Summary, headline KPIs, an operating
 * statement, and supporting charts. "Download PDF" calls window.print(); the
 * print stylesheet isolates #pm-print-root so the browser saves just the report.
 */
export default function OwnerReport({ scope, summary, aiImpact, onClose }) {
  const { config } = usePm();
  const scopeName = scope === 'all' ? 'Entire Portfolio' : (PROPERTIES.find((p) => p.id === scope)?.name || 'Property');
  const period = monthLabel(summary.latestMonth, false);
  const s = summary;

  const last12 = s.series.slice(-12);
  const noiPoints = last12.map((m) => m.noi);
  const fmtK = (v) => `$${Math.round(v / 1000)}k`;

  const budgetClass = s.noiYTDvsBudget >= 0 ? styles.pos : styles.neg;
  const priorClass = s.noiYTDvsPrior >= 0 ? styles.pos : styles.neg;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.toolbar} onClick={(e) => e.stopPropagation()}>
        <button className={`${pm.btn} pm-no-print`} onClick={onClose}><Icon name="x" size={15} /> Close</button>
        <button className={`${pm.btn} ${pm.btnPrimary} pm-no-print`} onClick={() => window.print()}>
          <Icon name="download" size={15} /> Download PDF
        </button>
      </div>

      <div id="pm-print-root" className={styles.paper} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.head}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            {config.logo && <img className={styles.logo} src={config.logo} alt={config.companyName} />}
            <div>
              <div className={styles.brandName}>{config.companyName}</div>
              <div className={styles.docTitle}>Monthly Owner Report · {scopeName}</div>
            </div>
          </div>
          <div className={styles.period}>
            Reporting period<br /><strong style={{ fontSize: 15, color: '#1a1f29' }}>{period}</strong>
            <br />Prepared by {config.productName}
          </div>
        </div>

        {/* Executive summary */}
        <div className={styles.h2}>Executive Summary</div>
        <div className={styles.exec}>
          For <strong>{period}</strong>, {scopeName.toLowerCase()} generated <strong>{usd(s.noiMTD)}</strong> in net operating
          income (operating margin {pct(s.operatingMargin)}). Year-to-date NOI of <strong>{usd(s.noiYTD)}</strong> is{' '}
          <span className={budgetClass}>{s.noiYTDvsBudget >= 0 ? 'ahead of' : 'behind'} budget by {usd(Math.abs(s.noiYTDvsBudget))} ({pct(Math.abs(s.noiYTDvsBudgetPct))})</span>{' '}
          and <span className={priorClass}>{s.noiYTDvsPrior >= 0 ? 'up' : 'down'} {usd(Math.abs(s.noiYTDvsPrior))} ({pct(Math.abs(s.noiYTDvsPriorPct))}) vs the prior year</span>.
          Trailing-12 cash-on-cash return is <strong>{pct(s.cashOnCash)}</strong> on {usd(s.cap.cashInvested)} invested capital.
          Current physical vacancy is {pct(s.vacancyRate)} with a {pct(s.renewalRate)} lease-renewal rate.
        </div>

        {/* KPIs */}
        <div className={styles.h2}>Key Performance Indicators</div>
        <div className={styles.kpis}>
          <Kpi label="NOI (MTD)" value={usd(s.noiMTD)} />
          <Kpi label="NOI (YTD)" value={usd(s.noiYTD)} />
          <Kpi label="Cash-on-Cash" value={pct(s.cashOnCash)} />
          <Kpi label="Trailing-12 NOI" value={usd(s.noiT12)} />
          <Kpi label="Vacancy" value={pct(s.vacancyRate)} />
          <Kpi label="Renewal Rate" value={pct(s.renewalRate)} />
          <Kpi label="Delinquency" value={pct(s.delinquencyRate)} />
          <Kpi label="Bad Debt (MTD)" value={usd(s.badDebtMTD)} />
        </div>

        {/* AI Performance Summary */}
        <div className={styles.h2}>AI Performance Summary</div>
        <div className={styles.aiBox}>
          <div className={styles.aiHeadline}>
            {config.productName} AI created an estimated {usd(aiImpact.monthlyTotal)} in value this month.
          </div>
          This period, the AI auto-handled <strong>{aiImpact.inquiriesHandled.toLocaleString()}</strong> resident
          inquiries, saving roughly <strong>{aiImpact.staffHoursSaved.toLocaleString()} staff hours</strong>. Combined
          with avoided maintenance dispatches, faster leasing, and after-hours coverage, automation is on pace to add
          approximately <strong>{usd(aiImpact.annualizedTotal)}</strong> in annualized value.
          <table className={styles.table}>
            <thead><tr><th>Automation lever</th><th className={styles.num}>Volume</th><th className={styles.num}>Est. value</th></tr></thead>
            <tbody>
              {aiImpact.lines.map((l) => (
                <tr key={l.key}>
                  <td>{l.label}</td>
                  <td className={styles.num}>{l.key === 'afterHours' ? '—' : l.count.toLocaleString()}</td>
                  <td className={styles.num}>{usd(l.value)}</td>
                </tr>
              ))}
              <tr><td><strong>Total</strong></td><td className={styles.num}></td><td className={styles.num}><strong>{usd(aiImpact.monthlyTotal)}</strong></td></tr>
            </tbody>
          </table>
        </div>

        {/* Charts */}
        <div className={styles.h2}>Trends</div>
        <div className={styles.two}>
          <div>
            <div className={styles.kpiLabel} style={{ marginBottom: 6 }}>NOI — last 12 months</div>
            <LineChart height={180} labels={last12.map((m) => monthLabel(m.month))} series={[{ color: '#f5a623', points: noiPoints }]} formatY={fmtK} />
          </div>
          <div>
            <div className={styles.kpiLabel} style={{ marginBottom: 6 }}>Operating expense mix</div>
            <PieChart size={150} data={s.expenseBreakdown} formatVal={(v) => usd(v)} />
          </div>
        </div>

        {/* Operating statement backup */}
        <div className={styles.h2}>Operating Statement — Detailed Backup ({period})</div>
        <table className={styles.table}>
          <tbody>
            <tr><td><strong>Total Income</strong></td><td className={styles.num}><strong>{usd(s.incomeMTD)}</strong></td></tr>
            {s.expenseBreakdown.map((e) => (
              <tr key={e.key}><td style={{ paddingLeft: 18 }}>{e.label}</td><td className={styles.num}>({usd(e.value)})</td></tr>
            ))}
            <tr><td><strong>Total Operating Expense</strong></td><td className={styles.num}><strong>({usd(s.expenseMTD)})</strong></td></tr>
            <tr><td><strong>Net Operating Income</strong></td><td className={styles.num}><strong>{usd(s.noiMTD)}</strong></td></tr>
          </tbody>
        </table>

        <div className={styles.foot}>
          Generated by {config.productName} for {config.companyName}. Figures shown are simulated demonstration data.
          This report is for informational purposes and is not an offer, audited financial statement, or investment advice.
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value }) {
  return (
    <div className={styles.kpi}>
      <div className={styles.kpiLabel}>{label}</div>
      <div className={styles.kpiValue}>{value}</div>
    </div>
  );
}
