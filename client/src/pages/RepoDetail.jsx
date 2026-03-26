import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';
import { cn } from '../utils/utils';
import { GitBranch, Clock, AlertTriangle, ShieldAlert, CheckCircle2, FileCode, Package, RefreshCw, XCircle } from 'lucide-react';

const mockDependencies = [
  {
    id: 1,
    name: 'react',
    currentVersion: '18.2.0',
    latestVersion: '18.3.1',
    status: 'SAFE',
    reason: 'Minor update with 100% passing tests in similar codebases. No breaking changes detected in the changelog.',
    releaseSummary: 'Includes bugfixes for Concurrent Mode and hydration mismatches.',
    action: 'Auto-update available'
  },
  {
    id: 2,
    name: 'framer-motion',
    currentVersion: '10.12.0',
    latestVersion: '11.0.3',
    status: 'REVIEW',
    reason: 'Major version bump. Includes minor breaking changes to LayoutGroup behavior that may affect this repository.',
    releaseSummary: 'Major release introducing unified spring animations and some deprecated prop removals.',
    action: 'Manual review required'
  },
  {
    id: 3,
    name: 'axios',
    currentVersion: '0.21.1',
    latestVersion: '1.6.8',
    status: 'RISKY',
    reason: 'Multiple major version jumps. The new version changes default adapter behavior and error handling schemas.',
    releaseSummary: 'Security patches, fetch adapter support, and breaking changes to interceptors.',
    action: 'High risk - test thoroughly'
  },
  {
    id: 4,
    name: 'tailwindcss',
    currentVersion: '3.3.0',
    latestVersion: '3.4.1',
    status: 'SAFE',
    reason: 'Safe minor version bump. Adds new utilities without affecting existing layout compilation.',
    releaseSummary: 'Adds dynamic viewport units, has(), and text-wrap utilities.',
    action: 'Auto-update available'
  }
];

const statusColors = {
  SAFE: 'text-green-500 bg-green-500/10 border-green-500/20',
  REVIEW: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  RISKY: 'text-red-500 bg-red-500/10 border-red-500/20'
};

const statusIcons = {
  SAFE: CheckCircle2,
  REVIEW: AlertTriangle,
  RISKY: ShieldAlert
};

