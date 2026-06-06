import { usePm } from '../context/PmContext';
import styles from '../pm.module.css';

export default function HeroSection() {
  const { config } = usePm();

  return (
    <section
      className={styles.hero}
      style={{ backgroundImage: `url(${config.heroImage})` }}
      aria-label="ManyDoors AI"
    >
      <div className={styles.heroOverlay} />
      <div className={styles.heroContent}>
        <p className={styles.heroEyebrow}>Migrating soon to {config.futureSite}</p>
        <h1 className={styles.heroTitle}>{config.productName}</h1>
        <p className={styles.heroTagline}>{config.productTagline}</p>
        <p className={styles.heroHint}>
          AI triage routes maintenance emergencies to your on-call tech, deflects routine resident
          questions, and screens leasing leads — all from one operations layer.
        </p>
      </div>
    </section>
  );
}
