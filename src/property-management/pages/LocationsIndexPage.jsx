import { Link, useNavigate } from 'react-router-dom';
import { usePm } from '../context/PmContext';
import Icon from '../components/Icon';
import GatewayNavbar from '../components/GatewayNavbar';
import PmSeoHead from '../components/PmSeoHead';
import GatewayFooter from '../components/GatewayFooter';
import { LOCATIONS, LOCATIONS_INDEX } from '../content/locationsData';
import { LOCAL_BUSINESS, localBusinessJsonLd, getPmSiteUrl } from '../content/localBusiness';
import gw from './gateway.module.css';

function hrefFor(base, route) {
  const b = (base || '/property-management').replace(/\/$/, '');
  return route ? `${b}/${route}` : b;
}

export default function LocationsIndexPage() {
  const { config } = usePm();
  const navigate = useNavigate();
  const base = config.basePath;
  const enter = () => navigate(hrefFor(base, 'dashboard'));
  const path = `${base}/locations`;

  return (
    <div className={gw.gateway}>
      <PmSeoHead
        title={`${LOCATIONS_INDEX.title} | ${config.productName}`}
        description={LOCATIONS_INDEX.metaDescription}
        path={path}
        keywords="ManyDoors AI, Oregon property management software, Portland, Eugene, Salem, Corvallis, Bend, multifamily AI"
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: LOCATIONS_INDEX.title,
            description: LOCATIONS_INDEX.metaDescription,
            url: getPmSiteUrl(config, path),
          },
          localBusinessJsonLd(config, base),
        ]}
        siteBase={getPmSiteUrl(config)}
      />
      <GatewayNavbar onEnter={enter} />

      <div className={gw.gatewayInner}>
        <header className={gw.locationHero}>
          <p className={gw.eyebrow}>Headquartered in {LOCAL_BUSINESS.addressDisplay}</p>
          <h1 className={gw.sectionTitle}>{LOCATIONS_INDEX.title}</h1>
          <p className={gw.sectionSub}>{LOCATIONS_INDEX.intro}</p>
        </header>

        <div className={gw.locationGrid}>
          {LOCATIONS.map((loc) => (
            <Link
              key={loc.slug}
              to={hrefFor(base, `locations/${loc.slug}`)}
              className={gw.locationCard}
            >
              <div className={gw.locationCardRegion}>{loc.regionLabel}</div>
              <div className={gw.locationCardTitle}>{loc.name}, Oregon</div>
              <p className={gw.locationCardBlurb}>{loc.metaDescription}</p>
              <span className={gw.moduleLink}>Local market page →</span>
            </Link>
          ))}
        </div>

        <div className={gw.locationIndexFoot}>
          <button type="button" className={gw.enterBtn} onClick={enter}>
            Enter platform demo
            <Icon name="bolt" size={20} />
          </button>
          <p className={gw.kpiSub}>
            NAP for citations: {config.companyName} · {LOCAL_BUSINESS.addressDisplay} ·{' '}
            {config.supportPhone} · {config.supportEmail}
          </p>
        </div>
      </div>

      <GatewayFooter />
    </div>
  );
}
