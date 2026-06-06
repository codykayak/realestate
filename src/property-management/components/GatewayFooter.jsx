import { Link } from 'react-router-dom';
import { usePm } from '../context/PmContext';
import ft from './gatewayFooter.module.css';

function hrefFor(base, route) {
  const b = (base || '/property-management').replace(/\/$/, '');
  return route ? `${b}/${route}` : b;
}

/**
 * Gateway footer — contact placeholders and a discreet FAQ link only.
 */
export default function GatewayFooter({ showFaqLink = true }) {
  const { config } = usePm();
  const base = config.basePath;
  const phone = config.supportPhone || '(contact details coming soon)';
  const address = config.supportAddress || 'United States — full mailing address coming soon';

  return (
    <footer className={ft.footer}>
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
                <a href={`mailto:${config.supportEmail}`}>{config.supportEmail}</a>
              </li>
              <li>
                <span className={ft.contactLabel}>Phone</span>
                <span>{phone}</span>
              </li>
              <li>
                <span className={ft.contactLabel}>Office</span>
                <span>{address}</span>
              </li>
            </ul>
            <p className={ft.contactNote}>Contact details are being updated — check back soon.</p>
          </div>

          <div>
            <div className={ft.colTitle}>Demo</div>
            <p className={ft.blurb}>
              Explore the live build-and-pitch demo at{' '}
              <strong>/property-management</strong> — click Enter platform to open the operations app.
            </p>
          </div>
        </div>

        <div className={ft.footRow}>
          <span className={ft.copy}>
            © {new Date().getFullYear()} {config.companyName}. All rights reserved.
          </span>
          {showFaqLink && (
            <Link to={hrefFor(base, 'faq')} className={ft.faqLink}>
              FAQ
            </Link>
          )}
        </div>
      </div>
    </footer>
  );
}