export default function RepoDetail() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDep, setSelectedDep] = useState(mockDependencies[0]);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-accent/30 flex">
      <Sidebar />
      <Topbar />

      <main className="flex-1 ml-[240px] pt-[60px] min-h-screen relative z-10 flex flex-col bg-[#050505]">
        <div className="absolute top-0 left-1/3 w-1/2 h-64 bg-accent/5 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="p-8 lg:p-12 max-w-[1400px] w-full mx-auto flex-1 flex flex-col h-full">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8 border-b border-white/5 pb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <FileCode className="w-5 h-5 text-white/50" />
                <h1 className="text-2xl font-mono font-medium tracking-tight text-white">
                  {id ? decodeURIComponent(id) : 'dura/client'}
                </h1>
              </div>
              <div className="flex items-center gap-4 text-[13px] text-white/40">
                <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-md border border-white/5">
                  <GitBranch className="w-3.5 h-3.5" />
                  <span>main</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Last scanned: 2 hours ago</span>
                </div>
              </div>
            </div>

            <button
              className={cn(
                "group relative inline-flex items-center justify-center gap-2",
                "bg-accent hover:bg-amber-500 text-white font-medium border border-transparent",
                "px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-accent/20",
                "hover:-translate-y-0.5"
              )}
            >
              <RefreshCw className="w-4 h-4" />
              <span className="text-[14px]">Scan Now</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-6 border-b border-white/5 mb-8">
            {['overview', 'dependencies'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "pb-3 text-[14px] font-medium tracking-wide transition-all relative capitalize",
                  activeTab === tab ? "text-white" : "text-white/40 hover:text-white/70"
                )}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-accent rounded-t-full shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 w-full flex flex-col min-h-0">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 flex-1 h-full auto-rows-max">
                
                {/* Metrics */}
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 backdrop-blur-sm shadow-xl shadow-black/40 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-white/50 text-[13px] font-medium uppercase tracking-widest group">Total Dependencies</span>
                    <Package className="w-5 h-5 text-white/30" />
                  </div>
                  <div className="text-5xl font-light tracking-tighter text-white">42</div>
                </div>

                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 backdrop-blur-sm shadow-xl shadow-black/40 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-white/50 text-[13px] font-medium uppercase tracking-widest">Safe Updates</span>
                    <CheckCircle2 className="w-5 h-5 text-green-500/80" />
                  </div>
                  <div className="text-5xl font-light tracking-tighter text-white">8</div>
                </div>

                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 backdrop-blur-sm shadow-xl shadow-black/40 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-white/50 text-[13px] font-medium uppercase tracking-widest">Reviewable</span>
                    <AlertTriangle className="w-5 h-5 text-amber-500/80" />
                  </div>
                  <div className="text-5xl font-light tracking-tighter text-white">3</div>
                </div>

                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 backdrop-blur-sm shadow-xl shadow-black/40 flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-white/50 text-[13px] font-medium uppercase tracking-widest">Risky Updates</span>
                    <ShieldAlert className="w-5 h-5 text-red-500/80" />
                  </div>
                  <div className="text-5xl font-light tracking-tighter text-white">1</div>
                </div>
              </div>
            )}

            {activeTab === 'dependencies' && (
              <div className="flex h-[600px] gap-6 flex-1 overflow-hidden">
                {/* Left: Dependency List */}
                <div className="w-1/3 flex flex-col bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl shadow-black/40 h-full">
                  <div className="p-4 border-b border-white/5 bg-black/20 flex justify-between items-center">
                    <span className="text-[13px] font-medium text-white/50 tracking-wide uppercase">All Updates ({mockDependencies.length})</span>
                  </div>
                  <div className="overflow-y-auto flex-1 p-2 space-y-1">
                    {mockDependencies.map((dep) => {
                      const Icon = statusIcons[dep.status];
                      return (
                        <button
                          key={dep.id}
                          onClick={() => setSelectedDep(dep)}
                          className={cn(
                            "w-full text-left p-4 rounded-xl transition-all border block",
                            selectedDep?.id === dep.id 
                              ? "bg-white/[0.05] border-white/10 shadow-sm" 
                              : "bg-transparent border-transparent hover:bg-white/[0.02] hover:border-white/5"
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 overflow-hidden">
                              <h4 className="text-[14px] font-mono font-medium text-white/90 leading-snug mb-1.5 truncate">{dep.name}</h4>
                              <div className="flex items-center gap-2 text-white/40 text-[12px] font-mono">
                                <span>{dep.currentVersion}</span>
                                <span>→</span>
                                <span className={cn(
                                  dep.status === 'SAFE' ? 'text-green-400' :
                                  dep.status === 'REVIEW' ? 'text-amber-500' : 'text-red-500'
                                )}>{dep.latestVersion}</span>
                              </div>
                            </div>
                            <span className={cn(
                              "px-1.5 py-0.5 rounded flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider border",
                              statusColors[dep.status]
                            )}>
                              {dep.status}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right: Dependency Detail */}
                <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl shadow-black/40 flex flex-col h-full">
                  {selectedDep ? (
                    <div className="flex flex-col h-full">
                      <div className="p-8 border-b border-white/5 bg-black/10 shrink-0">
                        <div className="flex items-center gap-3 mb-4">
                          <span className={cn(
                            "px-2 py-1 rounded-md text-[11px] font-medium uppercase tracking-wider border flex items-center gap-1.5",
                            statusColors[selectedDep.status]
                          )}>
                            {selectedDep.status === 'SAFE' && <CheckCircle2 className="w-3 h-3" />}
                            {selectedDep.status === 'REVIEW' && <AlertTriangle className="w-3 h-3" />}
                            {selectedDep.status === 'RISKY' && <ShieldAlert className="w-3 h-3" />}
                            {selectedDep.status}
                          </span>
                          <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/5 border border-white/10 text-[12px] text-white/60 font-mono">
                            <span>{selectedDep.currentVersion}</span>
                            <span className="opacity-50">→</span>
                            <span className="text-white/90">{selectedDep.latestVersion}</span>
                          </div>
                        </div>
                        <h2 className="text-2xl font-mono font-medium text-white tracking-tight leading-snug mb-2">
                          {selectedDep.name}
                        </h2>
                      </div>
                      
                      <div className="p-8 overflow-y-auto space-y-8 flex-1">
                        <div>
                          <h3 className="text-[13px] font-medium text-white/50 uppercase tracking-widest mb-3">
                           {selectedDep.status === 'SAFE' ? 'Why this update is safe' : 'Why this update is risky'}
                          </h3>
                          <p className="text-[15px] text-white/80 leading-relaxed">
                            {selectedDep.reason}
                          </p>
                        </div>
                        
                        <div>
                          <h3 className="text-[13px] font-medium text-white/50 uppercase tracking-widest mb-3">Release Summary</h3>
                          <div className="bg-black/30 border border-white/5 rounded-xl p-5 text-[14px] font-mono text-white/80 leading-relaxed shadow-inner">
                            {selectedDep.releaseSummary}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-[13px] font-medium text-white/50 uppercase tracking-widest mb-3">Suggested Action</h3>
                          <button className={cn(
                            "inline-flex items-center gap-2",
                            "bg-white/10 hover:bg-white/15 text-white font-medium",
                            "px-5 py-2.5 rounded-xl transition-all border border-white/5 hover:border-white/10",
                            "hover:-translate-y-0.5 shadow-sm"
                          )}>
                            {selectedDep.status === 'RISKY' ? <XCircle className="w-4 h-4 text-red-500" /> : <CheckCircle2 className="w-4 h-4 text-green-500" />}
                            <span className="text-[14px]">{selectedDep.action}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-white/40 text-[14px]">
                      Select a dependency to view details
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
