import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Hero from '../components/Hero';
import FeatureCard from '../components/FeatureCard';
import SupportBanner from '../components/SupportBanner';
import StatsRow from '../components/StatsRow';
import { FadeIn, Stagger, StaggerItem } from '../components/motion';
import { FEATURES, HOW_IT_WORKS, SITE } from '../content/siteContent';
import Icon from '../components/Icons';

export default function Home() {
  return (
    <>
      <Hero />

      <section className="relative border-t border-white/[0.06] py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-5 lg:px-8">
          <FadeIn className="mx-auto mb-16 max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-md-cyan">Platform</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Everything your portfolio needs — in one place
            </h2>
            <p className="mt-4 text-lg text-zinc-400">
              From maintenance triage to owner reporting, ManyDoors AI replaces scattered tools with a
              single, intelligent command center built for property managers.
            </p>
          </FadeIn>

          <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.slice(0, 6).map((f) => (
              <StaggerItem key={f.id}>
                <FeatureCard title={f.title} description={f.description} icon={f.icon} gradient={f.gradient} />
              </StaggerItem>
            ))}
          </Stagger>

          <FadeIn className="mt-12 text-center">
            <Link
              to="/manydoors/features"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-md-cyan transition hover:text-md-cyan"
            >
              View all features
              <Icon name="arrow" className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
          </FadeIn>
        </div>
      </section>

      <section className="border-t border-white/[0.06] bg-[md-surface]/40 py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-5 lg:px-8">
          <FadeIn className="mb-16 text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-md-gold">How it works</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Live in days, not months
            </h2>
          </FadeIn>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS.map((step, i) => (
              <FadeIn key={step.step} delay={i * 0.08}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="h-full rounded-2xl border border-white/[0.08] bg-[md-surface] p-6"
                >
                  <span className="text-3xl font-bold text-md-teal/30">{step.step}</span>
                  <h3 className="mt-3 text-lg font-semibold text-white">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-500">{step.body}</p>
                </motion.div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/[0.06] py-20">
        <StatsRow />
      </section>

      <section className="px-5 pb-24 lg:px-8">
        <SupportBanner />
      </section>

      <section className="border-t border-white/[0.06] py-24 md:py-32">
        <div className="mx-auto max-w-4xl px-5 text-center sm:px-6">
          <FadeIn>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to modernize your property operations?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-zinc-400">
              Launch the platform, import your data, and let AI handle the heavy lifting — with our team
              beside you from day one.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to={SITE.appPath}
                className="inline-flex h-12 items-center justify-center rounded-full bg-gradient-to-r from-md-teal via-md-cyan to-md-cyan px-8 text-sm font-semibold text-black shadow-lg shadow-md-cyan/25 transition hover:scale-[1.02]"
              >
                Open platform
              </Link>
              <Link
                to="/manydoors/support"
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/10 bg-white/5 px-8 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/10"
              >
                Talk to our team
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
