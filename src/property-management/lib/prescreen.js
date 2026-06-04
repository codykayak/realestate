/**
 * Leasing pre-screen / underwriting prequalification.
 *
 * Runs configurable knockout rules against an applicant BEFORE staff spend any
 * time, and produces an auditable explanation. Rules come from the leasing
 * feature config (per tenant), so each property manager can set their own
 * income multiple, credit floor, and pet policy. This is the deterministic
 * core; a real screening provider (e.g. SmartMove) plugs in for verified
 * credit/criminal/eviction data without changing this contract.
 */

export function prescreenApplicant(applicant, config = {}) {
  const {
    incomeToRentMultiple = 3,
    minCreditScore = 620,
    petsAllowed = true,
  } = config;

  const rent = Number(applicant.targetRent || applicant.rent || 0);
  const income = Number(applicant.income || 0);
  const credit = Number(applicant.credit || 0);

  const checks = [];

  if (rent > 0) {
    const ratio = income / rent;
    checks.push({
      label: `Income ≥ ${incomeToRentMultiple}× rent`,
      pass: ratio >= incomeToRentMultiple,
      detail: `Income $${income.toLocaleString()} vs rent $${rent.toLocaleString()} (${ratio.toFixed(1)}×)`,
    });
  } else if (income > 0) {
    checks.push({
      label: 'Income on file',
      pass: true,
      detail: `$${income.toLocaleString()}/mo (no target rent yet)`,
    });
  }

  if (credit > 0) {
    checks.push({
      label: `Credit ≥ ${minCreditScore}`,
      pass: credit >= minCreditScore,
      detail: `Reported score ${credit}`,
    });
  }

  if (applicant.pets && !petsAllowed) {
    checks.push({ label: 'Pet policy', pass: false, detail: 'Applicant has pets; property does not allow pets.' });
  }

  const failed = checks.filter((c) => !c.pass);
  const decision = failed.length === 0 ? 'qualified' : failed.length <= 1 ? 'review' : 'declined';

  return {
    decision,
    checks,
    summary:
      decision === 'qualified'
        ? 'Meets all knockout criteria — fast-track to tour/application.'
        : decision === 'review'
          ? 'Borderline — one criterion needs a human look.'
          : 'Does not meet minimum criteria.',
  };
}

export default prescreenApplicant;
