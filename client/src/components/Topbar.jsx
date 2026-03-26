import { Search } from 'lucide-react';
import { ProfileDropdown } from './ProfileDropdown';
import { cn } from '../utils/utils';

export function Topbar({ isCollapsed }) {
  return (
    <header className={cn(
      "h-[60px] fixed top-0 left-0 right-0 z-30 bg-black/40 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-8 transition-all duration-300",
      isCollapsed ? "pl-[100px]" : "pl-[260px]"
    )}>
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-accent transition-colors" />
          <input
            type="text"
            placeholder="Search across workspace..."
            className="w-full bg-white/[0.02] border border-white/5 hover:border-white/10 focus:border-accent/50 focus:bg-white/[0.04] rounded-lg pl-10 pr-12 py-1.5 text-[13px] text-white placeholder:text-white/30 outline-none transition-all duration-300"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-50">
            <kbd className="px-1.5 flex items-center justify-center font-sans text-[10px] bg-white/10 rounded-sm">⌘</kbd>
            <kbd className="px-1.5 flex items-center justify-center font-sans text-[10px] bg-white/10 rounded-sm">K</kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 pl-4">
        <ProfileDropdown />
      </div>
    </header>
  );
}
