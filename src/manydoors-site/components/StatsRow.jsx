import { Stagger, StaggerItem } from './motion';
import { STATS } from '../content/siteContent';

export default function StatsRow() {
  return (
    <Stagger className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-5 lg:grid-cols-4 lg:px-8">
      {STATS.map((s) => (
        <StaggerItem key={s.label}>
          <div className="rounded-2xl border border-white/[0.06] bg-md-surface/60 px-5 py-6 text-center backdrop-blur-sm transition hover:border-md-cyan/25">
            <p className="text-3xl font-bold tracking-tight text-white">{s.value}</p>
            <p className="mt-1 text-xs font-medium uppercase tracking-wider text-zinc-500">{s.label}</p>
          </div>
        </StaggerItem>
      ))}
    </Stagger>
  );
}
