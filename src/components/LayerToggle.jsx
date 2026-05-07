import { JURISDICTIONS } from '../constants/orZoning';
import styles from './LayerToggle.module.css';

/**
 * Compact floating panel to toggle Eugene zoning and regional county layers.
 *
 * Props:
 *   eugeneOn        – boolean
 *   onToggleEugene  – fn()
 *   enabledCounties – Set of jurisdiction IDs
 *   onToggleCounty  – fn(id)
 *   regionalLoading – boolean
 */
export default function LayerToggle({
  eugeneOn, onToggleEugene,
  enabledCounties, onToggleCounty,
  regionalLoading,
}) {
  const anyOn = eugeneOn || enabledCounties.size > 0;

  return (
    <div className={styles.wrap}>
      <p className={styles.heading}>Zoning Layers</p>

      {/* Eugene row */}
      <label className={styles.row}>
        <span className={styles.dot} style={{ background: '#58a6ff' }} />
        <span className={styles.name}>Eugene</span>
        <span className={styles.sublabel}>City limits</span>
        <input
          type="checkbox"
          className={styles.check}
          checked={eugeneOn}
          onChange={onToggleEugene}
        />
      </label>

      <div className={styles.divider} />

      {/* County rows */}
      {JURISDICTIONS.map((j) => {
        const on = enabledCounties.has(j.id);
        return (
          <label key={j.id} className={styles.row}>
            <span className={styles.dot} style={{ background: j.color }} />
            <span className={styles.name}>{j.label}</span>
            <span className={styles.sublabel}>regional</span>
            <input
              type="checkbox"
              className={styles.check}
              checked={on}
              onChange={() => onToggleCounty(j.id)}
            />
          </label>
        );
      })}

      {regionalLoading && (
        <div className={styles.loadingRow}>
          <span className={styles.spinner} />
          <span>Loading regional data…</span>
        </div>
      )}

      {!anyOn && (
        <p className={styles.hint}>Enable a layer to see zoning</p>
      )}
    </div>
  );
}
