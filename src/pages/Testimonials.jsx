import { Link } from 'react-router-dom';
import SeoHead from '../components/SeoHead';
import { testimonials, caseStudies } from '../data/testimonials';
import styles from './LandingPage.module.css';
import extra from './marketing-pages.module.css';

export default function Testimonials() {
  return (
    <>
      <SeoHead title="Testimonials & Case Studies | NW Investor" description="Oregon homeowner stories — fast cash sales, probate, as-is." path="/testimonials" />
      <div className={`${styles.container} ${extra.innerPage}`}>
        <p className={extra.breadcrumb}><Link to="/">Home</Link> / Testimonials</p>
        <h1 className={styles.sectionTitle}>Homeowner Stories & Case Studies</h1>
        <p className={extra.disclaimer}>Sample reviews for demonstration until verified testimonials are published.</p>
        <div className={extra.testimonialGrid}>
          {testimonials.map((r) => (
            <article key={r.id} className={extra.testimonialCard}>
              <div className={extra.stars}>{'★'.repeat(r.rating)}</div>
              <h2 style={{ fontSize: 18, margin: '0 0 8px' }}>{r.headline}</h2>
              <p style={{ color: 'var(--nw-muted)', fontSize: 15, lineHeight: 1.6 }}>{r.body}</p>
              <footer style={{ fontSize: 13, color: 'var(--nw-dim)', marginTop: 12 }}>{r.name} · {r.location}</footer>
            </article>
          ))}
        </div>
        <h2 className={styles.sectionTitle} style={{ marginTop: 48 }}>Case studies</h2>
        {caseStudies.map((c) => (
          <div key={c.title} className={extra.card}>
            <h3 style={{ marginTop: 0 }}>{c.title}</h3>
            <p>{c.summary}</p>
            <ul>{c.bullets.map((b) => <li key={b}>{b}</li>)}</ul>
          </div>
        ))}
        <Link to="/cash-offer-calculator" className={styles.offerBtnMid}>Get Your Estimate →</Link>
      </div>
    </>
  );
}
