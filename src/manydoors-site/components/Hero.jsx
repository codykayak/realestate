import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SITE } from '../content/siteContent';
import Icon from './Icons';

export default function Hero() {
  return (
    <section className="relative min-h-[92vh] overflow-hidden pt-24">
      <div className="absolute inset-0 md-grid-bg pointer-events-none" />
      <motion.div
        className="absolute -top-32 left-1/4 h-[500px] w-[500px] rounded-full bg-teal-500/20 blur-[120px]"
        animate={{ x: [0, 40, 0], y: [0, 30, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-20 right-0 h-[400px] w-[400px] rounded-full bg-amber-500/10 blur-[100px]"
        animate={{ x: [0, -30, 0], scale: [1, 1.12, 1] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:pb-28">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3.5 py-1.5 text-xs font-medium text-teal-300"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-400" />
            </span>
            Now onboarding property management teams
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.05 }}
            className="text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.4rem]"
          >
            <span className="md-gradient-text">AI that runs</span>
            <br />
            <span className="text-white">property operations.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.12 }}
            className="mt-6 max-w-lg text-lg leading-relaxed text-zinc-400"
          >
            {SITE.tagline}. We are with you every step — from onboarding and integrations to ongoing support as your portfolio grows.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2 }}
            className="mt-10 flex flex-wrap items-center gap-4"
          >
            <Link
              to={SITE.appPath}
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-400 to-teal-500 px-6 py-3 text-sm font-semibold text-black shadow-lg shadow-teal-500/25 transition hover:scale-[1.02] hover:shadow-teal-500/40"
            >
              Start onboarding
              <Icon name="arrow" className="w-4 h-4 transition group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/platform"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:border-white/20 hover:bg-white/10"
            >
              See how it works
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-teal-500/20 via-transparent to-amber-500/10 blur-2xl" />
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0f1117]/80 shadow-2xl md-glow-teal backdrop-blur-sm">
            <img
              src="/Template/manydoors-ai-hero.png"
              alt="ManyDoors AI — modern property operations platform"
              className="h-auto w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07080c] via-transparent to-transparent" />
            <motion.div
              className="absolute bottom-4 left-4 right-4 rounded-xl border border-white/10 bg-black/50 p-4 backdrop-blur-md"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <p className="text-xs font-medium text-teal-300">Live triage preview</p>
              <p className="mt-1 text-sm text-zinc-300">Emergency → forwarded to on-call tech, labeled EMERGENCY</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
