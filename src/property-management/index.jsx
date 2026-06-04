/**
 * Property Management module — entry point.
 *
 * This is the ONLY file the host app imports. Everything below lives entirely
 * inside `src/property-management/**` with zero host-site imports, so the whole
 * folder can be lifted into another site (or its own repo) and mounted at any
 * base path with just a config/env change.
 *
 * The host mounts this at `/property-management/*`; internal navigation uses
 * relative routes so the base path is not hard-coded.
 */

import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { PmProvider, usePm } from './context/PmContext';
import { FEATURE_CATEGORIES } from './config/featureRegistry';
import Icon from './components/Icon';
import Dashboard from './pages/Dashboard';
import Communications from './pages/Communications';
import Leasing from './pages/Leasing';
import Maintenance from './pages/Maintenance';
import Residents from './pages/Residents';
import KnowledgeBase from './pages/KnowledgeBase';
import Settings from './pages/Settings';
import styles from './pm.module.css';

const PAGE_MAP = {
  dashboard: Dashboard,
  communications: Communications,
  leasing: Leasing,
  maintenance: Maintenance,
  residents: Residents,
  knowledge: KnowledgeBase,
  settings: Settings,
};

function Sidebar() {
  const { config, tenant, features } = usePm();
  const enabled = features.filter((f) => f.enabled);

  const order = [
    FEATURE_CATEGORIES.CORE,
    FEATURE_CATEGORIES.AUTOMATION,
    FEATURE_CATEGORIES.OPERATIONS,
    FEATURE_CATEGORIES.ADMIN,
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        {config.logo ? <img src={config.logo} alt={config.companyName} /> : <Icon name="home" size={28} />}
        <div className={styles.brandText}>
          <span className={styles.brandName}>{config.productName}</span>
          <span className={styles.brandSub}>{config.companyName}</span>
        </div>
      </div>

      <div className={styles.tenantPill}>
        <span className={styles.tenantDot} />
        <span>{tenant?.name || 'Demo Tenant'}</span>
      </div>

      {order.map((cat) => {
        const items = enabled.filter((f) => f.category === cat);
        if (!items.length) return null;
        return (
          <div key={cat}>
            <div className={styles.sectionTitle} style={{ margin: '14px 0 6px', paddingLeft: 8 }}>{cat}</div>
            {items.map((f) => (
              <NavLink
                key={f.id}
                to={f.route}
                end={f.route === ''}
                className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navActive : ''}`}
              >
                <Icon name={f.icon} size={18} className={styles.navIcon} />
                <span>{f.name}</span>
              </NavLink>
            ))}
          </div>
        );
      })}

      <div className={styles.navSpacer} />
      <div className={styles.sidebarFoot}>
        {config.productName} · build-and-pitch demo
        <br />Data is local to this browser until a Firebase project is connected.
      </div>
    </aside>
  );
}

function ModuleInner() {
  const { config, features } = usePm();
  const enabledIds = new Set(features.filter((f) => f.enabled).map((f) => f.id));

  return (
    <div
      className={styles.app}
      style={{ '--pm-accent': config.accent, '--pm-accent-soft': config.accentSoft }}
    >
      <Sidebar />
      <main className={styles.main}>
        <Routes>
          <Route index element={<Dashboard />} />
          {features.map((f) => {
            if (f.id === 'dashboard' || !f.route) return null;
            const Page = PAGE_MAP[f.id];
            if (!Page || !enabledIds.has(f.id)) return null;
            return <Route key={f.id} path={f.route} element={<Page />} />;
          })}
          <Route path="*" element={<Navigate to="" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function PropertyManagement() {
  return (
    <PmProvider>
      <ModuleInner />
    </PmProvider>
  );
}
