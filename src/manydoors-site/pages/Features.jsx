import { Link } from 'react-router-dom';
import FeatureCard from '../components/FeatureCard';
import SupportBanner from '../components/SupportBanner';
import { FadeIn, Stagger, StaggerItem } from '../components/motion';
import { FEATURES, SITE } from '../content/siteContent';

export default function Features() {
  return (
    <>
      <section className="border-b border-white/[0.06] pt-32 pb-20 md:pt-40">
        <div className="mx-auto max-w-6xl px-5 lg:px-8">
          <FadeIn className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-md-cyan">Features</p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Built for how property managers actually work
            </h1>
            <p className="mt-6 text-lg text-zinc-400">
              Every module connects to the same AI brain — so maintenance, leasing, accounting, and
              communications stay in sync without duplicate data entry.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-5 lg:px-8">
          <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <StaggerItem key={f.id}>
                <FeatureCard title={f.title} description={f.description} icon={f.icon} gradient={f.gradient} />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="px-5 pb-20 lg:px-8">
        <SupportBanner />
      </section>

      <section className="border-t border-white/[0.06] py-20">
        <div className="mx-auto max-w-3xl px-5 text-center sm:px-6">
          <FadeIn>
            <h2 className="text-2xl font-bold text-white">See it in your portfolio</h2>
            <p className="mt-3 text-zinc-400">
              We&apos;ll walk you through a live demo tailored to your unit count, markets, and existing
              tools.
            </p>
            <Link
              to={SITE.appPath}
              className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-gradient-to-r from-md-teal via-md-cyan to-md-cyan px-8 text-sm font-semibold text-black transition hover:scale-[1.02]"
            >
              Launch platform
            </Link>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
