/**
 * Deterministic synthetic financials for the Owner Portal demo.
 *
 * Generates a realistic 24-month history per property (income, expenses by
 * category, vacancy, renewals, delinquency, budget, prior-year), plus the
 * capital structure needed for cash-on-cash. Everything is deterministic
 * (seeded math, no Math.random) so charts are stable across renders.
 *
 * In production these series come from the connected PMS general ledger; this
 * module is the local stand-in so the dashboard is fully populated for pitching.
 */

export const EXPENSE_CATEGORIES = [
  { key: 'maintenance', label: 'Maintenance & Repairs', color: '#f5a623' },
  { key: 'utilities', label: 'Utilities', color: '#58a6ff' },
  { key: 'turnover', label: 'Turnover / Make-Ready', color: '#bc8cff' },
  { key: 'payroll', label: 'Onsite Payroll', color: '#3fb950' },
  { key: 'insurance', label: 'Insurance', color: '#f778ba' },
  { key: 'taxes', label: 'Property Taxes', color: '#e3b341' },
  { key: 'management', label: 'Management Fee', color: '#56d4dd' },
  { key: 'other', label: 'Other / G&A', color: '#8b97a7' },
];

/** Small deterministic pseudo-random in [0,1) from an integer seed. */
function rng(seed) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

/** Build the trailing N month labels (YYYY-MM) ending at the current month. */
function buildMonths(n) {
  const out = [];
  const d = new Date();
  d.setDate(1);
  for (let i = n - 1; i >= 0; i--) {
    const m = new Date(d.getFullYear(), d.getMonth() - i, 1);
    out.push(`${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, '0')}`);
  }
  return out;
}

export const MONTHS = buildMonths(24);

export function monthLabel(ym, short = true) {
  const [y, m] = ym.split('-').map(Number);
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return short ? `${names[m - 1]} ${String(y).slice(2)}` : `${names[m - 1]} ${y}`;
}

const PROPERTY_PROFILES = [
  {
    id: 'p1', name: 'Maple Grove Apartments', units: 184, city: 'Eugene, OR',
    avgRent: 1485, cashInvested: 6900000, annualDebtService: 1980000, seed: 7,
  },
  {
    id: 'p2', name: 'Riverbend Commons', units: 96, city: 'Springfield, OR',
    avgRent: 1320, cashInvested: 3100000, annualDebtService: 980000, seed: 19,
  },
];

function buildMonthly(profile) {
  const { units, avgRent, seed } = profile;
  const grossPotential = units * avgRent;

  return MONTHS.map((ym, i) => {
    const t = i / 23; // 0..1 across the window (upward trend)
    const season = Math.sin((i / 12) * Math.PI * 2); // yearly seasonality

    const vacancyRate = Math.max(0.02, 0.07 - t * 0.025 + season * 0.012 + (rng(seed + i) - 0.5) * 0.01);
    const delinquencyRate = Math.max(0.005, 0.03 - t * 0.012 + (rng(seed + i * 2) - 0.5) * 0.008);
    const renewalRate = Math.min(0.92, 0.58 + t * 0.16 + season * 0.04 + (rng(seed + i * 3) - 0.5) * 0.03);

    const income = Math.round(grossPotential * (1 - vacancyRate) + grossPotential * 0.06 /* other income */);

    const expenses = {
      maintenance: Math.round(units * (58 + season * 14 + (1 - t) * 22 + rng(seed + i * 5) * 18)),
      utilities: Math.round(units * (42 + season * 16 + rng(seed + i * 6) * 8)),
      turnover: Math.round(units * (26 - t * 8 + Math.max(0, season) * 20 + rng(seed + i * 7) * 10)),
      payroll: Math.round(units * 95),
      insurance: Math.round(units * 38),
      taxes: Math.round(units * 72),
      management: Math.round(income * 0.045),
      other: Math.round(units * (22 + rng(seed + i * 9) * 10)),
    };
    const totalExpense = Object.values(expenses).reduce((s, v) => s + v, 0);
    const noi = income - totalExpense;

    // Budget set ~3% above prior-year baseline; prior year ~ NOI minus the
    // efficiency gains from automation (so YoY shows improvement).
    const priorNOI = Math.round(noi * (0.9 - t * 0.06));
    const budgetNOI = Math.round(priorNOI * 1.03);
    const badDebt = Math.round(income * delinquencyRate);

    return {
      month: ym,
      income,
      expenses,
      totalExpense,
      noi,
      vacancyRate,
      renewalRate,
      delinquencyRate,
      badDebt,
      budgetNOI,
      priorNOI,
      occupiedUnits: Math.round(units * (1 - vacancyRate)),
    };
  });
}

export const PROPERTIES = PROPERTY_PROFILES.map((p) => ({
  ...p,
  monthly: buildMonthly(p),
}));

export function getProperty(id) {
  return PROPERTIES.find((p) => p.id === id) || null;
}
