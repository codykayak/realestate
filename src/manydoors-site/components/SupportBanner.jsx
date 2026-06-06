import { Link } from 'react-router-dom';
import { FadeIn } from './motion';
import Icon from './Icons';

export default function SupportBanner() {
  return (
    <FadeIn>
      <section className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl border border-teal-500/20 bg-gradient-to-br from-teal-500/10 via-[#0f1117] to-amber-500/5 px-6 py-12 sm:px-10 sm:py-14">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 text-teal-400">
              <Icon name="shield" className="h-5 w-5" />
              <span className="text-sm font-semibold uppercase tracking-wider">Partnership, not a product drop-off</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              With you every step of the way
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-400">
              ManyDoors AI is always here for support and integration needs — onboarding your team, connecting your PMS and messaging stack, and staying available as you scale. You never go it alone.
            </p>
          </div>
          <Link
            to="/support"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Talk to our team
            <Icon name="arrow" className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </FadeIn>
  );
}
