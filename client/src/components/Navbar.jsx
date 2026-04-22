import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Github } from 'lucide-react';
import { Logo } from './Logo';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuth } from '../contexts/AuthContext';

const cn = (...inputs) => twMerge(clsx(inputs));

const NAV_LINKS = [
  { label: 'Features', href: '#features', type: 'anchor' },
  { label: 'Docs', href: 'https://github.com/ArchieTansaria/dura#readme', type: 'external' },
  { label: 'Dashboard', href: '/dashboard', type: 'route' },
  { label: 'Contact', href: '#footer', type: 'anchor' },
];

const STATUS_DOT_COLORS = {
  operational: 'bg-emerald-400',
  standby: 'bg-accent',
  degraded: 'bg-orange-500',
  down: 'bg-red-500',
};

const STATUS_LABELS = {
  operational: 'All systems operational',
  standby: 'Services in standby (cost-saving)',
  degraded: 'Some services degraded',
  down: 'System issues detected',
};

function getOverallStatus(services) {
  const priority = ['down', 'degraded', 'standby', 'operational'];
  let worst = 'operational';
  for (const svc of services) {
    if (priority.indexOf(svc.status) < priority.indexOf(worst)) {
      worst = svc.status;
    }
  }
  return worst;
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { user, loading } = useAuth();
  const [systemStatus, setSystemStatus] = useState(null);
  const [statusHover, setStatusHover] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch system status on mount (lightweight background check)
  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch('/api/status');
        if (res.ok) {
          const data = await res.json();
          const overall = getOverallStatus(data.services || []);
          setSystemStatus(overall);
        }
      } catch {
        // Silently fail — badge just won't show
      }
    }
    fetchStatus();
  }, []);

  const dotColor = systemStatus ? STATUS_DOT_COLORS[systemStatus] : null;
  const statusLabel = systemStatus ? STATUS_LABELS[systemStatus] : null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 transition-all duration-500 ease-out">
      <nav className={cn(
        "relative flex items-center justify-between w-full mx-4 px-6 py-3 rounded-full transition-all duration-500 ease-out",
        "backdrop-blur-md border",
        scrolled
          ? "max-w-3xl bg-black/70 border-white/10 shadow-lg shadow-black/30"
          : "max-w-5xl bg-black/40 border-white/5"
      )}>
        {/* Left: Brand */}
        <Link to="/" className="flex items-center gap-3 pl-1 font-mono font-medium text-primary text-sm tracking-tight opacity-90 hover:opacity-100 transition-opacity">
          <Logo className="text-accent w-6 h-6" />
          <span>dura</span>
        </Link>

        {/* Center: Links - absolutely positioned for true centering */}
        <div className="hidden md:flex items-center gap-0.5 absolute left-1/2 -translate-x-1/2">
          {NAV_LINKS.map((link) => {
            const className = "px-3 py-1.5 text-[13px] text-secondary hover:text-primary transition-colors rounded-md hover:bg-white/5";
            if (link.type === 'route') {
              return (
                <Link key={link.label} to={link.href} className={className}>
                  {link.label}
                </Link>
              );
            }
            if (link.type === 'external') {
              return (
                <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" className={className}>
                  {link.label}
                </a>
              );
            }
            return (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={className}
              >
                {link.label}
              </a>
            );
          })}

          {/* Status Badge */}
          {systemStatus && (
            <div className="relative">
              <Link
                to="/status"
                className="relative flex items-center justify-center w-7 h-7 rounded-md hover:bg-white/5 transition-colors ml-1"
                onMouseEnter={() => setStatusHover(true)}
                onMouseLeave={() => setStatusHover(false)}
                aria-label="System Status"
              >
                <span className="relative flex h-2 w-2">
                  <span className={cn(
                    "animate-status-pulse absolute inline-flex h-full w-full rounded-full opacity-75",
                    dotColor,
                  )} />
                  <span className={cn(
                    "relative inline-flex rounded-full h-2 w-2",
                    dotColor,
                  )} />
                </span>
              </Link>

              {/* Hover tooltip */}
              <div className={cn(
                "absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1.5 rounded-lg bg-black/90 border border-white/10 backdrop-blur-md whitespace-nowrap pointer-events-none transition-all duration-200",
                statusHover ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"
              )}>
                <div className="flex items-center gap-2">
                  <span className={cn("inline-flex rounded-full h-1.5 w-1.5", dotColor)} />
                  <span className="text-[11px] text-white/80 font-medium">{statusLabel}</span>
                </div>
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-black/90 border-l border-t border-white/10" />
              </div>
            </div>
          )}
        </div>

        {/* Right: Login + Connect GitHub */}
        <div className="flex items-center gap-2">
          {loading ? null : user ? (
            <div className="flex items-center gap-4">
              <span className="text-[13px] text-secondary hidden sm:block">
                {user.githubLogin}
              </span>
              <a
                href={`${import.meta.env.VITE_BACKEND_URL}/logout`}
                className="text-[13px] text-secondary hover:text-primary transition-colors font-medium rounded-md hover:bg-white/5 px-3 py-1.5"
              >
                Logout
              </a>
            </div>
          ) : (
            <>
              <Link
                to="/auth"
                className="text-[13px] text-secondary hover:text-primary transition-colors font-medium rounded-md hover:bg-white/5 px-3 py-1.5"
              >
                Login
              </Link>
              <a
                href={`${import.meta.env.VITE_BACKEND_URL}/connect/github`}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/15 text-primary text-[13px] font-medium px-3 py-1.5 rounded-full transition-all border border-white/5 hover:border-white/10"
              >
                <Github size={14} />
                <span>Connect GitHub</span>
              </a>
            </>
          )}
        </div>
      </nav>
    </div>
  );
}
