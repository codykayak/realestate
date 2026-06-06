import { NavLink, useNavigate } from 'react-router-dom';
import { usePm } from '../context/PmContext';
import Icon from './Icon';
import { FEATURE_PAGES } from '../content/gatewayContent';
import nav from './gatewayNavbar.module.css';

function hrefFor(base, route) {
  const b = (base || '/property-management').replace(/\/$/, '');
  return route ? `${b}/${route}` : b;
}

/**
 * Top navigation for gateway marketing pages — mirrors sidebar branding
 * (logo, product name, tenant) with horizontal links into feature pages.
 */
export default function GatewayNavbar({ onEnter }) {
  const { config, tenant } = usePm();
  const navigate = useNavigate();
  const base = config.basePath;

  const enter = onEnter || (() => navigate(hrefFor(base, 'dashboard')));

  return (
    <header className={nav.bar}>
      <div className={nav.inner}>
        <NavLink to={hrefFor(base, '')} end className={nav.brand}>
          {config.logo ? (
            <img src={config.logo} alt={`${config.productName} logo`} className={nav.logo} />
          ) : (
            <Icon name="home" size={28} />
          )}
          <div className={nav.brandText}>
            <span className={nav.brandName}>{config.productName}</span>
            <span className={nav.brandSub}>{tenant?.name || config.companyName}</span>
          </div>
        </NavLink>

        <nav className={nav.links} aria-label="Product features">
          {FEATURE_PAGES.map((f) => (
            <NavLink
              key={f.slug}
              to={hrefFor(base, `features/${f.slug}`)}
              className={({ isActive }) => `${nav.link} ${isActive ? nav.linkActive : ''}`}
            >
              <Icon name={f.icon} size={16} />
              <span className={nav.linkLabel}>{f.title.split(' ').slice(0, 2).join(' ')}</span>
            </NavLink>
          ))}
        </nav>

        <button type="button" className={nav.enterBtn} onClick={enter}>
          Enter platform
          <Icon name="bolt" size={16} />
        </button>
      </div>
    </header>
  );
}
