import { Link } from 'react-router-dom';
import { SITE } from '../content/siteContent';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-md-bg">
      <div className="mx-auto max-w-6xl px-5 py-14 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo variant="full" className="h-9 w-auto" linked={false} />
            <p className="mt-4 max-w-md text-sm leading-relaxed text-zinc-500">
              AI operations for property managers — with white-glove onboarding, integration support, and a team that stays with you every step of the way.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Product</p>
            <ul className="mt-4 space-y-2 text-sm text-zinc-400">
              <li><Link to="/manydoors/features" className="transition hover:text-md-cyan">Features</Link></li>
              <li><Link to="/manydoors/platform" className="transition hover:text-md-cyan">Platform</Link></li>
              <li><Link to={SITE.appPath} className="transition hover:text-md-cyan">Live demo</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Company</p>
            <ul className="mt-4 space-y-2 text-sm text-zinc-400">
              <li><Link to="/manydoors/support" className="transition hover:text-md-cyan">Support & integrations</Link></li>
              <li><a href={`mailto:${SITE.supportEmail}`} className="transition hover:text-md-cyan">{SITE.supportEmail}</a></li>
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
