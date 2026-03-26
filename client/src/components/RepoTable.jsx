import { Github, Clock } from 'lucide-react';
import { cn } from '../utils/utils';

export function RepoTable({ repos = [] }) {
  if (!repos.length) return null;

  return (
    <div className="w-full border border-white/5 rounded-2xl bg-black/20 overflow-hidden backdrop-blur-sm">
      <table className="w-full text-[13px] text-left border-collapse whitespace-nowrap">
        <thead>
          <tr className="border-b border-white/5 bg-white/[0.02]">
            <th className="px-6 py-4 font-medium text-white/50 tracking-wide">Repository</th>
            <th className="px-6 py-4 font-medium text-white/50 tracking-wide">Status</th>
            <th className="px-6 py-4 font-medium text-white/50 tracking-wide">Last Updated</th>
            <th className="px-6 py-4 font-medium text-white/50 tracking-wide text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {repos.map((repo) => (
            <tr key={repo.id} className="group hover:bg-white/[0.02] transition-colors duration-300">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
                    <Github className="w-4 h-4 text-white/70" />
                  </div>
                  <span className="font-medium text-white/90 group-hover:text-white transition-colors">{repo.name}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className={cn(
                  "inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-medium tracking-wide border",
                  repo.private 
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20" 
                    : "bg-white/5 text-white/60 border-white/10"
                )}>
                  {repo.private ? 'Private' : 'Public'}
                </div>
              </td>
              <td className="px-6 py-4 text-white/40">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 opacity-70 shrink-0" />
                  {new Date(repo.updated_at).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
              </td>
              <td className="px-6 py-4 text-right">
                <button className="text-white/40 hover:text-white font-medium bg-transparent hover:bg-white/5 px-3 py-1.5 rounded-lg transition-all border border-transparent hover:border-white/10">
                  Settings
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
