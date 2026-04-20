import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { cn } from '../utils/utils';
import {
  Server,
  Cpu,
  Database,
  RefreshCw,
  ArrowLeft,
  Info,
  ExternalLink,
} from 'lucide-react';

const SERVICE_ICONS = {
  'dura-api-service': Server,
  'dura-worker-service': Cpu,
  'upstash-redis': Database,
};

const STATUS_CONFIG = {
  operational: {
    label: 'Operational',
    dotClass: 'bg-emerald-400',
    pillBg: 'bg-emerald-400/10 border-emerald-400/20 text-emerald-400',
    glow: 'shadow-[0_0_12px_rgba(52,211,153,0.3)]',
  },
  standby: {
    label: 'Standby',
    dotClass: 'bg-amber-400',
    pillBg: 'bg-amber-400/10 border-amber-400/20 text-amber-400',
    glow: 'shadow-[0_0_12px_rgba(251,191,36,0.3)]',
  },
  degraded: {
    label: 'Degraded',
    dotClass: 'bg-orange-500',
    pillBg: 'bg-orange-500/10 border-orange-500/20 text-orange-500',
    glow: 'shadow-[0_0_12px_rgba(249,115,22,0.3)]',
  },
  down: {
    label: 'Down',
    dotClass: 'bg-red-500',
    pillBg: 'bg-red-500/10 border-red-500/20 text-red-500',
    glow: 'shadow-[0_0_12px_rgba(239,68,68,0.3)]',
  },
};

function getOverallStatus(services) {
  const priority = ['down', 'degraded', 'standby', 'operational'];
  let worst = 'operational';
  for (const svc of services) {
    if (priority.indexOf(svc.status) < priority.indexOf(worst)) {
      worst = svc.status;
    }
  }
  return worst;
}

function SkeletonCard() {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 backdrop-blur-sm animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/5" />
          <div className="space-y-2">
            <div className="w-28 h-4 bg-white/5 rounded" />
            <div className="w-20 h-3 bg-white/5 rounded" />
          </div>
        </div>
        <div className="w-24 h-6 bg-white/5 rounded-full" />
      </div>
      <div className="w-full h-3 bg-white/5 rounded mt-4" />
      <div className="w-2/3 h-3 bg-white/5 rounded mt-2" />
    </div>
  );
}

