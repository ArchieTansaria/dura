import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './GlassCard';
import type { Dependency } from '../types/dura';

interface DependencyListProps {
  dependencies: Dependency[];
  filter?: 'all' | 'high' | 'medium' | 'low';
}

const RiskBadge = ({ level }: { level: string }) => {
  const colors = {
    high: 'bg-dura-high/20 text-dura-high border-dura-high/50',
    medium: 'bg-dura-medium/20 text-dura-medium border-dura-medium/50',
    low: 'bg-dura-low/20 text-dura-low border-dura-low/50',
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold border ${
        colors[level as keyof typeof colors] || colors.low
      }`}
    >
      {level.toUpperCase()}
    </span>
  );
};

const DependencyItem = ({ dependency }: { dependency: Dependency }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="border-b border-white/5 last:border-b-0"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full py-4 flex items-center justify-between hover:bg-white/5 transition-colors rounded-lg px-2 -mx-2"
      >
        <div className="flex items-center gap-4 flex-1 text-left">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h4 className="font-semibold text-white truncate">{dependency.name}</h4>
              <RiskBadge level={dependency.riskLevel} />
            </div>
            <div className="text-sm text-dura-text-secondary">
              <span className="font-mono">{dependency.currentRange}</span>
              <span className="mx-2">→</span>
              <span className="font-mono text-dura-accent">{dependency.latest}</span>
            </div>
          </div>
        </div>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="ml-4"
        >
          <svg
            className="w-5 h-5 text-dura-text-secondary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </motion.div>
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-2 pb-4 space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-dura-text-secondary">Type: </span>
                  <span className="text-white">{dependency.type}</span>
                </div>
                <div>
                  <span className="text-dura-text-secondary">Diff: </span>
                  <span className="text-white capitalize">{dependency.diff}</span>
                </div>
                <div>
                  <span className="text-dura-text-secondary">Risk Score: </span>
                  <span className="text-white">{dependency.riskScore}</span>
                </div>
                <div>
                  <span className="text-dura-text-secondary">Breaking: </span>
                  <span className={dependency.breaking ? 'text-dura-high' : 'text-dura-low'}>
                    {dependency.breaking ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
              {dependency.breaking && dependency.releaseKeywords.length > 0 && (
                <div>
                  <span className="text-dura-text-secondary">Breaking Keywords: </span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {dependency.releaseKeywords.map((keyword, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-dura-high/20 text-dura-high rounded text-xs"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {dependency.githubRepoUrl && (
                <div>
                  <a
                    href={dependency.githubRepoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-dura-accent hover:underline"
                  >
                    View on GitHub →
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const DependencyList = ({ dependencies, filter = 'all' }: DependencyListProps) => {
  const filteredDeps =
    filter === 'all'
      ? dependencies
      : dependencies.filter((d) => d.riskLevel === filter);

  const groupedDeps = {
    high: dependencies.filter((d) => d.riskLevel === 'high'),
    medium: dependencies.filter((d) => d.riskLevel === 'medium'),
    low: dependencies.filter((d) => d.riskLevel === 'low'),
  };

  if (filteredDeps.length === 0) {
    return (
      <GlassCard>
        <p className="text-dura-text-secondary text-center py-8">
          No dependencies found matching the filter.
        </p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      {filter === 'all' ? (
        <>
          {groupedDeps.high.length > 0 && (
            <GlassCard>
              <h3 className="text-xl font-bold mb-4 text-dura-high">
                High Risk Dependencies ({groupedDeps.high.length})
              </h3>
              <div className="space-y-0">
                {groupedDeps.high.map((dep) => (
                  <DependencyItem key={dep.name} dependency={dep} />
                ))}
              </div>
            </GlassCard>
          )}
          {groupedDeps.medium.length > 0 && (
            <GlassCard>
              <h3 className="text-xl font-bold mb-4 text-dura-medium">
                Medium Risk Dependencies ({groupedDeps.medium.length})
              </h3>
              <div className="space-y-0">
                {groupedDeps.medium.map((dep) => (
                  <DependencyItem key={dep.name} dependency={dep} />
                ))}
              </div>
            </GlassCard>
          )}
          {groupedDeps.low.length > 0 && (
            <GlassCard>
              <h3 className="text-xl font-bold mb-4 text-dura-low">
                Low Risk Dependencies ({groupedDeps.low.length})
              </h3>
              <div className="space-y-0">
                {groupedDeps.low.map((dep) => (
                  <DependencyItem key={dep.name} dependency={dep} />
                ))}
              </div>
            </GlassCard>
          )}
        </>
      ) : (
        <GlassCard>
          <h3 className="text-xl font-bold mb-4 capitalize">
            {filter} Risk Dependencies ({filteredDeps.length})
          </h3>
          <div className="space-y-0">
            {filteredDeps.map((dep) => (
              <DependencyItem key={dep.name} dependency={dep} />
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
};

