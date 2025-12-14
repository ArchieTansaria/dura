import { useState } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from './GlassCard';

interface HeroProps {
  onAnalyze: (repoUrl: string) => void;
  isLoading: boolean;
}

export const Hero = ({ onAnalyze, isLoading }: HeroProps) => {
  const [repoUrl, setRepoUrl] = useState('');
  const [error, setError] = useState('');

  const validateUrl = (url: string): boolean => {
    try {
      const githubUrlPattern = /^https?:\/\/(www\.)?github\.com\/[\w\-\.]+\/[\w\-\.]+/;
      return githubUrlPattern.test(url);
    } catch {
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!repoUrl.trim()) {
      setError('Please enter a GitHub repository URL');
      return;
    }

    if (!validateUrl(repoUrl)) {
      setError('Please enter a valid GitHub repository URL (e.g., https://github.com/facebook/react)');
      return;
    }

    onAnalyze(repoUrl.trim());
  };

  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-white via-dura-accent to-dura-accent-alt bg-clip-text text-transparent">
            Analyze Dependency Risks
            <br />
            Before You Update
          </h2>
          <p className="text-lg sm:text-xl text-dura-text-secondary mb-12 max-w-2xl mx-auto">
            Know exactly which dependencies are safe to update and which need careful review
          </p>
        </motion.div>

        <GlassCard className="max-w-2xl mx-auto" glow>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => {
                  setRepoUrl(e.target.value);
                  setError('');
                }}
                placeholder="https://github.com/facebook/react"
                className="w-full px-4 py-4 bg-black/20 border border-white/10 rounded-xl text-white placeholder-dura-text-secondary focus:outline-none focus:ring-2 focus:ring-dura-accent focus:border-transparent transition-all"
                disabled={isLoading}
              />
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-dura-high mt-2 text-left"
                >
                  {error}
                </motion.p>
              )}
            </div>
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-dura-accent to-dura-accent-alt text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-dura-accent/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Analyzing...
                </span>
              ) : (
                'Analyze Repository'
              )}
            </motion.button>
          </form>
        </GlassCard>
      </div>
    </section>
  );
};
