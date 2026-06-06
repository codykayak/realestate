import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SITE } from '../content/siteContent';
import Icon from './Icons';

const links = [
  { to: '/features', label: 'Features' },
  { to: '/platform', label: 'Platform' },
  { to: '/support', label: 'Support' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-white/[0.06] bg-[#07080c]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 lg:px-8">
        <Link to="/" className="group flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 text-sm font-bold text-black shadow-lg shadow-teal-500/20 transition group-hover:scale-105">
            MD
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-white">{SITE.name}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'bg-white/10 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <a href={`mailto:${SITE.supportEmail}`} className="text-sm font-medium text-zinc-400 transition hover:text-white">
            Contact
          </a>
          <Link
            to={SITE.appPath}
            className="group relative overflow-hidden rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition hover:shadow-lg hover:shadow-teal-500/20"
          >
            <span className="relative z-10">Launch app</span>
            <motion.span
              className="absolute inset-0 bg-gradient-to-r from-teal-300 to-amber-300 opacity-0 transition group-hover:opacity-100"
              layoutId="nav-cta"
            />
          </Link>
        </div>

        <button type="button" className="rounded-lg p-2 text-zinc-400 md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Menu">
          <Icon name={open ? 'close' : 'menu'} />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-white/[0.06] bg-[#0a0b10] md:hidden"
          >
            <div className="flex flex-col gap-1 p-4">
              {links.map((l) => (
                <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-300 hover:bg-white/5">
                  {l.label}
                </NavLink>
              ))}
              <Link to={SITE.appPath} onClick={() => setOpen(false)} className="mt-2 rounded-full bg-teal-500 py-2.5 text-center text-sm font-semibold text-black">
                Launch app
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
