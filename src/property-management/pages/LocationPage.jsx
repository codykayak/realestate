import { Link, useNavigate, useParams } from 'react-router-dom';
import { usePm } from '../context/PmContext';
import Icon from '../components/Icon';
import GatewayNavbar from '../components/GatewayNavbar';
import PmSeoHead from '../components/PmSeoHead';
import GatewayFooter from '../components/GatewayFooter';
import { getLocationBySlug } from '../content/locationsData';
import { locationPageJsonLd, getPmSiteUrl } from '../content/localBusiness';
import gw from './gateway.module.css';

function hrefFor(base, route) {
  const b = (base || '/property-management').replace(/\/$/, '');
  return route ? `${b}/${route}` : b;
}

export default function LocationPage() {
  const { citySlug } = useParams();
  const { config } = usePm();
  const navigate = useNavigate();
  const base = config.basePath;
  const location = getLocationBySlug(citySlug);
  const enter = () => navigate(hrefFor(base, 'dashboard'));

  if (!location) {
    return (
      <div className={gw.gateway}>
        <GatewayNavbar onEnter={enter} />
        <div className={gw.gatewayInner}>
          <h1 className={gw.sectionTitle}>Location not found</h1>
          <Link to={hrefFor(base, 'locations')}>View all service areas</Link>
        </div>
        <GatewayFooter />
      </div>
    );
  }

  const path = `${base}/locations/${location.slug}`;
  const jsonLd = locationPageJsonLd(config, location, base);

  return (
    <div className={gw.gateway}>
      <PmSeoHead
        title={`${location.pageTitle} | ${config.productName}`}
        description={location.metaDescription}
        path={path}
        keywords={`${config.productName}, property management software, multifamily, ${location.name} Oregon, AI leasing, maintenance triage`}
        jsonLd={jsonLd}
        siteBase={getPmSiteUrl(config)}
      />
      <GatewayNavbar onEnter={enter} />

      <div className={gw.gatewayInner}>
        <nav className={gw.locationBreadcrumb} aria-label="Breadcrumb">
          <Link to={hrefFor(base, '')}>Home</Link>
          <span aria-hidden="true"> / </span>
          <Link to={hrefFor(base, 'locations')}>Service areas</Link>
          <span aria-hidden="true"> / </span>
          <span>{location.name}</span>
        </nav>

        <header className={gw.locationHero}>
          <p className={gw.eyebrow}>{location.regionLabel}</p>
          <h1 className={gw.sectionTitle}>{location.headline}</h1>
          <p className={gw.sectionSub}>{location.subhead}</p>
          <div className={gw.locationCtaRow}>
            <button type="button" className={gw.enterBtn} onClick={enter}>
              Enter live demo
              <Icon name="bolt" size={20} />
            </button>
            <a href={`tel:${(config.supportPhone || '').replace(/\D/g, '')}`} className={gw.locationPhone}>
              {config.supportPhone}
            </a>
          </div>
        </header>

        <article className={gw.locationArticle}>
          <section>
            <h2 className={gw.locationH2}>Multifamily reality in {location.name}</h2>
            <p className={gw.locationProse}>{location.marketContext}</p>
          </section>

          <section>
            <h2 className={gw.locationH2}>What operators in {location.county} are solving</h2>
            <ul className={gw.bulletList}>
              {location.operatorPainPoints.map((p) => <li key={p}>{p}</li>)}
            </ul>
          </section>

          <section>
            <h2 className={gw.locationH2}>How {config.productName} helps</h2>
            <ul className={gw.bulletList}>
              {location.localProof.map((p) => <li key={p}>{p}</li>)}
            </ul>
          </section>

          <p className={gw.locationNeighborhoods}>
            <strong>Coverage:</strong> {location.neighborhoods}
          </p>

          <div className={gw.locationModuleLinks}>
            <Link to={hrefFor(base, 'features/communications')}>AI resident communication →</Link>
            <Link to={hrefFor(base, 'features/leasing')}>Automated leasing →</Link>
            <Link to={hrefFor(base, 'features/maintenance')}>Maintenance triage →</Link>
          </div>
        </article>

        <p className={gw.locationOtherMarkets}>
          Other Oregon markets:{' '}
          <Link to={hrefFor(base, 'locations')}>Portland, Eugene, Salem, Corvallis & Bend</Link>
        </p>
      </div>

      <GatewayFooter />
    </div>
  );
}
