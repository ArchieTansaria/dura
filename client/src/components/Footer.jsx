import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const STATUS_DOT_COLORS = {
  operational: 'bg-emerald-400',
  standby: 'bg-accent',
  degraded: 'bg-orange-500',
  down: 'bg-red-500',
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

export function Footer() {
  const [systemStatus, setSystemStatus] = useState(null);

  useEffect(() => {
    async function fetchStatus() {
      try {
        const res = await fetch('/api/status');
        if (res.ok) {
          const data = await res.json();
          const overall = getOverallStatus(data.services || []);
          setSystemStatus(overall);
        }
      } catch {
        // Silently fail
      }
    }
    fetchStatus();
  }, []);

  const dotColor = systemStatus ? STATUS_DOT_COLORS[systemStatus] : null;

  return (
    <footer id="footer" className="py-12 border-t border-subtle/30 mt-auto">
      <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
          <span className="text-secondary text-sm">
            © {new Date().getFullYear()} dura. All rights reserved.
          </span>
          
          {/* Status traffic light */}
          <Link
            to="/status"
            className="group flex items-center gap-2 text-secondary hover:text-primary text-sm transition-colors"
          >
            {dotColor ? (
              <span className="relative flex h-2 w-2">
                <span className={`animate-status-pulse absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColor}`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColor}`} />
              </span>
            ) : (
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white/20" />
            )}
            <span className="group-hover:underline underline-offset-2">System Status</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-6">
          <a href="https://github.com/ArchieTansaria/dura#readme" target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-primary text-sm transition-colors">Documentation</a>
          <a href="https://github.com/ArchieTansaria/dura" target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-primary text-sm transition-colors">GitHub</a>
          <a href="https://x.com/archietansaria" target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-primary text-sm transition-colors">Twitter</a>
        </div>
      </div>
    </footer>
  );
}
