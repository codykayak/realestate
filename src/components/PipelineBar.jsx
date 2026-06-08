import { useMemo } from 'react';
import styles from './PipelineBar.module.css';

const STAGES = [
  { key: 'New', label: 'New', color: '#58a6ff' },
  { key: 'Contacted', label: 'Contacted', color: '#f5a623' },
  { key: 'Negotiating', label: 'Negotiating', color: '#e8742a' },
  { key: 'Under Contract', label: 'Contract', color: '#3fb950' },
];

export default function PipelineBar({ leads, activeStage, onStageChange }) {
  const counts = useMemo(() => {
    const map = Object.fromEntries(STAGES.map((s) => [s.key, 0]));
    for (const l of leads ?? []) {
      const status = l.status || 'New';
      if (map[status] != null) map[status] += 1;
    }
    map.inbound = (leads ?? []).filter((l) => l.webLead).length;
    return map;
  }, [leads]);

  return (
    <div className={styles.wrap}>
      {STAGES.map((stage) => (
        <button
          key={stage.key}
          type="button"
          className={`${styles.chip} ${activeStage === stage.key ? styles.chipActive : ''}`}
          style={{ '--pc': stage.color }}
          onClick={() => onStageChange?.(activeStage === stage.key ? 'all' : stage.key)}
        >
          <span className={styles.count}>{counts[stage.key]}</span>
          <span className={styles.label}>{stage.label}</span>
        </button>
      ))}
      {counts.inbound > 0 && (
        <span className={styles.inbound} title="Leads from website forms">
          🌐 {counts.inbound} web
        </span>
      )}
    </div>
  );
}
