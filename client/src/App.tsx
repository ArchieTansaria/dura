import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { RiskSummary } from './components/RiskSummary';
import { DependencyList } from './components/DependencyList';
import { Recommendations } from './components/Recommendations';
import { Footer } from './components/Footer';
import { ResultsActions } from './components/ResultsActions';
import { analyzeDependencies } from './services/api';
import type { DURAResponse } from './types/dura';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<DURAResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (repoUrl: string) => {
    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const data = await analyzeDependencies(repoUrl);
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze repository');
      console.error('Analysis error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 w-full">
        <Hero onAnalyze={handleAnalyze} isLoading={isLoading} />
        
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-6"
            >
              <div className="glass border-dura-high/50 bg-dura-high/10 p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-dura-high flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-dura-high mb-1">Analysis Failed</h3>
                    <p className="text-sm text-dura-text-secondary">{error}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {results && (
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full px-4 sm:px-6 lg:px-8 pb-12"
            >
              <div className="max-w-7xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-8"
                >
                  <h2 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-dura-accent to-dura-accent-alt bg-clip-text text-transparent">
                    Analysis Results
                  </h2>
                  <p className="text-dura-text-secondary">
                    Review the risk assessment for each dependency update
                  </p>
                </motion.div>

                <ResultsActions data={results} />

                <RiskSummary data={results} />

                {results.recommendations && results.recommendations.length > 0 && (
                  <Recommendations recommendations={results.recommendations} />
                )}

                <DependencyList dependencies={results.dependencies} />
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}

export default App;
