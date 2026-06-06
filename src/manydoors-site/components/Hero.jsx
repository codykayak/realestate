import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SITE } from '../content/siteContent';
import Icon from './Icons';

export default function Hero() {
  return (
    <section className="relative min-h-[92vh] overflow-hidden pt-24">
      <div className="pointer-events-none absolute inset-0 md-grid-bg" />
      <div className="pointer-events-none absolute inset-0 md-mesh-bg opacity-70" />
      <motion.div
        className="absolute -top-32 left-1/4 h-[500px] w-[500px] rounded-full bg-md-teal/20 blur-[120px]"
        animate={{ x: [0, 40, 0], y: [0, 30, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-20 right-0 h-[400px] w-[400px] rounded-full bg-md-gold/12 blur-[100px]"
        animate={{ x: [0, -30, 0], scale: [1, 1.12, 1] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:pb-28">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-md-cyan/30 bg-md-cyan/10 px-3.5 py-1.5 text-xs font-medium text-md-cyan"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-md-cyan opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-md-cyan" />
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
            <Link to={SITE.appPath} className="md-btn-primary group gap-2">
              Start onboarding
              <Icon name="arrow" className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
            <Link to="/manydoors/platform" className="md-btn-ghost gap-2">
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
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-md-teal/25 via-transparent to-md-gold/15 blur-2xl" />
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-md-surface/80 shadow-2xl backdrop-blur-sm md-glow-cyan">
            <img
              src="/Template/manydoors-ai-hero.png"
              alt="ManyDoors AI — modern property operations platform"
              className="h-auto w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-md-bg via-transparent to-transparent" />
            <motion.div
              className="absolute bottom-4 left-4 right-4 rounded-xl border border-white/10 bg-md-navy/60 p-4 backdrop-blur-md"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <p className="text-xs font-medium text-md-cyan">Live triage preview</p>
              <p className="mt-1 text-sm text-zinc-300">Emergency → forwarded to on-call tech, labeled EMERGENCY</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
