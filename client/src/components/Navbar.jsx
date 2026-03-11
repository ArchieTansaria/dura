import { useState, useEffect } from 'react';
import { Github } from 'lucide-react';
import { Logo } from './Logo';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Docs', href: '#' },
  { label: 'Dashboard', href: '#' },
  { label: 'Contact', href: '#' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
        <a href="/" className="flex items-center gap-3 pl-1 font-mono font-medium text-primary text-sm tracking-tight opacity-90 hover:opacity-100 transition-opacity">
          <Logo className="text-accent w-6 h-6" />
          <span>dura</span>
        </a>

        {/* Center: Links - absolutely positioned for true centering */}
        <div className="hidden md:flex items-center gap-0.5 absolute left-1/2 -translate-x-1/2">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="px-3 py-1.5 text-[13px] text-secondary hover:text-primary transition-colors rounded-md hover:bg-white/5"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right: Login + Connect GitHub */}
        <div className="flex items-center gap-2">
          <a
            href="#"
            className="text-[13px] text-secondary hover:text-primary transition-colors font-medium rounded-md hover:bg-white/5 px-3 py-1.5"
          >
            Login
          </a>
          <a
            href="https://github.com/apps/dura-dep"
            className="flex items-center gap-2 bg-white/10 hover:bg-white/15 text-primary text-[13px] font-medium px-3 py-1.5 rounded-full transition-all border border-white/5 hover:border-white/10"
          >
            <Github size={14} />
            <span>Connect GitHub</span>
          </a>
        </div>
      </nav>
    </div>
  );
}
