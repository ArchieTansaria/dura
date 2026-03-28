import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { cn } from '../utils/utils';
import { Database, ChartArea, Blocks, BarChart3, User, Settings, Lock, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import Typewriter from './typewriter';

const mainNavigation = [
  { name: 'Repositories', icon: Database, active: true },
  { name: 'Analytics', icon: ChartArea, locked: true },
  { name: 'Integrations', icon: Blocks, locked: true },
  { name: 'Reports', icon: BarChart3, locked: true },
];

const bottomNavigation = [
  { name: 'Account', icon: User },
  { name: 'Settings', icon: Settings },
];

export function Sidebar({ isCollapsed, setIsCollapsed, installState }) {
  return (
    <aside className={cn(
      "h-screen fixed top-0 left-0 flex flex-col bg-white/90 dark:bg-black/40 backdrop-blur-md border-r border-gray-300 dark:border-white/5 z-40 transition-all duration-300",
      isCollapsed ? "w-[80px]" : "w-[240px]"
    )}>
      <div className={cn("p-6 pb-4 flex items-center", isCollapsed ? "justify-center" : "justify-between")}>
        <Link to="/" className="flex items-center gap-3 opacity-90 hover:opacity-100 transition-opacity">
          <Logo className="w-5 h-5 text-accent shrink-0" />
          {!isCollapsed && <span className="font-mono text-sm tracking-tight text-gray-900 dark:text-white">dura</span>}
        </Link>
        {!isCollapsed && (
          <button onClick={() => setIsCollapsed(true)} className="p-1 -mr-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-md text-gray-600 dark:text-white/50 hover:text-gray-900 dark:hover:text-white transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex-1 px-3 py-4 space-y-1">
        {mainNavigation.map((item) => (
          <div
            key={item.name}
            className={cn(
              "flex items-center rounded-xl transition-all duration-300",
              isCollapsed ? "justify-center p-3" : "justify-between px-3 py-2",
              item.active
                ? "bg-white dark:bg-white/5 text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-transparent" 
                : "text-gray-600 dark:text-white/50 hover:bg-gray-500 dark:hover:bg-white/[0.03] hover:text-gray-950 dark:hover:text-white/80 cursor-pointer border border-transparent",
              item.locked && "opacity-50 cursor-not-allowed hover:bg-transparent dark:hover:bg-transparent"
            )}
            title={isCollapsed ? item.name : undefined}
          >
            <div className={cn("flex items-center", !isCollapsed && "gap-3")}>
              <item.icon className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span className="text-[13px] font-medium tracking-wide">{item.name}</span>}
            </div>
            {!isCollapsed && item.locked && <Lock className="w-3 h-3 text-gray-500 dark:text-white/30 shrink-0" />}
          </div>
        ))}
      </div>

      <div className="px-3 mb-2 flex justify-center">
        {isCollapsed ? (
          <button onClick={() => setIsCollapsed(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-gray-400 dark:text-white/50 hover:text-gray-900 dark:hover:text-white transition-colors" title="Expand Sidebar">
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <a href="#" className="flex w-full items-center justify-between px-3 py-2 rounded-lg border border-amber-500/20 dark:border-amber-500/50 bg-amber-50 dark:bg-amber-500/5 hover:bg-amber-100 dark:hover:bg-amber-500/10 hover:border-amber-500/40 dark:hover:border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.05)] dark:shadow-[0_0_12px_rgba(245,158,11,0.1)] hover:shadow-[0_0_16px_rgba(245,158,11,0.1)] dark:hover:shadow-[0_0_16px_rgba(245,158,11,0.2)] transition-all duration-300 group overflow-hidden">
            <Typewriter
              text="get dura in cli and mcp"
              speed={40}
              waitTime={4000}
              className="text-[11px] font-mono text-amber-700/80 dark:text-white/70 group-hover:text-amber-900 dark:group-hover:text-white/90 transition-colors whitespace-nowrap"
              cursorClassName="text-amber-500 ml-0.5 opacity-80 group-hover:opacity-100 transition-opacity"
            />
            <ArrowRight className="w-3.5 h-3.5 text-amber-500/50 dark:text-white/30 group-hover:text-amber-600 dark:group-hover:text-amber-500/80 group-hover:translate-x-1 transition-all duration-300 shrink-0" />
          </a>
        )}
      </div>

      {installState === 'has-repos' && (
        <div className="px-3 pb-6 pt-4 border-t border-gray-200 dark:border-white/5 space-y-1">
          {bottomNavigation.map((item) => (
            <div
              key={item.name}
              className={cn(
                "flex items-center rounded-xl text-gray-500 dark:text-white/50 hover:bg-gray-100 dark:hover:bg-white/[0.03] hover:text-gray-900 dark:hover:text-white/80 cursor-pointer transition-all duration-300",
                isCollapsed ? "justify-center p-3" : "gap-3 px-3 py-2"
              )}
              title={isCollapsed ? item.name : undefined}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span className="text-[13px] font-medium tracking-wide">{item.name}</span>}
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}
