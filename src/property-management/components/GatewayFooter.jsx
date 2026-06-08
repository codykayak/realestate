import { Link } from 'react-router-dom';
import { usePm } from '../context/PmContext';
import { LOCAL_BUSINESS } from '../content/localBusiness';
import { LOCATIONS } from '../content/locationsData';
import ft from './gatewayFooter.module.css';

function hrefFor(base, route) {
  const b = (base || '/property-management').replace(/\/$/, '');
  return route ? `${b}/${route}` : b;
}

/**
 * Gateway footer — consistent NAP for local citations + discreet FAQ / service-area links.
 */
export default function GatewayFooter({ showFaqLink = true }) {
  const { config } = usePm();
  const base = config.basePath;
  const phone = config.supportPhone || '541-321-2630';
  const phoneTel = phone.replace(/\D/g, '');
  const address = config.supportAddress || LOCAL_BUSINESS.addressDisplay;

  return (
    <footer className={ft.footer} itemScope itemType="https://schema.org/LocalBusiness">
      <meta itemProp="name" content={config.companyName} />
      <meta itemProp="email" content={config.supportEmail} />
      <div className={ft.inner}>
        <div className={ft.grid}>
          <div>
            <div className={ft.brand}>{config.productName}</div>
            <p className={ft.blurb}>{config.productTagline}</p>
            <p className={ft.site}>{config.futureSite || 'manydoorsai.com'}</p>
          </div>

          <div>
            <div className={ft.colTitle}>Contact</div>
            <ul className={ft.contactList}>
              <li>
                <span className={ft.contactLabel}>Email</span>
                <a href={`mailto:${config.supportEmail}`} itemProp="email">{config.supportEmail}</a>
              </li>
              <li>
                <span className={ft.contactLabel}>Phone</span>
                <a href={`tel:${phoneTel}`} itemProp="telephone">{phone}</a>
              </li>
              <li itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
                <span className={ft.contactLabel}>Office</span>
                <span>
                  <span itemProp="addressLocality">{LOCAL_BUSINESS.addressLocality}</span>,{' '}
                  <span itemProp="addressRegion">{LOCAL_BUSINESS.addressRegion}</span>
                </span>
              </li>
            </ul>
          </div>

          <div>
            <div className={ft.colTitle}>Oregon service areas</div>
            <ul className={ft.areaList}>
              {LOCATIONS.map((loc) => (
                <li key={loc.slug}>
                  <Link to={hrefFor(base, `locations/${loc.slug}`)}>{loc.name}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={ft.footRow}>
          <span className={ft.copy}>
            © {new Date().getFullYear()} {config.companyName}. {address}
          </span>
          <div className={ft.footLinks}>
            <Link to={hrefFor(base, 'locations')} className={ft.faqLink}>
              All service areas
            </Link>
            {showFaqLink && (
              <Link to={hrefFor(base, 'faq')} className={ft.faqLink}>
                FAQ
              </Link>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
