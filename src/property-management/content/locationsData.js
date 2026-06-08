/**
 * Programmatic local landing pages for multifamily operators.
 * URL: /property-management/locations/[slug]
 *
 * To add a market: append an object here and add the slug to SERVICE_MARKET_SLUGS
 * in localBusiness.js (and areaServed in schema if it is a primary metro).
 */

export const LOCATIONS = [
  {
    slug: 'portland-or',
    name: 'Portland',
    regionLabel: 'Portland metro & Willamette Valley',
    county: 'Multnomah, Washington & Clackamas Counties',
    pageTitle: 'AI Property Management Software for Portland Multifamily Operators',
    metaDescription:
      'ManyDoors AI helps Portland-area multifamily operators deflect resident inquiries, automate leasing, and triage maintenance — without replacing Yardi, RealPage, or AppFolio.',
    headline: 'AI operations for Portland multifamily — without ripping out your PMS',
    subhead:
      'From inner-eastside walk-ups to suburban garden communities, Portland operators run lean site teams against heavy text volume. ManyDoors AI is the system of action on top of the PMS you already pay for.',
    marketContext: `The Portland metro carries some of Oregon's densest multifamily inventory — and some of the tightest onsite labor. Operators with 2,000–20,000 units compete for leasing and maintenance staff while residents expect sub-hour text replies. Statewide rent-policy attention and insurance volatility mean owners scrutinize NOI line by line; slow speed-to-lead and manual screening still burn vacancy days.`,
    operatorPainPoints: [
      'High inquiry volume across SMS, email, and ILS leads — phones cannot keep up after hours.',
      'Leasing teams juggling tours, applications, and fraud screening on thin headcount.',
      'Maintenance coordinators dispatching truck rolls that self-help could have deflected.',
      'Owner reports that do not itemize AI impact — renewals become a narrative fight.',
    ],
    localProof: [
      'Built for midsize portfolios that are too large for spreadsheets and too small for REIT-scale call centers.',
      'PMS-agnostic layer: works across acquisitions on different systems.',
      'U.S.-based support — not an offshore ticket queue.',
    ],
    neighborhoods: 'Serving operators across Portland, Gresham, Beaverton, Hillsboro, Lake Oswego, and Vancouver WA-adjacent portfolios.',
  },
  {
    slug: 'eugene-or',
    name: 'Eugene',
    regionLabel: 'Eugene–Springfield & Lane County',
    county: 'Lane County',
    pageTitle: 'AI Property Management Software for Eugene Multifamily Operators',
    metaDescription:
      'ManyDoors AI for Eugene and Lane County multifamily: 24/7 resident communication, automated leasing, and maintenance triage. HQ in Eugene, OR. Live demo available.',
    headline: 'Eugene-built AI for Lane County multifamily operators',
    subhead:
      'ManyDoors AI is headquartered in Eugene. We help regional operators automate the repetitive leasing and maintenance work that hits site teams every day — on top of the PMS you already run.',
    marketContext: `Eugene–Springfield blends university-driven demand with a regional hub for healthcare and public-sector employment. Multifamily operators here often manage a mix of 1970s–2000s stock and newer infill — with seasonal turnover and student-adjacent leasing spikes. Teams of 50–150 staff support thousands of units; after-hours texts and maintenance photos do not wait for Monday morning.`,
    operatorPainPoints: [
      'Turnover and leasing traffic concentrated around academic calendars.',
      'Older stock → more maintenance triage and "how do I reset the disposal?" volume.',
      'Regional operators growing by acquisition need one AI layer across properties.',
      'Owners want NOI defense without hiring another coordinator per community.',
    ],
    localProof: [
      'Headquartered in Eugene, OR — we know Lane County operating realities.',
      'Live build-and-pitch demo — explore dashboard, leasing, and maintenance in minutes.',
      'White-label ready for PMC brands serving the Willamette Valley.',
    ],
    neighborhoods: 'Eugene, Springfield, Cottage Grove, Junction City, Florence, and Lane County portfolios.',
  },
  {
    slug: 'salem-or',
    name: 'Salem',
    regionLabel: 'Salem & Marion–Polk Counties',
    county: 'Marion & Polk Counties',
    pageTitle: 'AI Property Management Software for Salem Multifamily Operators',
    metaDescription:
      'ManyDoors AI for Salem-area property managers: speed-to-lead, resident deflection, and maintenance triage for midsize multifamily portfolios in the Willamette Valley.',
    headline: 'Automate Salem multifamily ops — keep your existing PMS',
    subhead:
      'State-capital stability meets the same staffing squeeze as every mid-market metro. ManyDoors AI gives Salem operators 24/7 coverage and faster lease-up without a centralized call-center buildout.',
    marketContext: `Salem's economy anchors on government, healthcare, and logistics — steady rental demand with less hype than Portland, but the same operational math: vacancy days hurt, fraud risk is rising, and site teams answer the same resident questions hundreds of times per month. Operators stretching from West Salem to Keizer and into Polk County need scalable communication without proportional headcount.`,
    operatorPainPoints: [
      'Steady lead flow from ILS and website forms — response time still drives conversion.',
      'Application fraud and document tampering — manual review does not scale.',
      'Maintenance volume on aging suburban stock; emergencies must not sit in a queue.',
      'Competing for leasing talent against Portland wages while margins stay local.',
    ],
    localProof: [
      'Illustrative ROI model tuned for 2,000–20,000 unit sweet spot.',
      'Application audit and pre-screen automation in the leasing module.',
      'Owner portal with NOI MTD/YTD and one-click PDF reports.',
    ],
    neighborhoods: 'Salem, Keizer, West Salem, Brooks, and Marion–Polk County communities.',
  },
  {
    slug: 'corvallis-or',
    name: 'Corvallis',
    regionLabel: 'Corvallis & Benton County',
    county: 'Benton County',
    pageTitle: 'AI Property Management Software for Corvallis Multifamily Operators',
    metaDescription:
      'ManyDoors AI for Corvallis multifamily: AI resident replies, leasing automation, and maintenance triage for Benton County operators running lean onsite teams.',
    headline: 'Lean Benton County teams deserve 24/7 AI coverage',
    subhead:
      'Smaller metros still generate big text volume. ManyDoors AI deflects repetitive resident questions and speeds leasing — so Corvallis operators compete like portfolios twice their size.',
    marketContext: `Corvallis multifamily is shaped by university cycles, a tight local hiring pool, and a buyer/renter market smaller than Eugene or Portland. Operators often run dual roles — regional manager plus onsite lead — which makes after-hours coverage and speed-to-lead especially painful. One slow weekend response can mean a lost lease in a market with limited backup inventory.`,
    operatorPainPoints: [
      'Academic-year leasing spikes overwhelm small leasing offices.',
      'Residents text about packages, parking, and amenities — same questions, every week.',
      'Limited maintenance staff; mis-prioritized work orders cost retention.',
      'Hard to justify a third-party answering service on Benton County margins.',
    ],
    localProof: [
      'Target 50–70% deflection on FAQ-style resident volume (illustrative pilot metrics).',
      'Confidence-gated escalation — Fair Housing and emergencies always route to staff.',
      'Demo on sample data — no PMS integration required to explore the product.',
    ],
    neighborhoods: 'Corvallis, Philomath, and Benton County multifamily portfolios.',
  },
  {
    slug: 'bend-or',
    name: 'Bend',
    regionLabel: 'Bend & Central Oregon',
    county: 'Deschutes County',
    pageTitle: 'AI Property Management Software for Bend Multifamily Operators',
    metaDescription:
      'ManyDoors AI for Bend and Central Oregon multifamily: maintenance triage, leasing automation, and resident AI — built for fast-growth markets with thin onsite staffing.',
    headline: 'Central Oregon growth — without proportional headcount',
    subhead:
      'Bend operators scaled inventory faster than back-office staff. ManyDoors AI handles resident texts, leasing follow-up, and maintenance triage so teams focus on renewals and owner relationships.',
    marketContext: `Bend and Deschutes County saw rapid multifamily development and migration-driven demand — then the same insurance, turnover, and labor pressures as the rest of Oregon. Seasonal fluctuations and second-home adjacency mean some communities see burst traffic; operators still run on lean teams. Remote owners expect institutional-grade reporting from regional PMCs.`,
    operatorPainPoints: [
      'Growth outpaced hiring — leasing cannot manually pre-screen every application.',
      'Maintenance: emergencies (heat, water) mixed with "how-to" deflection opportunities.',
      'Higher expectations from out-of-state owners on response time and reporting.',
      'Acquisitions on different PMS platforms need one operations layer.',
    ],
    localProof: [
      'Maintenance module: emergency fast-track + self-help before truck rolls.',
      'Owner-grade NOI reporting with AI impact line items.',
      'Serving Central Oregon from our Eugene, OR headquarters.',
    ],
    neighborhoods: 'Bend, Redmond, Sisters, and Deschutes County multifamily communities.',
  },
];

export const LOCATIONS_INDEX = {
  title: 'Service areas — Oregon multifamily',
  metaDescription:
    'ManyDoors AI serves multifamily operators across Portland, Eugene, Salem, Corvallis, and Bend, Oregon. AI property management software — headquartered in Eugene, OR.',
  intro:
    'We are headquartered in Eugene, OR and market heavily across Oregon\'s core multifamily metros. Each page below describes how AI operations — resident communication, leasing, and maintenance — maps to local operator realities. Expanding to additional states; contact us for portfolio pricing outside these markets.',
};

export function getLocationBySlug(slug) {
  return LOCATIONS.find((l) => l.slug === slug);
}

export function getAllLocationSlugs() {
  return LOCATIONS.map((l) => l.slug);
}
