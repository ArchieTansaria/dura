import { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';
import { RepoTable } from '../components/RepoTable';
import { EmptyState } from '../components/EmptyState';
import { Search, Plus } from 'lucide-react';
import { cn } from '../utils/utils';

export default function Dashboard() {
  const [installState, setInstallState] = useState('none');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [repos, setRepos] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/dashboard`, {
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          if (!data.installed) {
            setInstallState('none');
          } else if (!data.installations || data.installations.length === 0) {
            setInstallState('no-repos');
          } else {
            const allRepos = data.installations.flatMap(inst => inst.repos || []);
            setRepos(allRepos);
            setInstallState(allRepos.length === 0 ? 'no-repos' : 'has-repos');
          }
        } else {
          setInstallState('none');
        }
      } catch (error) {
        console.error("Failed to fetch dashboard:", error);
        setInstallState('none');
      } finally {
        setIsLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  const filteredRepos = repos.filter(repo => 
    (repo.full_name || repo.name).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-accent/30 flex relative overflow-hidden">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <Topbar isCollapsed={isCollapsed} />

      {/* Main Content Area */}
      <main className={cn(
        "flex-1 pt-[60px] min-h-screen relative z-10 flex flex-col bg-[#050505] transition-all duration-300",
        isCollapsed ? "ml-[80px]" : "ml-[240px]"
      )}>
        
        {/* Subtle top ambient glow */}
        <div className="absolute top-0 left-1/4 w-1/2 h-64 bg-accent/5 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="p-8 lg:p-12 max-w-[1200px] w-full mx-auto flex-1 flex flex-col">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">Repositories</h1>
              <p className="text-[15px] text-white/50 leading-relaxed font-light">
                Manage your connected repositories
              </p>
            </div>

            {installState === 'has-repos' && (
              <button
                className={cn(
                  "group relative inline-flex items-center justify-center gap-2",
                  "bg-accent hover:bg-amber-500 text-white font-medium border border-transparent",
                  "px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-accent/20",
                  "hover:-translate-y-0.5"
                )}
              >
                <Plus className="w-4 h-4" />
                <span className="text-[14px]">Add Repository</span>
              </button>
            )}
          </div>

          {/* Search Bar - only show if has repos */}
          {installState === 'has-repos' && !isLoading && (
            <div className="mb-6 max-w-md relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-white transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Find a repository..."
                className="w-full bg-white/[0.02] border border-white/5 hover:border-white/10 focus:border-white/20 focus:bg-white/[0.04] rounded-xl pl-10 pr-4 py-2.5 text-[14px] text-white placeholder:text-white/30 outline-none transition-all duration-300 shadow-sm"
              />
            </div>
          )}

          {/* Content States */}
          <div className="flex-1 w-full flex flex-col">
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-t-2 border-r-2 border-accent/50 border-solid animate-spin" />
              </div>
            ) : (
              <>
                {installState === 'none' && <EmptyState type="install" />}
                {installState === 'no-repos' && <EmptyState type="repo" />}
                {installState === 'has-repos' && <RepoTable repos={filteredRepos} />}
              </>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
