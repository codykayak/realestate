/**
 * Property Management module — entry point.
 *
 * Gateway landing at `/property-management`; operations app at sub-routes.
 */

import { lazy, Suspense, useState } from 'react';
import { Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import { PmProvider, usePm } from './context/PmContext';
import { FEATURE_CATEGORIES } from './config/featureRegistry';
import Icon from './components/Icon';
import ErrorBoundary from './components/ErrorBoundary';
import OnboardingBanner from './components/OnboardingBanner';
import OnboardingWizard from './components/OnboardingWizard';
import GatewayPage from './pages/GatewayPage';
import Dashboard from './pages/Dashboard';
import OwnerPortal from './pages/OwnerPortal';
import Communications from './pages/Communications';
import Leasing from './pages/Leasing';
import Maintenance from './pages/Maintenance';
import Residents from './pages/Residents';
import KnowledgeBase from './pages/KnowledgeBase';
import Settings from './pages/Settings';
import styles from './pm.module.css';
import './components/print.css';

const DEV_ADMIN_ENABLED = import.meta.env.VITE_PM_DEV_ADMIN !== 'false';
const DevAdminRoute = DEV_ADMIN_ENABLED ? lazy(() => import('./devAdminRoute.jsx')) : null;

const PAGE_MAP = {
  dashboard: Dashboard,
  owner: OwnerPortal,
  communications: Communications,
  leasing: Leasing,
  maintenance: Maintenance,
  residents: Residents,
  knowledge: KnowledgeBase,
  settings: Settings,
};

function hrefFor(base, route) {
  const b = (base || '/property-management').replace(/\/$/, '');
  return route ? `${b}/${route}` : b;
}

function isGatewayPath(pathname, basePath) {
  const base = (basePath || '/property-management').replace(/\/$/, '');
  return pathname === base || pathname === `${base}/`;
}

function Sidebar() {
  const { config, tenant, features } = usePm();
  const enabled = features.filter((f) => f.enabled);
  const base = config.basePath;

  const order = [
    FEATURE_CATEGORIES.CORE,
    FEATURE_CATEGORIES.OWNER,
    FEATURE_CATEGORIES.AUTOMATION,
    FEATURE_CATEGORIES.OPERATIONS,
    FEATURE_CATEGORIES.ADMIN,
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        {config.logo ? (
          <img src={config.logo} alt={config.companyName} />
        ) : (
          <Icon name="home" size={28} />
        )}
        <div className={styles.brandText}>
          <span className={styles.brandName}>{config.productName}</span>
          <span className={styles.brandSub}>{tenant?.name || config.companyName}</span>
        </div>
      </div>

      <div className={styles.tenantPill}>
        <span className={styles.tenantDot} />
        <span>{tenant?.name || 'Demo Tenant'}</span>
      </div>

      <NavLink
        to={hrefFor(base, '')}
        end
        className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navActive : ''}`}
      >
        <Icon name="home" size={18} className={styles.navIcon} />
        <span>Gateway home</span>
      </NavLink>

      {order.map((cat) => {
        const items = enabled.filter((f) => f.category === cat);
        if (!items.length) return null;
        return (
          <div key={cat}>
            <div className={styles.sectionTitle} style={{ margin: '14px 0 6px', paddingLeft: 8 }}>{cat}</div>
            {items.map((f) => (
              <NavLink
                key={f.id}
                to={hrefFor(base, f.route)}
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
      {DEV_ADMIN_ENABLED && DevAdminRoute && (
        <NavLink
          to={hrefFor(base, 'developer-admin')}
          className={({ isActive }) => `${styles.navItem} ${styles.navDev} ${isActive ? styles.navActive : ''}`}
          title="Internal engineering docs, pitch deck, and tools"
        >
          <Icon name="settings" size={18} className={styles.navIcon} />
          <span>Developer admin</span>
        </NavLink>
      )}
      <div className={styles.sidebarFoot}>
        {config.productName} · {config.futureSite}
        <br />Data is local to this browser until Firebase is connected.
      </div>
    </aside>
  );
}

function DevAdminFallback() {
  return (
    <div className={styles.content}>
      <div className={styles.hint}>Loading developer tools…</div>
    </div>
  );
}

function ModuleInner() {
  const { config, features, onboardingComplete, completeOnboarding, featureMap } = usePm();
  const location = useLocation();
  const enabledIds = new Set(features.filter((f) => f.enabled).map((f) => f.id));
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const defaultTechs = featureMap.maintenance?.config?.technicians || [];
  const gateway = isGatewayPath(location.pathname, config.basePath);

  return (
    <div
      className={styles.app}
      style={{ '--pm-accent': config.accent, '--pm-accent-soft': config.accentSoft }}
    >
      {!gateway && <Sidebar />}
      <main className={gateway ? styles.mainFull : styles.main}>
        {!gateway && !onboardingComplete && (
          <OnboardingBanner onStart={() => setOnboardingOpen(true)} />
        )}
        <ErrorBoundary key={location.pathname}>
          <Routes>
            <Route index element={<GatewayPage />} />
            {features.map((f) => {
              if (!f.route) return null;
              const Page = PAGE_MAP[f.id];
              if (!Page || !enabledIds.has(f.id)) return null;
              return <Route key={f.id} path={f.route} element={<Page />} />;
            })}
            {DEV_ADMIN_ENABLED && DevAdminRoute && (
              <Route
                path="developer-admin"
                element={(
                  <Suspense fallback={<DevAdminFallback />}>
                    <DevAdminRoute />
                  </Suspense>
                )}
              />
            )}
            <Route path="*" element={<Navigate to={config.basePath} replace />} />
          </Routes>
        </ErrorBoundary>
      </main>

      {!gateway && (
        <OnboardingWizard
          open={onboardingOpen}
          onClose={() => setOnboardingOpen(false)}
          onComplete={completeOnboarding}
          defaultTechnicians={defaultTechs}
        />
      )}
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
