import { Github, Clock } from 'lucide-react';
import { cn } from '../utils/utils';

export function RepoTable({ repos = [] }) {
  if (!repos.length) return null;

  return (
    <div className="w-full border border-gray-300 dark:border-white/5 rounded-2xl bg-white dark:bg-black/20 overflow-hidden backdrop-blur-sm shadow-md dark:shadow-none">
      <table className="w-full text-[13px] text-left border-collapse whitespace-nowrap">
        <thead>
          <tr className="border-b border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02]">
            <th className="px-6 py-4 font-semibold text-gray-700 dark:text-white/50 tracking-wide">Repository</th>
            <th className="px-6 py-4 font-semibold text-gray-700 dark:text-white/50 tracking-wide">Status</th>
            <th className="px-6 py-4 font-semibold text-gray-700 dark:text-white/50 tracking-wide">Last Updated</th>
            <th className="px-10 py-4 font-semibold text-gray-700 dark:text-white/50 tracking-wide text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-white/5">
          {repos.map((repo, index) => (
            <tr key={repo.id} className="group hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors duration-300">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-md bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-white/5 flex items-center justify-center shrink-0">
                    <span className="text-[11px] font-mono font-medium text-gray-600 dark:text-white/50">{index + 1}</span>
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white/90 group-hover:text-black dark:group-hover:text-white transition-colors">{repo.name}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className={cn(
                  "inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide border",
                  repo.private 
                    ? "bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-500/20" 
                    : "bg-gray-100 dark:bg-white/5 text-gray-800 dark:text-white/60 border-gray-300 dark:border-white/10"
                )}>
                  {repo.private ? 'Private' : 'Public'}
                </div>
              </td>
              <td className="px-6 py-4 font-medium text-gray-600 dark:text-white/40">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 opacity-70 shrink-0 text-gray-500 dark:text-inherit" />
                  {new Date(repo.updated_at).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
              </td>
              <td className="px-6 py-4 text-right">
                <button className="text-gray-600 hover:text-gray-900 dark:text-white/40 dark:hover:text-white font-semibold bg-transparent hover:bg-gray-200 dark:hover:bg-white/5 px-3 py-1.5 rounded-lg transition-all border border-transparent hover:border-gray-300 dark:hover:border-white/10">
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
