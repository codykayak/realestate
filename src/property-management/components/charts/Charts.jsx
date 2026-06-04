/**
 * Dependency-free SVG charts: LineChart (multi-series, gap-aware), BarChart,
 * GroupedBar, and PieChart. Responsive via viewBox; strokes stay crisp with
 * vector-effect: non-scaling-stroke. `null` points create gaps and are ignored
 * for axis bounds (used for forecast tails / partial series).
 */

import styles from './charts.module.css';

const W = 620;
const isNum = (v) => typeof v === 'number' && !Number.isNaN(v);

function niceBounds(vals) {
  const nums = vals.filter(isNum);
  let min = Math.min(...nums);
  let max = Math.max(...nums);
  if (!isFinite(min) || !isFinite(max)) { min = 0; max = 1; }
  if (min === max) { min -= 1; max += 1; }
  const pad = (max - min) * 0.12;
  return { lo: min - pad, hi: max + pad };
}

export function LineChart({ series = [], labels = [], height = 220, formatY = (v) => v, area = true }) {
  const padL = 52, padR = 12, padT = 12, padB = 22;
  const { lo, hi } = niceBounds(series.flatMap((s) => s.points));
  const n = labels.length || (series[0]?.points.length ?? 0);

  const x = (i) => padL + (n <= 1 ? 0 : (i / (n - 1)) * (W - padL - padR));
  const y = (v) => height - padB - ((v - lo) / (hi - lo)) * (height - padT - padB);

  const gridVals = [lo, lo + (hi - lo) / 2, hi];
  const labelStep = Math.max(1, Math.ceil(n / 6));

  function pathFor(points) {
    return points
      .map((v, i) => ({ v, i }))
      .filter((p) => isNum(p.v))
      .map((p, k) => `${k === 0 ? 'M' : 'L'} ${x(p.i)} ${y(p.v)}`)
      .join(' ');
  }

  return (
    <div className={styles.wrap}>
      <svg className={styles.svg} viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none" role="img">
        {gridVals.map((gv, i) => (
          <g key={i}>
            <line className={styles.grid} x1={padL} x2={W - padR} y1={y(gv)} y2={y(gv)} />
            <text className={styles.axisLabel} x={padL - 6} y={y(gv) + 3} textAnchor="end">{formatY(gv)}</text>
          </g>
        ))}
        {series.map((s, si) => {
          const present = s.points.map((v, i) => ({ v, i })).filter((p) => isNum(p.v));
          const firstIdx = present[0]?.i ?? -1;
          const lastIdx = present[present.length - 1]?.i ?? -1;
          return (
            <g key={si}>
              {area && si === 0 && firstIdx >= 0 && (
                <path
                  d={`${pathFor(s.points)} L ${x(lastIdx)} ${height - padB} L ${x(firstIdx)} ${height - padB} Z`}
                  fill={s.color} opacity="0.12"
                />
              )}
              <path className={styles.line} d={pathFor(s.points)} stroke={s.color} strokeDasharray={s.dashed ? '5 4' : undefined} />
            </g>
          );
        })}
        {labels.map((lab, i) => (
          i % labelStep === 0 ? (
            <text key={i} className={styles.axisLabel} x={x(i)} y={height - 6} textAnchor="middle">{lab}</text>
          ) : null
        ))}
      </svg>
      {series.filter((s) => s.label).length > 1 && (
        <div className={styles.legend}>
          {series.filter((s) => s.label).map((s, i) => (
            <span key={i} className={styles.legendItem}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: s.color, display: 'inline-block', opacity: s.dashed ? 0.7 : 1 }} />
              {s.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function GroupedBar({ labels = [], series = [], height = 220, formatY = (v) => v }) {
  const padL = 52, padR = 12, padT = 12, padB = 22;
  const hi = Math.max(...series.flatMap((s) => s.values), 1);
  const n = labels.length;
  const groupW = (W - padL - padR) / n;
  const barW = Math.max(2, (groupW * 0.7) / series.length);
  const y = (v) => height - padB - (v / hi) * (height - padT - padB);

  return (
    <div className={styles.wrap}>
      <svg className={styles.svg} viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none" role="img">
        {[0, hi / 2, hi].map((gv, i) => (
          <g key={i}>
            <line className={styles.grid} x1={padL} x2={W - padR} y1={y(gv)} y2={y(gv)} />
            <text className={styles.axisLabel} x={padL - 6} y={y(gv) + 3} textAnchor="end">{formatY(gv)}</text>
          </g>
        ))}
        {labels.map((lab, gi) => {
          const gx = padL + gi * groupW + groupW * 0.15;
          return (
            <g key={gi}>
              {series.map((s, si) => {
                const v = s.values[gi];
                return <rect key={si} x={gx + si * barW} y={y(v)} width={barW - 1} height={Math.max(0, height - padB - y(v))} fill={s.color} rx="1.5" />;
              })}
              {gi % Math.max(1, Math.ceil(n / 6)) === 0 && (
                <text className={styles.axisLabel} x={padL + gi * groupW + groupW / 2} y={height - 6} textAnchor="middle">{lab}</text>
              )}
            </g>
          );
        })}
      </svg>
      <div className={styles.legend}>
        {series.map((s, i) => (
          <span key={i} className={styles.legendItem}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: s.color, display: 'inline-block' }} /> {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function BarChart({ data = [], height = 200, formatY = (v) => v, color = 'var(--pm-accent)' }) {
  const padL = 52, padR = 12, padT = 12, padB = 22;
  const hi = Math.max(...data.map((d) => d.value), 1);
  const n = data.length;
  const slot = (W - padL - padR) / n;
  const barW = slot * 0.62;
  const y = (v) => height - padB - (v / hi) * (height - padT - padB);

  return (
    <div className={styles.wrap}>
      <svg className={styles.svg} viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none" role="img">
        {[0, hi / 2, hi].map((gv, i) => (
          <g key={i}>
            <line className={styles.grid} x1={padL} x2={W - padR} y1={y(gv)} y2={y(gv)} />
            <text className={styles.axisLabel} x={padL - 6} y={y(gv) + 3} textAnchor="end">{formatY(gv)}</text>
          </g>
        ))}
        {data.map((d, i) => (
          <g key={i}>
            <rect x={padL + i * slot + (slot - barW) / 2} y={y(d.value)} width={barW} height={Math.max(0, height - padB - y(d.value))} fill={d.color || color} rx="2" />
            {i % Math.max(1, Math.ceil(n / 8)) === 0 && (
              <text className={styles.axisLabel} x={padL + i * slot + slot / 2} y={height - 6} textAnchor="middle">{d.label}</text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}

export function PieChart({ data = [], size = 170, formatVal = (v) => v }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = size / 2;
  const cx = r, cy = r;
  const TAU = Math.PI * 2;

  const arcs = data.map((d, i) => {
    const prev = data.slice(0, i).reduce((s, x) => s + x.value, 0);
    const a0 = -Math.PI / 2 + (prev / total) * TAU;
    const a1 = a0 + (d.value / total) * TAU;
    const large = a1 - a0 > Math.PI ? 1 : 0;
    const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    return { d: `M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} Z`, color: d.color };
  });

  return (
    <div className={styles.pieRow}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" style={{ flexShrink: 0 }}>
        {arcs.map((a, i) => <path key={i} d={a.d} fill={a.color} stroke="var(--pm-bg)" strokeWidth="1.5" />)}
        <circle cx={cx} cy={cy} r={r * 0.52} fill="var(--pm-panel)" />
      </svg>
      <div className={styles.pieLegend}>
        {data.map((d, i) => (
          <span key={i} className={styles.legendItem}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: d.color, display: 'inline-block' }} />
            {d.label}
            <span className={styles.legendVal}>{formatVal(d.value)} · {Math.round((d.value / total) * 100)}%</span>
          </span>
        ))}
      </div>
    </div>
  );
}
