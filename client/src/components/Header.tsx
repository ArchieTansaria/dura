import { motion } from 'framer-motion';

export const Header = () => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full py-6 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="text-4xl"
        >
          🦖
        </motion.span>
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-dura-accent to-dura-accent-alt bg-clip-text text-transparent">
            DURA
          </h1>
          <span className="text-sm sm:text-base text-dura-text-secondary hidden sm:inline">
            Dependency Update Risk Analyzer
          </span>
        </div>
      </div>
    </motion.header>
  );
};
