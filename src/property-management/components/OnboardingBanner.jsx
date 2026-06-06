import Icon from './Icon';
import styles from '../pm.module.css';

export default function OnboardingBanner({ onStart }) {
  return (
    <div className={styles.onboardBanner} role="region" aria-label="Get started">
      <Icon name="spark" size={18} className={styles.onboardBannerIcon} />
      <p className={styles.onboardBannerText}>
        To input your company data and load a sample portfolio, start{' '}
        <strong>Onboarding</strong> — add your properties, phone number, spreadsheets, and on-call maintenance techs.
      </p>
      <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={onStart}>
        Onboarding
      </button>
    </div>
  );
}
