import { useState } from 'react';
import { Search } from 'lucide-react';
import { ProfileDropdown } from './ProfileDropdown';
import { CommandPalette } from './CommandPalette';
import { cn } from '../utils/utils';

export function Topbar({ isCollapsed, installState }) {
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const showProfile = installState === 'has-repos';

  return (
    <>
      <CommandPalette isOpen={isCommandOpen} setIsOpen={setIsCommandOpen} />
      <header className={cn(
      "h-[60px] fixed top-0 left-0 right-0 z-30 bg-white/80 dark:bg-black/40 backdrop-blur-md border-b border-gray-200 dark:border-white/5 flex items-center justify-between px-8 transition-all duration-300",
      isCollapsed ? "pl-[100px]" : "pl-[260px]"
    )}>
      <div className="flex-1 max-w-xl">
        <button 
          onClick={() => setIsCommandOpen(true)}
          className="relative group w-full text-left"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/30 group-hover:text-accent transition-colors" />
          <div
            className="w-full flex items-center bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 group-hover:border-gray-300 dark:group-hover:border-white/10 group-hover:bg-white dark:group-hover:bg-white/[0.04] rounded-lg pl-10 pr-12 py-1.5 transition-all duration-300 cursor-text"
          >
            <span className="text-[13px] text-gray-400 dark:text-white/30">Search or jump to...</span>
          </div>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
            <kbd className="px-1.5 flex items-center justify-center font-sans text-[10px] bg-gray-200 dark:bg-white/10 text-gray-500 dark:text-white rounded-sm">⌘</kbd>
            <kbd className="px-1.5 flex items-center justify-center font-sans text-[10px] bg-gray-200 dark:bg-white/10 text-gray-500 dark:text-white rounded-sm">K</kbd>
          </div>
        </button>
      </div>

      {showProfile && (
        <div className="flex items-center gap-4 pl-4">
          <ProfileDropdown />
        </div>
      )}
    </header>
    </>
  );
}
