import { motion } from 'framer-motion';
import Icon from './Icons';

export default function FeatureCard({ title, description, icon, gradient }) {
  return (
    <motion.article
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-md-surface p-6 transition-colors hover:border-md-cyan/30"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 transition-opacity group-hover:opacity-100`} />
      <div className="relative">
        <div className="mb-4 inline-flex rounded-xl border border-white/10 bg-white/5 p-2.5 text-md-cyan transition group-hover:border-md-cyan/30 group-hover:text-md-gold">
          <Icon name={icon} className="h-5 w-5" />
        </div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-zinc-500 group-hover:text-zinc-400">{description}</p>
      </div>
    </motion.article>
  );
}
