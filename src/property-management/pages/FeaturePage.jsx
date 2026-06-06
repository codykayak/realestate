import { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { usePm } from '../context/PmContext';
import Icon from '../components/Icon';
import GatewayNavbar from '../components/GatewayNavbar';
import PmSeoHead from '../components/PmSeoHead';
import { BarChart, GroupedBar, LineChart } from '../components/charts/Charts';
import {
  FEATURE_BY_SLUG,
  FEATURE_PAGES,
  GATEWAY_ASSETS,
  US_SUPPORT,
  featureJsonLd,
} from '../content/gatewayContent';
import {
  DEFLECTION_COMPARISON,
  SPEED_TO_LEAD_DATA,
  computePortfolioRoi,
  DEFAULT_PORTFOLIO,
} from '../developer-admin/pitchData';
import { summarize, usd } from '../lib/finance';
import { monthLabel } from '../data/financials';
import gw from './gateway.module.css';

function hrefFor(base, route) {
  const b = (base || '/property-management').replace(/\/$/, '');
  return route ? `${b}/${route}` : b;
}

export default function FeaturePage() {
  const { slug } = useParams();
  const { config, tenant } = usePm();
  const navigate = useNavigate();
  const base = config.basePath;
  const feature = FEATURE_BY_SLUG[slug];

  const units = (tenant?.properties || []).reduce((s, p) => s + (p.units || 0), 0) || DEFAULT_PORTFOLIO.units;
  const roi = useMemo(
    () => computePortfolioRoi({ units, avgRent: DEFAULT_PORTFOLIO.avgRent, properties: DEFAULT_PORTFOLIO.properties }),
    [units],
  );
  const fin = useMemo(() => summarize(null), []);
  const last12 = fin.series.slice(-12);

  const enter = () => navigate(hrefFor(base, 'dashboard'));

  if (!feature) {
    return (
      <div className={gw.gateway}>
        <GatewayNavbar onEnter={enter} />
        <div className={gw.gatewayInner}>
          <h1>Feature not found</h1>
          <Link to={hrefFor(base, '')}>Back to gateway home</Link>
        </div>
      </div>
    );
  }

  const chartBlock = () => {
    switch (feature.chartKey) {
      case 'deflection':
        return (
          <GroupedBar
            labels={DEFLECTION_COMPARISON.labels}
            series={DEFLECTION_COMPARISON.series}
            height={220}
            formatY={(v) => `${v}%`}
          />
        );
      case 'speedToLead':
        return (
          <BarChart
            data={SPEED_TO_LEAD_DATA.labels.map((label, i) => ({
              label,
              value: SPEED_TO_LEAD_DATA.conversionIndex[i],
            }))}
            height={220}
            formatY={(v) => `${v}`}
          />
        );
      case 'maintenance':
        return (
          <BarChart
            data={roi.lines
              .filter((l) => l.key === 'maintenance' || l.key === 'afterHours')
              .map((l) => ({ label: l.key, value: l.value }))}
            height={220}
            formatY={(v) => `$${Math.round(v / 1000)}k`}
          />
        );
      case 'noi':
        return (
          <LineChart
            labels={last12.map((m) => monthLabel(m.month))}
            series={[
              { label: 'NOI', points: last12.map((m) => m.noi), color: '#00d2d3' },
              { label: 'Budget', points: last12.map((m) => m.budgetNOI), color: '#58a6ff', dashed: true },
            ]}
            height={220}
            formatY={(v) => `$${Math.round(v / 1000)}k`}
          />
        );
      default:
        return (
          <BarChart
            data={roi.lines.slice(0, 4).map((l) => ({ label: l.key, value: l.value }))}
            height={220}
            formatY={(v) => `$${Math.round(v / 1000)}k`}
          />
        );
    }
  };

  const others = FEATURE_PAGES.filter((f) => f.slug !== feature.slug).slice(0, 3);

  return (
    <div className={gw.gateway}>
      <PmSeoHead
        title={`${feature.title} | ${config.productName}`}
        description={feature.metaDescription}
        path={`${base}/features/${feature.slug}`}
        keywords={`${config.productName}, property management AI, ${feature.slug}, multifamily, NOI, ${config.futureSite}`}
        ogImage={feature.image || GATEWAY_ASSETS.softwareImage}
        jsonLd={featureJsonLd(config, feature, base)}
      />
      <GatewayNavbar onEnter={enter} />

      <div className={gw.gatewayInner}>
        <article className={gw.featureArticle} itemScope itemType="https://schema.org/WebPage">
          <header className={gw.featureHero}>
            <p className={gw.eyebrow}>
              <Icon name={feature.icon} size={14} />
              {' '}
              {config.productName} feature
            </p>
            <h1 className={gw.heroTitle} itemProp="name">{feature.title}</h1>
            <p className={gw.heroLead} itemProp="description">{feature.tagline}</p>
          </header>

          <div className={gw.savingsGrid}>
            <div className={gw.savingsCard}>
              <div className={gw.savingsLabel}>Time saved</div>
              <div className={gw.savingsValue}>{feature.savings.time}</div>
            </div>
            <div className={gw.savingsCard}>
              <div className={gw.savingsLabel}>Money impact</div>
              <div className={gw.savingsValue}>{feature.savings.money}</div>
            </div>
            <div className={`${gw.savingsCard} ${gw.savingsCardAccent}`}>
              <div className={gw.savingsLabel}>{US_SUPPORT.headline}</div>
              <ul className={gw.supportList}>
                {US_SUPPORT.bullets.map((b) => <li key={b}>{b}</li>)}
              </ul>
            </div>
          </div>

          <div className={gw.featureBody}>
            <div className={gw.featureCopy}>
              {feature.sections.map((s) => (
                <section key={s.heading}>
                  <h2 className={gw.sectionTitle}>{s.heading}</h2>
                  <p className={gw.sectionSub}>{s.body}</p>
                </section>
              ))}

              <div className={gw.metricRow}>
                {feature.metrics.map((m) => (
                  <div key={m.label} className={gw.metricPill}>
                    <div className={gw.metricPillValue}>{m.value}</div>
                    <div className={gw.metricPillLabel}>{m.label}</div>
                    <div className={gw.kpiSub}>{m.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            <aside className={gw.featureAside}>
              <div className={gw.chartCard}>
                <div className={gw.chartLabel}>Illustrative impact</div>
                {chartBlock()}
              </div>
              {feature.image && (
                <img
                  src={feature.image}
                  alt={`${feature.title} — ${config.productName} software for property managers and investors`}
                  className={gw.heroImg}
                />
              )}
            </aside>
          </div>

          <section className={gw.relatedSection}>
            <h2 className={gw.sectionTitle}>Explore more modules</h2>
            <div className={gw.relatedGrid}>
              {others.map((f) => (
                <Link key={f.slug} to={hrefFor(base, `features/${f.slug}`)} className={gw.relatedCard}>
                  <Icon name={f.icon} size={18} />
                  <span>{f.title}</span>
                </Link>
              ))}
            </div>
          </section>

          <footer className={gw.footerCta}>
            <p className={gw.sectionSub}>
              See {feature.title} live in the demo — {usd(roi.monthlyTotal)}/mo illustrative impact on {units.toLocaleString()} units.
            </p>
            <button type="button" className={gw.enterBtn} onClick={enter}>
              Enter {config.productName}
              <Icon name="bolt" size={22} />
            </button>
          </footer>
        </article>
      </div>
    </div>
  );
}
