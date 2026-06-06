import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FadeIn, Stagger, StaggerItem } from '../components/motion';
import { SUPPORT_PILLARS, SITE } from '../content/siteContent';
import Icon from '../components/Icons';

const PILLAR_ICONS = ['shield', 'plug', 'chat'];

export default function Support() {
  return (
    <>
      <section className="border-b border-white/[0.06] pt-32 pb-20 md:pt-40">
        <div className="mx-auto max-w-6xl px-5 lg:px-8">
          <FadeIn className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-md-gold">
              Support &amp; integration
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              With you every step of the way
            </h1>
            <p className="mt-6 text-lg text-zinc-400">
              ManyDoors AI isn&apos;t a self-serve black box. We&apos;re always there for support and
              integration needs — from your first spreadsheet import through scaling across new markets.
              Real humans, real responsiveness, real partnership.
            </p>
          </FadeIn>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-5 lg:px-8">
          <Stagger className="grid gap-6 md:grid-cols-3">
            {SUPPORT_PILLARS.map((pillar, i) => (
              <StaggerItem key={pillar.title}>
                <motion.div
                  whileHover={{ y: -6 }}
                  className="h-full rounded-2xl border border-white/[0.08] bg-gradient-to-b from-[md-surface] to-[md-bg] p-8"
                >
                  <div className="inline-flex rounded-xl border border-md-cyan/20 bg-md-cyan/10 p-2.5 text-md-cyan">
                    <Icon name={PILLAR_ICONS[i]} className="h-5 w-5" />
                  </div>
                  <h2 className="mt-5 text-xl font-semibold text-white">{pillar.title}</h2>
                  <p className="mt-3 leading-relaxed text-zinc-500">{pillar.description}</p>
                </motion.div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="border-t border-white/[0.06] py-20">
        <div className="mx-auto max-w-4xl px-5 sm:px-6">
          <FadeIn className="rounded-3xl border border-md-cyan/20 bg-md-teal/10 p-10 text-center md:p-14">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Need help connecting your stack?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-zinc-400">
              Whether it&apos;s Yardi, AppFolio, QuickBooks, or custom spreadsheets — our integration team
              works alongside yours until everything flows seamlessly.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href={`mailto:${SITE.supportEmail}`}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-md-teal via-md-cyan to-md-cyan px-8 text-sm font-semibold text-black transition hover:scale-[1.02]"
              >
                {SITE.supportEmail}
                <Icon name="arrow" className="h-4 w-4" />
              </a>
              <Link
                to={SITE.appPath}
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/10 bg-white/5 px-8 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Start onboarding
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
