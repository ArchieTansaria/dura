import { Github, Plus } from 'lucide-react';
import { cn } from '../utils/utils';

export function EmptyState({ type = 'install' }) {
  const isInstall = type === 'install';

  return (
    <div className="w-full flex-col flex items-center justify-center py-24 px-4 border border-white/5 rounded-2xl bg-black/20 backdrop-blur-sm border-dashed">
      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-inner ring-1 ring-white/5">
        <Github className="w-8 h-8 text-white/50" />
      </div>
      
      <h3 className="text-lg font-semibold text-white/90 tracking-tight mb-2">
        {isInstall ? "Connect GitHub to get started" : "Add your first repository"}
      </h3>
      
      <p className="text-sm text-white/40 mb-8 max-w-sm text-center leading-relaxed">
        {isInstall 
          ? "Connect your GitHub account to install the dura app and begin protecting your codebase." 
          : "You've successfully installed dura. Now add your first repository to get started with risk analysis."}
      </p>

      {isInstall ? (
        <a
          href={`${import.meta.env.VITE_BACKEND_URL}/connect/github`}
          className={cn(
            "group relative inline-flex items-center justify-center gap-2",
            "bg-white/10 hover:bg-white/15 text-white font-medium",
            "px-6 py-2.5 rounded-full transition-all border border-white/5 hover:border-white/10",
            "hover:-translate-y-0.5 shadow-sm"
          )}
        >
          <Github className="w-4 h-4 opacity-80 group-hover:opacity-100" />
          <span className="text-[14px]">Connect GitHub</span>
        </a>
      ) : (
        <button
          className={cn(
            "group relative inline-flex items-center justify-center gap-2",
            "bg-accent hover:bg-amber-500 text-white font-medium border border-transparent",
            "px-6 py-2.5 rounded-full transition-all shadow-lg shadow-accent/20",
            "hover:-translate-y-0.5"
          )}
        >
          <Plus className="w-4 h-4" />
          <span className="text-[14px]">Add Repository</span>
        </button>
      )}
    </div>
  );
}
