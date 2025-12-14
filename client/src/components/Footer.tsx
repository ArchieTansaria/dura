import { motion } from 'framer-motion';

export const Footer = () => {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8 }}
      className="w-full py-8 px-4 sm:px-6 lg:px-8 mt-16 border-t border-white/10"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-dura-text-secondary">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <span>Install: <code className="px-2 py-1 bg-black/20 rounded">npm install -g dura-kit</code></span>
            <span className="hidden sm:inline">•</span>
            <span>CLI: <code className="px-2 py-1 bg-black/20 rounded">npx dura-kit &lt;repo-url&gt; --json</code></span>
          </div>
          <div>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-dura-accent hover:underline flex items-center gap-2"
            >
              GitHub
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};
