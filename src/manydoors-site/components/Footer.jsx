import { Link } from 'react-router-dom';
import { SITE } from '../content/siteContent';

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#07080c]">
      <div className="mx-auto max-w-6xl px-5 py-14 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 text-sm font-bold text-black">MD</span>
              <span className="text-lg font-semibold text-white">{SITE.name}</span>
            </div>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-zinc-500">
              AI operations for property managers — with white-glove onboarding, integration support, and a team that stays with you every step of the way.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Product</p>
            <ul className="mt-4 space-y-2 text-sm text-zinc-400">
              <li><Link to="/features" className="hover:text-white transition">Features</Link></li>
              <li><Link to="/platform" className="hover:text-white transition">Platform</Link></li>
              <li><Link to={SITE.appPath} className="hover:text-white transition">Live demo</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Company</p>
            <ul className="mt-4 space-y-2 text-sm text-zinc-400">
              <li><Link to="/support" className="hover:text-white transition">Support & integrations</Link></li>
              <li><a href={`mailto:${SITE.supportEmail}`} className="hover:text-white transition">{SITE.supportEmail}</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-white/[0.06] pt-8 text-xs text-zinc-600 sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</span>
          <span>{SITE.domain}</span>
        </div>
      </div>
    </footer>
  );
}
