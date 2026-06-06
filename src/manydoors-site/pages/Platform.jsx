import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FadeIn } from '../components/motion';
import { HOW_IT_WORKS, SITE } from '../content/siteContent';
import Icon from '../components/Icons';

const CAPABILITIES = [
  'Unified dashboard across all properties and portfolios',
  'AI maintenance triage with on-call tech routing',
  'Tenant and owner portals with branded communications',
  'Spreadsheet import — no rip-and-replace required',
  'Role-based access for PMs, owners, and vendors',
  'Real-time alerts and digest summaries',
];

export default function Platform() {
  return (
    <>
      <section className="border-b border-white/[0.06] pt-32 pb-20 md:pt-40">
        <div className="mx-auto max-w-6xl px-5 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <FadeIn>
              <p className="text-sm font-semibold uppercase tracking-widest text-teal-400">Platform</p>
              <h1 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                One command center for your entire portfolio
              </h1>
              <p className="mt-6 text-lg text-zinc-400">
                ManyDoors AI connects maintenance, leasing, accounting, and owner relations into a single
                intelligent layer — so your team stops chasing information and starts acting on it.
              </p>
              <Link
                to={SITE.appPath}
                className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-gradient-to-r from-teal-400 to-teal-500 px-8 text-sm font-semibold text-black transition hover:scale-[1.02]"
              >
                Open platform
              </Link>
            </FadeIn>

            <FadeIn delay={0.15}>
              <motion.div
                className="relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl md-glow-teal"
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              >
                <img
                  src="/Template/manydoors-ai-hero.png"
                  alt="ManyDoors AI platform dashboard"
                  className="w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#07080c]/80 to-transparent" />
              </motion.div>
            </FadeIn>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-5 lg:px-8">
          <FadeIn className="mb-12">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">Core capabilities</h2>
          </FadeIn>
          <ul className="grid gap-4 sm:grid-cols-2">
            {CAPABILITIES.map((item, i) => (
              <FadeIn key={item} delay={i * 0.05}>
                <li className="flex items-start gap-3 rounded-xl border border-white/[0.08] bg-[#0f1117]/60 p-5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-500/15 text-teal-400">
                    <Icon name="shield" className="h-3 w-3" />
                  </span>
                  <span className="text-zinc-400">{item}</span>
                </li>
              </FadeIn>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-white/[0.06] bg-[#0f1117]/30 py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-5 lg:px-8">
          <FadeIn className="mb-12 text-center">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">Onboarding in four steps</h2>
            <p className="mt-3 text-zinc-500">We guide you through each one — and stay available after go-live.</p>
          </FadeIn>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS.map((step, i) => (
              <FadeIn key={step.step} delay={i * 0.1}>
                <div className="text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500/15 text-lg font-bold text-teal-400">
                    {step.step}
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-white">{step.title}</h3>
                  <p className="mt-2 text-sm text-zinc-500">{step.body}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
