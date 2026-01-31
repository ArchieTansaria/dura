import { AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const DEPENDENCIES = [
  {
    name: 'express',
    update: '4.18.2 → 5.0.0',
    risk: 'HIGH',
    signal: 'Middleware signature changed',
    riskColor: 'text-red-400',
    riskBg: 'bg-red-500/10 border-red-500/20'
  },
  {
    name: 'react',
    update: '18.2.0 → 19.0.0',
    risk: 'MEDIUM',
    signal: 'Deprecated lifecycle methods',
    riskColor: 'text-amber-400',
    riskBg: 'bg-amber-500/10 border-amber-500/20'
  },
  {
    name: 'eslint',
    update: '8.56.0 → 9.0.0',
    risk: 'MEDIUM',
    signal: 'Config format flat-file migration',
    riskColor: 'text-amber-400',
    riskBg: 'bg-amber-500/10 border-amber-500/20'
  },
  {
    name: 'lodash',
    update: '4.17.21 → 5.0.0',
    risk: 'LOW',
    signal: 'Modular imports recommended',
    riskColor: 'text-emerald-400',
    riskBg: 'bg-emerald-500/10 border-emerald-500/20'
  }
];

export function RiskAnalysisDemo() {
  return (
    <section className="w-full max-w-2xl mx-auto px-4 -mt-8 mb-24 relative z-10">
      <div className="rounded-lg border border-white/5 bg-black/40 backdrop-blur-md overflow-hidden shadow-2xl shadow-black/60">
        
        {/* Header - mimic terminal or tool header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-2">
             <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
             <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
             <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
          </div>
          <div className="text-[10px] font-mono text-secondary uppercase tracking-widest opacity-60">Analysis Output</div>
        </div>

        {/* Content Table */}
        <div className="font-mono text-xs md:text-sm">
          {DEPENDENCIES.map((dep, idx) => (
            <div 
              key={dep.name}
              className={cn(
                "group flex flex-col md:flex-row md:items-center py-3 px-4 border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] transition-colors",
              )}
            >
              <div className="w-32 shrink-0 font-medium text-primary mb-1 md:mb-0">
                {dep.name}
              </div>
              
              <div className="flex items-center gap-2 w-48 shrink-0 text-secondary mb-2 md:mb-0">
                <span>{dep.update.split('→')[0].trim()}</span>
                <ArrowRight size={12} className="opacity-40" />
                <span className="text-primary/90">{dep.update.split('→')[1].trim()}</span>
              </div>

              <div className="flex-grow flex items-center justify-between gap-4">
                <span className="text-secondary opacity-70 truncate max-w-[180px]">
                  {dep.signal}
                </span>
                
                <div className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-bold tracking-wider border",
                  dep.riskBg,
                  dep.riskColor
                )}>
                  {dep.risk}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Footer Status */}
        <div className="px-4 py-2 bg-white/[0.02] border-t border-white/5 flex justify-between items-center text-[10px] text-secondary font-mono">
           <span>Scan complete in 420ms</span>
           <span className="text-emerald-500 flex items-center gap-1">
             <CheckCircle2 size={10} />
             Verification Ready
           </span>
        </div>
      </div>
    </section>
  );
}
