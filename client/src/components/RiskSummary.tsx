import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from './GlassCard';
import type { DURAResponse } from '../types/dura';

interface RiskSummaryProps {
  data: DURAResponse;
}

const AnimatedCounter = ({ value, duration = 1 }: { value: number; duration?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      
      setCount(Math.floor(value * progress));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(value);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return <span>{count}</span>;
};

export const RiskSummary = ({ data }: RiskSummaryProps) => {
  const summary = data.summary || {
    total: data.dependencies.length,
    high: data.dependencies.filter((d) => d.riskLevel === 'high').length,
    medium: data.dependencies.filter((d) => d.riskLevel === 'medium').length,
    low: data.dependencies.filter((d) => d.riskLevel === 'low').length,
  };

  const stats = [
    {
      label: 'High Risk',
      value: summary.high,
      color: 'text-dura-high',
      bgColor: 'bg-dura-high/10',
      borderColor: 'border-dura-high/30',
    },
    {
      label: 'Medium Risk',
      value: summary.medium,
      color: 'text-dura-medium',
      bgColor: 'bg-dura-medium/10',
      borderColor: 'border-dura-medium/30',
    },
    {
      label: 'Low Risk',
      value: summary.low,
      color: 'text-dura-low',
      bgColor: 'bg-dura-low/10',
      borderColor: 'border-dura-low/30',
    },
  ];

  return (
    <GlassCard className="mb-6">
      <h3 className="text-2xl font-bold mb-6">Risk Summary</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            className={`${stat.bgColor} ${stat.borderColor} border rounded-xl p-4 text-center`}
          >
            <div className={`text-4xl font-bold ${stat.color} mb-2`}>
              <AnimatedCounter value={stat.value} />
            </div>
            <div className="text-sm text-dura-text-secondary">{stat.label}</div>
          </motion.div>
        ))}
      </div>
      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="text-center">
          <span className="text-dura-text-secondary">Total Dependencies: </span>
          <span className="text-xl font-semibold text-dura-accent">
            <AnimatedCounter value={summary.total} />
          </span>
        </div>
      </div>
    </GlassCard>
  );
};

