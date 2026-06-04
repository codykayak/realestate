/**
 * Finance/aggregation helpers for the Owner Portal.
 *
 * Pure functions over the financial series (portfolio or single property):
 * NOI roll-ups (MTD/YTD vs budget vs last year), cash-on-cash, expense
 * breakdowns, occupancy/renewal/delinquency, a simple linear forecast, a
 * what-if simulator, and portfolio benchmarking. Provider-agnostic — feed it
 * PMS-sourced series in production without changing callers.
 */

import { PROPERTIES, EXPENSE_CATEGORIES, MONTHS } from '../data/financials';

const fmtUSD = (n, frac = 0) =>
  (n < 0 ? '-' : '') + '$' + Math.abs(Math.round(n)).toLocaleString(undefined, { maximumFractionDigits: frac });
export const usd = fmtUSD;
export const pct = (n, frac = 1) => `${(n * 100).toFixed(frac)}%`;

/** Sum two expense maps. */
function addExpenses(a, b) {
  const out = { ...a };
  for (const c of EXPENSE_CATEGORIES) out[c.key] = (out[c.key] || 0) + (b[c.key] || 0);
  return out;
}

/**
 * Build a combined monthly series across the given properties (or one).
 * Returns an array aligned to MONTHS.
 */
export function buildSeries(propertyIds = null) {
  const props = propertyIds ? PROPERTIES.filter((p) => propertyIds.includes(p.id)) : PROPERTIES;
  return MONTHS.map((month, i) => {
    let income = 0, totalExpense = 0, noi = 0, budgetNOI = 0, priorNOI = 0, badDebt = 0, occupiedUnits = 0, units = 0;
    let expenses = {};
    let vacWeighted = 0, renWeighted = 0, delWeighted = 0;
    for (const p of props) {
      const m = p.monthly[i];
      income += m.income;
      totalExpense += m.totalExpense;
      noi += m.noi;
      budgetNOI += m.budgetNOI;
      priorNOI += m.priorNOI;
      badDebt += m.badDebt;
      occupiedUnits += m.occupiedUnits;
      units += p.units;
      expenses = addExpenses(expenses, m.expenses);
      vacWeighted += m.vacancyRate * p.units;
      renWeighted += m.renewalRate * p.units;
      delWeighted += m.delinquencyRate * p.units;
    }
    return {
      month, income, totalExpense, noi, budgetNOI, priorNOI, badDebt, expenses,
      occupiedUnits, units,
      vacancyRate: units ? vacWeighted / units : 0,
      renewalRate: units ? renWeighted / units : 0,
      delinquencyRate: units ? delWeighted / units : 0,
    };
  });
}

function capital(propertyIds = null) {
  const props = propertyIds ? PROPERTIES.filter((p) => propertyIds.includes(p.id)) : PROPERTIES;
  return props.reduce(
    (acc, p) => ({
      cashInvested: acc.cashInvested + p.cashInvested,
      annualDebtService: acc.annualDebtService + p.annualDebtService,
      units: acc.units + p.units,
    }),
    { cashInvested: 0, annualDebtService: 0, units: 0 },
  );
}

/** Headline KPIs for a property selection. */
export function summarize(propertyIds = null) {
  const series = buildSeries(propertyIds);
  const cap = capital(propertyIds);
  const latest = series[series.length - 1];
  const currentYear = latest.month.slice(0, 4);
  const ytd = series.filter((s) => s.month.startsWith(currentYear));

  const noiMTD = latest.noi;
  const noiYTD = ytd.reduce((s, m) => s + m.noi, 0);
  const budgetYTD = ytd.reduce((s, m) => s + m.budgetNOI, 0);
  const priorYTD = ytd.reduce((s, m) => s + m.priorNOI, 0);

  // Annualized cash-on-cash from trailing-12 NOI.
  const t12 = series.slice(-12);
  const noiT12 = t12.reduce((s, m) => s + m.noi, 0);
  const cashFlow = noiT12 - cap.annualDebtService;
  const cashOnCash = cap.cashInvested ? cashFlow / cap.cashInvested : 0;

  const incomeMTD = latest.income;
  const expenseMTD = latest.totalExpense;

  return {
    series,
    cap,
    latestMonth: latest.month,
    noiMTD,
    noiYTD,
    budgetYTD,
    priorYTD,
    noiYTDvsBudget: noiYTD - budgetYTD,
    noiYTDvsPrior: noiYTD - priorYTD,
    noiYTDvsBudgetPct: budgetYTD ? (noiYTD - budgetYTD) / budgetYTD : 0,
    noiYTDvsPriorPct: priorYTD ? (noiYTD - priorYTD) / priorYTD : 0,
    cashOnCash,
    cashFlowT12: cashFlow,
    noiT12,
    incomeMTD,
    expenseMTD,
    operatingMargin: incomeMTD ? noiMTD / incomeMTD : 0,
    vacancyRate: latest.vacancyRate,
    renewalRate: latest.renewalRate,
    delinquencyRate: latest.delinquencyRate,
    badDebtMTD: latest.badDebt,
    expenseBreakdown: EXPENSE_CATEGORIES.map((c) => ({
      key: c.key, label: c.label, color: c.color, value: latest.expenses[c.key] || 0,
    })),
  };
}

