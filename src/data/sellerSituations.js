/** SEO landing pages for motivated-seller situations (Oregon). */

export const SELLER_SITUATIONS = [
  {
    slug: 'fire-damaged-house-oregon',
    title: 'Sell a Fire Damaged House in Oregon',
    metaDescription:
      'Sell a fire damaged house in Oregon as-is for cash. No repairs, no listing fees. Macro REI buys distressed properties statewide.',
    heroAlt: 'Fire damaged house cash sale Oregon',
    headline: 'Sell Your Fire Damaged House As-Is',
    intro:
      'After a fire, insurance, contractors, and code issues can drag on for months. We buy fire damaged homes in Oregon in as-is condition so you can move on.',
    painPoints: [
      'Partial insurance payout but not enough to rebuild',
      'Smoke damage throughout — buyers won\'t finance',
      'Property sitting vacant and deteriorating',
      'Heirs don\'t want to manage repairs from out of state',
    ],
    whyCash:
      'A cash buyer takes the property with damage in place. You skip contractor bids, permit delays, and months on market.',
  },
  {
    slug: 'sell-house-with-tenants-oregon',
    title: 'Sell a Rental House With Tenants in Oregon',
    metaDescription:
      'Sell a tenant-occupied rental in Oregon without evicting first. We buy landlord properties as-is and handle tenant transitions.',
    heroAlt: 'Sell rental property with tenants Oregon',
    headline: 'Sell a House With Tenants — No Eviction Required First',
    intro:
      'Tired landlords and inherited rentals often come with leases, deposits, and problem tenants. We purchase tenant-occupied properties across Oregon.',
    painPoints: [
      'Non-paying or disruptive tenants',
      'Inherited rental you don\'t want to manage',
      'Out-of-state owner — can\'t visit the property',
      'Deferred maintenance while tenants remain',
    ],
    whyCash:
      'We structure purchases around occupied properties so you don\'t have to coordinate move-outs before closing.',
  },
  {
    slug: 'behind-on-mortgage-oregon',
    title: 'Behind on Mortgage Payments in Oregon',
    metaDescription:
      'Facing foreclosure in Oregon? Sell your house fast for cash before auction. Macro REI helps homeowners avoid foreclosure when possible.',
    heroAlt: 'Avoid foreclosure sell house fast Oregon',
    headline: 'Behind on Payments? Sell Before Foreclosure',
    intro:
      'If you\'re behind on mortgage payments or received a notice of default, time matters. A fast cash sale can help you avoid foreclosure and protect your credit.',
    painPoints: [
      'Notice of default or trustee sale date set',
      'Can\'t catch up on arrears',
      'Underwater or owe more than market value',
      'Need to relocate quickly after job loss',
    ],
    whyCash:
      'Speed matters in pre-foreclosure. We can often close in weeks — not months — and work with your timeline.',
  },
  {
    slug: 'inherited-house-probate-oregon',
    title: 'Sell an Inherited House in Oregon',
    metaDescription:
      'Sell an inherited property in Oregon — probate, multiple heirs, or affidavit of heirship. Cash offers, as-is, no realtor commissions.',
    heroAlt: 'Sell inherited house probate Oregon',
    headline: 'Inherited a House? We Buy As-Is',
    intro:
      'Inherited properties often need cleanout, repairs, and heir agreement. We help families sell without listing, showings, or months of uncertainty.',
    painPoints: [
      'Multiple heirs disagreeing on price or timing',
      'Property needs work you can\'t fund',
      'Living out of state — hard to manage sale',
      'Unsure about probate vs small estate affidavit',
    ],
    whyCash:
      'One buyer, one closing, one decision. We coordinate with your attorney when needed and buy in current condition.',
  },
  {
    slug: 'divorce-home-sale-oregon',
    title: 'Sell a House During Divorce in Oregon',
    metaDescription:
      'Need to sell the marital home fast during divorce in Oregon? Neutral cash buyer, quick closing, as-is purchase.',
    heroAlt: 'Sell house during divorce Oregon',
    headline: 'Sell the Marital Home Quickly & Neutrally',
    intro:
      'Divorce sales need speed and simplicity. A cash offer gives both parties a clear number and a defined closing date without showings and repair negotiations.',
    painPoints: [
      'Neither party wants to fund repairs',
      'One spouse still living in the home',
      'Court timeline pressure',
      'Emotional stress of traditional listing',
    ],
    whyCash:
      'Cash removes financing contingencies and reduces conflict over repair credits and buyer demands.',
  },
  {
    slug: 'tax-lien-property-oregon',
    title: 'Sell a Property With Tax Liens in Oregon',
    metaDescription:
      'Sell a house with back property taxes or tax liens in Oregon. We buy as-is and often work through lien payoffs at closing.',
    heroAlt: 'Sell house with tax liens Oregon',
    headline: 'Back Taxes or Liens? We Can Still Buy',
    intro:
      'Tax delinquency and liens scare off retail buyers. We purchase properties with tax issues and coordinate payoff at closing when possible.',
    painPoints: [
      'County tax certificate or lien filed',
      'Can\'t afford to bring taxes current',
      'Vacant land or house with years of back taxes',
      'Inherited property with unknown tax history',
    ],
    whyCash:
      'Experienced cash buyers understand lien payoff math and can close when traditional buyers walk away.',
  },
];

export function getSituationBySlug(slug) {
  return SELLER_SITUATIONS.find((s) => s.slug === slug) ?? null;
}
