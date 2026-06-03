import { Link } from 'react-router-dom';
import SeoHead from '../components/SeoHead';
import { BRAND_NAME, PHONE_DISPLAY, PHONE_TEL, SITE_URL } from '../constants/brand';
import { organizationJsonLd } from '../utils/seoStructuredData';
import styles from './SellerDealTrackerPage.module.css';

const FAQ = [
  {
    q: 'What is the MacroREI seller deal tracker?',
    a: 'After you accept a cash offer, your acquisitions rep sends a private link where you can see whether your sale is at offer, under contract, or closing — without calling for every update.',
  },
  {
    q: 'Who can see my seller portal?',
    a: 'Only people with your unique link. It is not listed on Google and is meant for you and anyone you choose to share it with.',
  },
  {
    q: 'How fast can MacroREI close in Oregon?',
    a: 'Many as-is cash sales close in 14–45 days depending on title, heirship, and how quickly documents are signed.',
  },
];

export default function SellerDealTrackerPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      organizationJsonLd(),
      {
        '@type': 'WebPage',
        name: 'Seller deal tracker — cash home sale progress',
        url: `${SITE_URL}/seller-deal-tracker`,
        description: 'Track your Oregon cash home sale from offer through closing with Macro Real Estate Investing.',
        isPartOf: { '@id': `${SITE_URL}/#organization` },
      },
      {
        '@type': 'FAQPage',
        mainEntity: FAQ.map(({ q, a }) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: { '@type': 'Answer', text: a },
        })),
      },
    ],
  };

  return (
    <>
      <SeoHead
        title="Seller Deal Tracker | Track Your Cash Home Sale | MacroREI Oregon"
        description="MacroREI sellers get a private portal to track offer, under contract, and closing milestones on Oregon cash home sales. Transparent timeline, no login required."
        path="/seller-deal-tracker"
        keywords="seller portal home sale, track cash offer closing Oregon, under contract status seller, MacroREI deal tracker"
        jsonLd={jsonLd}
      />
      <article className={styles.page}>
        <header className={styles.hero}>
          <p className={styles.eyebrow}>For Oregon home sellers</p>
          <h1>See your sale move from offer to closing</h1>
          <p className={styles.lead}>
            When you work with {BRAND_NAME}, you can open a private link anytime to see where your deal stands —
            offer presented, under contract, or heading to closing.
          </p>
          <div className={styles.ctas}>
            <a href="/#offer" className={styles.primary}>Get a cash offer</a>
            <a href={`tel:${PHONE_TEL}`} className={styles.secondary}>Call {PHONE_DISPLAY}</a>
          </div>
        </header>

        <section className={styles.section}>
          <h2>Three stages sellers care about</h2>
          <ol className={styles.stages}>
            <li><strong>Offer</strong> — Your written cash offer and key terms.</li>
            <li><strong>Under contract</strong> — Purchase agreement signed; title and escrow opened.</li>
            <li><strong>Closing</strong> — Final signing and funding on the way.</li>
          </ol>
        </section>

        <section className={styles.section}>
          <h2>Common questions</h2>
          {FAQ.map(({ q, a }) => (
            <details key={q} className={styles.faq}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </section>

        <p className={styles.back}>
          <Link to="/">← Back to MacroREI home</Link>
        </p>
      </article>
    </>
  );
}
