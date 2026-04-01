import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';
import { cn } from '../utils/utils';
import { GitBranch, Clock, AlertTriangle, ShieldAlert, CheckCircle2, FileCode, Package, RefreshCw, XCircle, Loader2 } from 'lucide-react';

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

// Helper to map DB riskLevel to UI status
const mapRiskLevel = (level) => {
  if (level === 'high') return 'RISKY';
  if (level === 'medium') return 'REVIEW';
  return 'SAFE';
};

export default function RepoDetail() {
  const { owner, name } = useParams();
  const navigate = useNavigate();
  const repoFullName = `${owner}/${name}`;
  
  const [activeTab, setActiveTab] = useState('overview');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [isUnscanned, setIsUnscanned] = useState(false);
  const [selectedDep, setSelectedDep] = useState(null);

  const fetchAnalysis = async (isPolling = false) => {
    try {
      if (!isPolling) setLoading(!analysis);
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/repo/${owner}/${name}`, {
        credentials: 'include'
      });
      
      if (res.status === 404) {
        setIsUnscanned(true);
        setAnalysis(null);
        return;
      }
      
      if (res.ok) {
        const data = await res.json();
        setAnalysis(data);
        setIsUnscanned(false);
        
        if (data.status === 'processing') {
          setIsScanning(true);
        } else {
          setIsScanning(false);
          // Set first dependency as selected if none selected
          if (!selectedDep && data.dependencies?.length > 0) {
            setSelectedDep(data.dependencies[0]);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch analysis:", error);
    } finally {
      if (!isPolling) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, [owner, name]);

  // Polling effect when scanning
  useEffect(() => {
    let intervalId;
    if (isScanning) {
      intervalId = setInterval(() => {
        fetchAnalysis(true);
      }, 3000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isScanning, owner, name]);

  useEffect(() => {
    if (analysis?.dependencies?.length > 0 && !selectedDep) {
      setSelectedDep(analysis.dependencies[0]);
    }
  }, [analysis]);

  const handleScan = async () => {
    try {
      setIsScanning(true);
      await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/repo/${owner}/${name}/scan`, {
        method: 'POST',
        credentials: 'include'
      });
      // Start polling
      setTimeout(() => fetchAnalysis(true), 1500);
    } catch (error) {
      console.error("Failed to trigger scan", error);
      setIsScanning(false);
    }
  };

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
                  {repoFullName}
                </h1>
              </div>
              <div className="flex items-center gap-4 text-[13px] text-white/40">
                <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-md border border-white/5">
                  <GitBranch className="w-3.5 h-3.5" />
                  <span>main</span>
                </div>
                {analysis?.scannedAt && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Last scanned: {new Date(analysis.scannedAt).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleScan}
              disabled={isScanning || loading}
              className={cn(
                "group relative inline-flex items-center justify-center gap-2",
                "bg-accent hover:bg-amber-500 text-white font-medium border border-transparent",
                "px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-accent/20",
                "hover:-translate-y-0.5",
                (isScanning || loading) && "opacity-70 cursor-not-allowed hover:-translate-y-0"
              )}
            >
              {isScanning ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              <span className="text-[14px]">
                {isScanning ? 'Scanning...' : 'Scan Now'}
              </span>
            </button>
          </div>

          {loading ? (
             <div className="flex-1 flex items-center justify-center">
               <Loader2 className="w-8 h-8 animate-spin text-accent/50" />
             </div>
          ) : isUnscanned ? (
             <div className="flex-1 flex flex-col items-center justify-center py-20">
                <ShieldAlert className="w-16 h-16 text-white/10 mb-6" />
                <h2 className="text-xl font-medium text-white mb-2">Repository Not Scanned</h2>
                <p className="text-white/40 text-center max-w-md mb-8">
                  We haven't recorded an analysis for {repoFullName} yet. Trigger a manual scan to inspect your dependencies.
                </p>
                <button
                  onClick={handleScan}
                  className="bg-white/10 hover:bg-white/15 text-white font-medium px-6 py-3 rounded-full transition-all border border-white/10 shadow-lg flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Trigger Initial Scan
                </button>
             </div>
          ) : (
            <>
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
                    
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 backdrop-blur-sm shadow-xl shadow-black/40 flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-white/50 text-[13px] font-medium uppercase tracking-widest group">Total Dependencies</span>
                        <Package className="w-5 h-5 text-white/30" />
                      </div>
                      <div className="text-5xl font-light tracking-tighter text-white">
                        {analysis?.summary?.totalDependencies || 0}
                      </div>
                    </div>

                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 backdrop-blur-sm shadow-xl shadow-black/40 flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-white/50 text-[13px] font-medium uppercase tracking-widest">Safe Updates</span>
                        <CheckCircle2 className="w-5 h-5 text-green-500/80" />
                      </div>
                      <div className="text-5xl font-light tracking-tighter text-white">
                        {analysis?.summary?.counts?.low || 0}
                      </div>
                    </div>

                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 backdrop-blur-sm shadow-xl shadow-black/40 flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-white/50 text-[13px] font-medium uppercase tracking-widest">Reviewable</span>
                        <AlertTriangle className="w-5 h-5 text-amber-500/80" />
                      </div>
                      <div className="text-5xl font-light tracking-tighter text-white">
                        {analysis?.summary?.counts?.medium || 0}
                      </div>
                    </div>

                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 backdrop-blur-sm shadow-xl shadow-black/40 flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-white/50 text-[13px] font-medium uppercase tracking-widest">Risky Updates</span>
                        <ShieldAlert className="w-5 h-5 text-red-500/80" />
                      </div>
                      <div className="text-5xl font-light tracking-tighter text-white">
                        {analysis?.summary?.counts?.high || 0}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'dependencies' && (
                  <div className="flex h-[600px] gap-6 flex-1 overflow-hidden">
                    {/* Left: Dependency List */}
                    <div className="w-1/3 flex flex-col bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl shadow-black/40 h-full">
                      <div className="p-4 border-b border-white/5 bg-black/20 flex justify-between items-center">
                        <span className="text-[13px] font-medium text-white/50 tracking-wide uppercase">All Updates ({analysis?.dependencies?.length || 0})</span>
                      </div>
                      <div className="overflow-y-auto flex-1 p-2 space-y-1">
                        {analysis?.dependencies?.map((dep, idx) => {
                          const status = mapRiskLevel(dep.riskLevel);
                          const Icon = statusIcons[status];
                          return (
                            <button
                              key={dep.name + idx}
                              onClick={() => setSelectedDep(dep)}
                              className={cn(
                                "w-full text-left p-4 rounded-xl transition-all border block",
                                selectedDep?.name === dep.name 
                                  ? "bg-white/[0.05] border-white/10 shadow-sm" 
                                  : "bg-transparent border-transparent hover:bg-white/[0.02] hover:border-white/5"
                              )}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 overflow-hidden">
                                  <h4 className="text-[14px] font-mono font-medium text-white/90 leading-snug mb-1.5 truncate">{dep.name}</h4>
                                  <div className="flex items-center gap-2 text-white/40 text-[12px] font-mono">
                                    <span>{dep.currentResolved || 'unknown'}</span>
                                    <span>→</span>
                                    <span className={cn(
                                      status === 'SAFE' ? 'text-green-400' :
                                      status === 'REVIEW' ? 'text-amber-500' : 'text-red-500'
                                    )}>{dep.latest || 'checking'}</span>
                                  </div>
                                </div>
                                <span className={cn(
                                  "px-1.5 py-0.5 rounded flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider border",
                                  statusColors[status]
                                )}>
                                  {status}
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
                                statusColors[mapRiskLevel(selectedDep.riskLevel)]
                              )}>
                                {mapRiskLevel(selectedDep.riskLevel) === 'SAFE' && <CheckCircle2 className="w-3 h-3" />}
                                {mapRiskLevel(selectedDep.riskLevel) === 'REVIEW' && <AlertTriangle className="w-3 h-3" />}
                                {mapRiskLevel(selectedDep.riskLevel) === 'RISKY' && <ShieldAlert className="w-3 h-3" />}
                                {mapRiskLevel(selectedDep.riskLevel)}
                              </span>
                              <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/5 border border-white/10 text-[12px] text-white/60 font-mono">
                                <span>{selectedDep.currentResolved || 'locked'}</span>
                                <span className="opacity-50">→</span>
                                <span className="text-white/90">{selectedDep.latest || 'checking'}</span>
                              </div>
                            </div>
                            <h2 className="text-2xl font-mono font-medium text-white tracking-tight leading-snug mb-2">
                              {selectedDep.name}
                            </h2>
                          </div>
                          
                          <div className="p-8 overflow-y-auto space-y-8 flex-1">
                            <div>
                              <h3 className="text-[13px] font-medium text-white/50 uppercase tracking-widest mb-3">
                               {mapRiskLevel(selectedDep.riskLevel) === 'SAFE' ? 'Why this update is safe' : 'Why this update is risky'}
                              </h3>
                              <p className="text-[15px] text-white/80 leading-relaxed font-mono">
                                Breaking changes confidence score: {selectedDep.breakingChange?.confidenceScore || 0}.<br/>
                                {selectedDep.breakingChange?.signals?.strong?.length > 0 && `Signals: ${selectedDep.breakingChange.signals.strong.join(', ')}`}
                              </p>
                            </div>
                            
                            <div>
                              <h3 className="text-[13px] font-medium text-white/50 uppercase tracking-widest mb-3">Release Summary</h3>
                              <div className="bg-black/30 border border-white/5 rounded-xl p-5 text-[14px] font-mono text-white/80 leading-relaxed shadow-inner">
                                {selectedDep.releaseKeywords?.length > 0 ? selectedDep.releaseKeywords.join(', ') : 'No semantic release tags extracted.'}
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
                                {mapRiskLevel(selectedDep.riskLevel) === 'RISKY' ? <XCircle className="w-4 h-4 text-red-500" /> : <CheckCircle2 className="w-4 h-4 text-green-500" />}
                                <span className="text-[14px]">
                                  {mapRiskLevel(selectedDep.riskLevel) === 'SAFE' ? 'Auto-update available' : 'Manual review strongly required'}
                                </span>
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
            </>
          )}

        </div>
      </main>
    </div>
  );
}
