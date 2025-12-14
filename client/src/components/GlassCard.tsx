import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  glowColor?: 'cyan' | 'purple';
}

export const GlassCard = ({
  children,
  className = '',
  hover = true,
  glow = false,
  glowColor = 'cyan',
}: GlassCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`
        glass
        ${hover ? 'glass-hover' : ''}
        ${glow ? (glowColor === 'cyan' ? 'glow' : 'glow-purple') : ''}
        p-6
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};
