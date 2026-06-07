import { usePm } from '../context/PmContext';
import { GATEWAY_ASSETS } from '../content/gatewayContent';
import styles from '../pm.module.css';

/**
 * Dashboard hero — split layout with a large product visual and copy.
 */
export default function HeroSection() {
  const { config } = usePm();
  const image = config.heroImage || GATEWAY_ASSETS.softwareImage;

  return (
    <section className={styles.hero} aria-label={config.productName}>
      <div className={styles.heroInner}>
        <div className={styles.heroCopy}>
          <p className={styles.heroEyebrow}>Migrating soon to {config.futureSite}</p>
          <h1 className={styles.heroTitle}>{config.productName}</h1>
          <p className={styles.heroTagline}>{config.productTagline}</p>
          <p className={styles.heroHint}>
            AI triage routes maintenance emergencies to your on-call tech, deflects routine resident
            questions, and screens leasing leads — all from one operations layer.
          </p>
        </div>
        <div className={styles.heroVisual}>
          <img
            src={image}
            alt={`${config.productName} property management software`}
            className={styles.heroImg}
            loading="eager"
          />
        </div>
      </div>
    </section>
  );
}
