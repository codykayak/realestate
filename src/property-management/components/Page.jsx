import styles from '../pm.module.css';

/** Shared page chrome: sticky top bar (title + actions) and content wrapper. */
export default function Page({ title, subtitle, actions, children }) {
  return (
    <>
      <div className={styles.topbar}>
        <div>
          <div className={styles.pageTitle}>{title}</div>
          {subtitle && <div className={styles.pageSub}>{subtitle}</div>}
        </div>
        {actions && <div className={styles.rowWrap}>{actions}</div>}
      </div>
      <div className={styles.content}>{children}</div>
    </>
  );
}