/** Per-property rows for benchmarking. */
export function benchmark() {
  return PROPERTIES.map((p) => {
    const s = summarize([p.id]);
    return {
      id: p.id,
      name: p.name,
      units: p.units,
      noiT12: s.noiT12,
      noiPerUnit: s.noiT12 / p.units,
      cashOnCash: s.cashOnCash,
      vacancyRate: s.vacancyRate,
      renewalRate: s.renewalRate,
      delinquencyRate: s.delinquencyRate,
      maintPerUnitT12: s.series.slice(-12).reduce((sum, m) => sum + (m.expenses.maintenance || 0), 0) / p.units,
      operatingMargin: s.operatingMargin,
    };
  });
}

/** Maintenance cost per unit, monthly, for the selection. */
export function maintenancePerUnit(propertyIds = null) {
  const series = buildSeries(propertyIds);
  return series.map((m) => ({
    month: m.month,
    value: m.units ? (m.expenses.maintenance || 0) / m.units : 0,
  }));
}

/** Simple least-squares linear forecast of NOI for `horizon` months. */
export function forecastNOI(propertyIds = null, horizon = 6) {
  const series = buildSeries(propertyIds);
  const ys = series.map((m) => m.noi);
  const n = ys.length;
  const xs = ys.map((_, i) => i);
  const sx = xs.reduce((a, b) => a + b, 0);
  const sy = ys.reduce((a, b) => a + b, 0);
  const sxy = xs.reduce((a, x, i) => a + x * ys[i], 0);
  const sxx = xs.reduce((a, x) => a + x * x, 0);
  const slope = (n * sxy - sx * sy) / (n * sxx - sx * sx);
  const intercept = (sy - slope * sx) / n;
  const out = [];
  for (let i = 0; i < horizon; i++) {
    const x = n + i;
    out.push(Math.round(intercept + slope * x));
  }
  return { slope, forecast: out };
}

/**
 * What-if simulator. Applies deltas to the latest month and annualizes.
 * @param {object} opts { vacancyDelta, rentDelta, maintenanceDelta, delinquencyDelta }
 *   all as fractional changes (e.g. -0.02 = reduce vacancy by 2 pts).
 */
export function whatIf(propertyIds = null, opts = {}) {
  const { vacancyDelta = 0, rentDelta = 0, maintenanceDelta = 0, delinquencyDelta = 0 } = opts;
  const base = summarize(propertyIds);
  const series = base.series;
  const latest = series[series.length - 1];
  const cap = base.cap;

  // Approximate gross potential rent from income + vacancy loss.
  const grossPotential = latest.income / (1 - latest.vacancyRate || 1);

  const newVacancy = Math.min(0.5, Math.max(0, latest.vacancyRate + vacancyDelta));
  const newIncome = grossPotential * (1 + rentDelta) * (1 - newVacancy);

  const newMaint = (latest.expenses.maintenance || 0) * (1 + maintenanceDelta);
  const expenseDelta = newMaint - (latest.expenses.maintenance || 0);
  const newExpense = latest.totalExpense + expenseDelta;

  const newBadDebt = latest.income * Math.max(0, latest.delinquencyRate + delinquencyDelta);
  const oldBadDebt = latest.badDebt;

  const newNOImonthly = newIncome - newExpense - (newBadDebt - oldBadDebt);
  const annualNOIdelta = (newNOImonthly - latest.noi) * 12;
  const newCashOnCash = cap.cashInvested
    ? (base.noiT12 + annualNOIdelta - cap.annualDebtService) / cap.cashInvested
    : 0;

  return {
    baseNOImonthly: latest.noi,
    newNOImonthly: newNOImonthly,
    monthlyDelta: newNOImonthly - latest.noi,
    annualNOIdelta,
    baseCashOnCash: base.cashOnCash,
    newCashOnCash,
  };
}
