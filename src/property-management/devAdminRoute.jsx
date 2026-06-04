/**
 * Isolated entry for Developer Admin — imported ONLY as a lazy chunk.
 * Do not import DeveloperAdmin.jsx from index.jsx directly.
 */
import { lazy, Suspense } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import styles from './pm.module.css';

const DeveloperAdmin = lazy(() => import('./developer-admin/DeveloperAdmin'));

export default function DevAdminRoute() {
  return (
    <ErrorBoundary>
      <Suspense fallback={(
        <div className={styles.content}>
          <div className={styles.hint}>Loading developer tools…</div>
        </div>
      )}
      >
        <DeveloperAdmin />
      </Suspense>
    </ErrorBoundary>
  );
}
