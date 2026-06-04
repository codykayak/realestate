/**
 * "AI Impact" model — translates automation activity into dollars saved.
 *
 * Uses transparent, defensible unit economics so the number is credible in an
 * owner report. Activity volumes come from the live module (conversations,
 * work orders, leasing) plus a simulated monthly baseline representing
 * portfolio-scale traffic, so the demo shows realistic figures.
 */

export const RATES = {
  // $ value of staff time per auto-resolved resident inquiry (≈4 min @ loaded labor)
  perInquiry: 5,
  // avoided truck roll / vendor dispatch via guided self-help
  perTruckRoll: 145,
  // value of each vacancy-day saved by instant lead response + faster screening
  perVacancyDay: 62,
  // staff time saved per automated application pre-screen
  perPrescreen: 28,
  // after-hours/weekend coverage value per month (no answering service/overtime)
  afterHoursMonthly: 1200,
};

/**
 * @param {object} live   { inquiries, truckRolls, prescreens, leasingLeads }
 * @param {number} units  portfolio unit count (scales the simulated baseline)
 */
export function computeAiImpact(live = {}, units = 0) {
  // Simulated monthly baseline scaled by portfolio size (demo realism).
  const base = {
    inquiries: Math.round(units * 6.4) + (live.inquiries || 0),
    truckRolls: Math.round(units * 0.22) + (live.truckRolls || 0),
    vacancyDaysSaved: Math.round(units * 0.85),
    prescreens: Math.round(units * 0.3) + (live.prescreens || 0),
  };

  const lines = [
    { key: 'inquiries', label: 'Resident inquiries auto-handled', count: base.inquiries, rate: RATES.perInquiry, value: base.inquiries * RATES.perInquiry },
    { key: 'truckRolls', label: 'Truck rolls avoided (self-help)', count: base.truckRolls, rate: RATES.perTruckRoll, value: base.truckRolls * RATES.perTruckRoll },
    { key: 'vacancy', label: 'Vacancy-days saved (faster leasing)', count: base.vacancyDaysSaved, rate: RATES.perVacancyDay, value: base.vacancyDaysSaved * RATES.perVacancyDay },
    { key: 'prescreens', label: 'Applications auto pre-screened', count: base.prescreens, rate: RATES.perPrescreen, value: base.prescreens * RATES.perPrescreen },
    { key: 'afterHours', label: 'After-hours coverage', count: 1, rate: RATES.afterHoursMonthly, value: RATES.afterHoursMonthly },
  ];

  const monthlyTotal = lines.reduce((s, l) => s + l.value, 0);
  const staffHoursSaved = Math.round((base.inquiries * 4 + base.prescreens * 28 + base.truckRolls * 60) / 60);

  return {
    monthlyTotal,
    annualizedTotal: monthlyTotal * 12,
    staffHoursSaved,
    inquiriesHandled: base.inquiries,
    lines,
  };
}

/** A deterministic 12-month series of AI savings for the trend chart. */
export function aiImpactSeries(monthlyTotal) {
  // Ramp from ~55% to 100% of current run-rate over the last 12 months.
  return Array.from({ length: 12 }, (_, i) => Math.round(monthlyTotal * (0.55 + (i / 11) * 0.45)));
}
