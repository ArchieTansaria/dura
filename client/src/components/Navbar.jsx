import { Github } from 'lucide-react';
import { Logo } from './Logo';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const NAV_LINKS = [
  { label: 'Docs', href: '#' },
  { label: 'GitHub', href: 'https://github.com/dura-metrics/dura' },
  { label: 'MCP', href: '#' },
  { label: 'CLI', href: '#' },
];

export function Navbar() {
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-fit px-4">
      <nav className={cn(
        "flex items-center gap-8 px-5 py-2.5 rounded-full",
        "backdrop-blur-md bg-black/40 border border-white/5",
        "transition-all duration-300 ease-out",
        "hover:bg-black/60 hover:border-white/10 hover:shadow-lg hover:shadow-black/20"
      )}>
        {/* Brand */}
        <a href="/" className="flex items-center gap-2.5 font-mono font-medium text-primary text-sm tracking-tight opacity-90 hover:opacity-100 transition-opacity">
          <Logo className="text-accent" />
          <span>dura</span>
        </a>

        {/* Links - Desktop */}
        <div className="hidden md:flex items-center gap-1">
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

        {/* CTA */}
        <a 
          href="https://github.com/dura-metrics/dura"
          className="flex items-center gap-2 bg-white/10 hover:bg-white/15 text-primary text-[13px] font-medium px-3 py-1.5 rounded-full transition-all border border-white/5 hover:border-white/10"
        >
          <Github size={14} />
          <span>Connect GitHub</span>
        </a>
      </nav>
    </div>
  );
}