function StatusCard({ service }) {
  const config = STATUS_CONFIG[service.status] || STATUS_CONFIG.down;
  const Icon = SERVICE_ICONS[service.id] || Server;

  return (
    <div className="group relative bg-white/[0.02] border border-white/5 rounded-2xl p-6 backdrop-blur-sm hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500 shadow-xl shadow-black/20">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-white/[0.08] transition-colors duration-300">
            <Icon className="w-5 h-5 text-secondary group-hover:text-primary transition-colors" />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-primary tracking-tight">{service.name}</h3>
            <span className="text-[11px] text-secondary/60 font-mono">{service.id}</span>
          </div>
        </div>

        {/* Status pill */}
        <div className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full border text-[12px] font-semibold tracking-wide uppercase",
          config.pillBg,
        )}>
          <span className="relative flex h-2 w-2">
            <span className={cn(
              "animate-status-pulse absolute inline-flex h-full w-full rounded-full opacity-75",
              config.dotClass,
            )} />
            <span className={cn(
              "relative inline-flex rounded-full h-2 w-2",
              config.dotClass,
            )} />
          </span>
          {config.label}
        </div>
      </div>

      <p className="text-[13px] text-secondary leading-relaxed">{service.description}</p>

      {/* Running/Desired count for ECS services */}
      {service.runningCount !== undefined && (
        <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-4">
          <div className="text-[12px] text-secondary/60">
            <span className="text-primary font-mono font-medium">{service.runningCount}</span>
            <span className="mx-1">/</span>
            <span className="font-mono">{service.desiredCount}</span>
            <span className="ml-1.5">tasks</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SystemStatus() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchStatus = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/status');
      if (!res.ok) throw new Error(`Status check failed (${res.status})`);
      const data = await res.json();
      setServices(data.services || []);
      setLastChecked(data.timestamp);
    } catch (err) {
      console.error('Failed to fetch status:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const overallStatus = services.length > 0 ? getOverallStatus(services) : null;
  const overallConfig = overallStatus ? STATUS_CONFIG[overallStatus] : null;

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-accent/20 bg-background overflow-x-hidden">
      <Navbar />

      <main className="flex-grow flex flex-col items-center w-full relative pt-32 pb-20 px-4">
        {/* Ambient glow */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-accent/5 blur-[150px] rounded-full pointer-events-none" />

        <div className="relative z-10 w-full max-w-2xl mx-auto">
          {/* Back link */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[13px] text-secondary hover:text-primary transition-colors mb-8 group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Back to home
          </Link>

          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-3xl font-semibold tracking-tight text-primary">System Status</h1>
              {overallConfig && (
                <div className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold uppercase tracking-wider",
                  overallConfig.pillBg,
                )}>
                  <span className="relative flex h-1.5 w-1.5">
                    <span className={cn("animate-status-pulse absolute inline-flex h-full w-full rounded-full opacity-75", overallConfig.dotClass)} />
                    <span className={cn("relative inline-flex rounded-full h-1.5 w-1.5", overallConfig.dotClass)} />
                  </span>
                  {overallConfig.label}
                </div>
              )}
            </div>
            <p className="text-[15px] text-secondary leading-relaxed max-w-lg">
              Real-time health of the Dura infrastructure. Services are hosted on AWS ECS Fargate with Upstash Redis for queuing.
            </p>
          </div>

          {/* Last checked + Refresh */}
          <div className="flex items-center justify-between mb-6">
            <div className="text-[12px] text-secondary/60 font-mono">
              {lastChecked && (
                <>Last checked: {new Date(lastChecked).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</>
              )}
            </div>
            <button
              onClick={() => fetchStatus(true)}
              disabled={isRefreshing}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-all duration-300",
                "bg-white/5 border-white/10 text-secondary hover:text-primary hover:bg-white/10 hover:border-white/15",
                isRefreshing && "opacity-50 cursor-not-allowed"
              )}
            >
              <RefreshCw className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin")} />
              Refresh
            </button>
          </div>

          {/* Error state */}
          {error && !loading && (
            <div className="mb-6 p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 text-[13px]">
              {error}
            </div>
          )}

          {/* Status Cards */}
          <div className="space-y-4">
            {loading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : (
              services.map((service) => (
                <StatusCard key={service.id} service={service} />
              ))
            )}
          </div>

          {/* Standby explainer */}
          {!loading && services.some((s) => s.status === 'standby') && (
            <div className="mt-8 flex items-start gap-3 p-4 rounded-xl border border-amber-400/10 bg-amber-400/[0.03]">
              <Info className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-[13px] text-amber-200/80 font-medium mb-1">Why is a service in Standby?</p>
                <p className="text-[12px] text-secondary leading-relaxed">
                  Services in Standby have been intentionally scaled to zero as a cost-saving measure. This is normal for a portfolio project — the service will automatically spin up within ~60 seconds when a request is made.
                </p>
              </div>
            </div>
          )}

          {/* Architecture note */}
          <div className="mt-6 flex items-start gap-3 p-4 rounded-xl border border-white/5 bg-white/[0.02]">
            <ExternalLink className="w-4 h-4 text-secondary/50 mt-0.5 shrink-0" />
            <p className="text-[12px] text-secondary/60 leading-relaxed">
              Infrastructure: <span className="text-secondary">AWS ECS Fargate</span> (compute) · <span className="text-secondary">Upstash Redis</span> (queue) · <span className="text-secondary">MongoDB Atlas</span> (database) · <span className="text-secondary">Vercel</span> (frontend)
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
