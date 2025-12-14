import { motion } from 'framer-motion';
import { GlassCard } from './GlassCard';

interface RecommendationsProps {
  recommendations: string[];
}

export const Recommendations = ({ recommendations }: RecommendationsProps) => {
  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <GlassCard className="mb-6" glowColor="purple">
      <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <span>💡</span>
        Recommendations
      </h3>
      <ul className="space-y-3">
        {recommendations.map((rec, index) => (
          <motion.li
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start gap-3"
          >
            <span className="text-dura-accent mt-1">•</span>
            <span className="text-dura-text-secondary flex-1">{rec}</span>
          </motion.li>
        ))}
      </ul>
    </GlassCard>
  );
};
