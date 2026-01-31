import { useState } from 'react';
import { Terminal, Github, Bot, Box, ArrowRight, Check } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const OPTIONS = [
  {
    id: 'cli',
    label: 'CLI',
    icon: Terminal,
    command: 'npx dura https://github.com/org/repo',
    description: 'Run dura locally against any public repository.',
    helperText: 'Fast local analysis while reviewing dependency updates.'
  },
  {
    id: 'github',
    label: 'GitHub',
    icon: Github,
    contentLines: [
      'Pull request opened',
      '→ dura analyzes dependency updates',
      '→ risk summary posted as a PR comment'
    ],
    description: 'Install dura as a GitHub App to analyze dependency risk on every pull request.',
    helperText: 'No workflows. No config. Results appear directly on PRs.',
    isList: true
  },
  {
    id: 'mcp',
    label: 'MCP',
    icon: Bot,
    contentLines: [
      'POST /analyze',
      '→ dependency graph',
      '→ structured risk report (JSON)'
    ],
    description: 'Use dura as a machine-consumable service for agents and automation.',
    helperText: 'Designed for long-running systems that need structured risk data.',
    isList: true
  },
  {
    id: 'apify',
    label: 'Apify Actor',
    icon: Box,
    contentLines: [
      'Input: repository list',
      '→ dura actor runs analysis',
      '→ dataset with risk signals'
    ],
    description: 'Run dura as an Apify actor for large-scale dependency analysis.',
    helperText: 'Useful for scheduled scans, research, and multi-repo workflows.',
    isList: true
  }
];

export function InteractiveSelector() {
  const [selected, setSelected] = useState(OPTIONS[0]);

  return (
    <div className="w-full max-w-2xl mx-auto mt-12 backdrop-blur-sm bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden shadow-2xl shadow-black/50">
      {/* Header / Tabs */}
      <div className="flex items-center border-b border-white/5 bg-black/20 overflow-x-auto no-scrollbar">
        <div className="px-5 py-4 text-secondary text-sm font-medium whitespace-nowrap">
          Use dura via:
        </div>
        {OPTIONS.map((option) => {
          const Icon = option.icon;
          const isSelected = selected.id === option.id;
          return (
            <button
              key={option.id}
              onClick={() => setSelected(option)}
              className={cn(
                "flex items-center gap-2 px-5 py-4 text-sm font-medium transition-all duration-300 border-b-2 whitespace-nowrap outline-none focus-visible:bg-white/5",
                isSelected 
                  ? "border-accent text-primary bg-white/5" 
                  : "border-transparent text-secondary hover:text-primary hover:bg-white/[0.02]"
              )}
            >
              <Icon size={16} />
              {option.label}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="p-6 md:p-8 min-h-[220px] flex flex-col justify-between">
        <div className="font-mono text-sm md:text-base text-secondary bg-black/40 rounded-lg p-4 border border-white/5 shadow-inner">
          {selected.command && (
            <div className="flex items-center gap-2 text-primary">
              <span className="text-secondary select-none">$</span>
              <span className="break-all">{selected.command}</span>
            </div>
          )}
          {selected.isList && (
             <div className="flex flex-col gap-2 text-primary opacity-90">
               {selected.contentLines.map((line, i) => (
                 <div key={i} className={cn("flex items-center gap-2", i === 0 ? "text-secondary" : "")}>
                   {line}
                 </div>
               ))}
             </div>
          )}
        </div>
        
        <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
          <div className="space-y-2 max-w-md">
            <p className="text-sm font-medium text-primary">
              {selected.description}
            </p>
            {selected.helperText && (
              <p className="text-xs text-secondary leading-relaxed">
                {selected.helperText}
              </p>
            )}
          </div>
          
          <a 
            href="https://github.com/dura-metrics/dura" 
            target="_blank" 
            rel="noopener noreferrer"
            className="shrink-0 flex items-center gap-2 bg-primary text-background px-5 py-2.5 rounded-md font-medium text-sm hover:bg-white transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Github size={16} />
            Connect to GitHub
          </a>
        </div>
      </div>
    </div>
  );
}
