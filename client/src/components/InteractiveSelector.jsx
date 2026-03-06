import { useState, useEffect } from 'react';
import { Terminal, Github, Bot, Box, Copy, Check, ChevronDown, ExternalLink } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const MCP_COMMAND = 'docker run --rm -i archietans/dura-mcp';
const CLI_COMMAND = 'npx dura-kit https://github.com/org/repo';

const OPTIONS = [
  {
    id: 'github',
    label: 'GitHub App',
    icon: Github,
    contentLines: [
      'Pull request opened',
      '→ dependency updates detected',
      '→ dependency risk analyzed',
      '→ summary posted on PR'
    ],
    description: 'Two-click GitHub App install. Automatically analyze dependency updates on every PR.',
    isList: true,
    buttonLabel: 'Connect GitHub',
    buttonIcon: Github,
    buttonHref: 'https://github.com/apps/dura-dep',
    buttonAction: 'link'
  },
  {
    id: 'cli',
    label: 'CLI',
    icon: Terminal,
    command: CLI_COMMAND,
    description: 'Run dura locally and detect breaking dependency updates from your terminal in seconds.',
    buttonLabel: 'Copy command',
    buttonIcon: Copy,
    buttonAction: 'copy',
    copyText: CLI_COMMAND,
    hasOutput: true,
    outputLines: [
      'Scanning dependencies...',
      '⚠ 3 high-risk updates detected',
      '✔ Health score: 85/100'
    ]
  },
  {
    id: 'mcp',
    label: 'MCP',
    icon: Bot,
    command: MCP_COMMAND,
    extraLines: [
      '→ dependency graph',
      '→ structured risk report (JSON)'
    ],
    description: 'Expose dura\'s dependency analysis to IDEs and AI agents via MCP and get structured risk report.',
    buttonLabel: 'View MCP setup',
    buttonIcon: ExternalLink,
    buttonHref: '#',
    buttonAction: 'link',
    hasUsage: true
  },
  {
    id: 'apify',
    label: 'Apify',
    icon: Box,
    contentLines: [
      'Input: repository list',
      '→ dura actor runs analysis',
      '→ dataset with risk signals'
    ],
    description: 'Run dura as an Apify actor for large-scale dependency analysis.\nGenerate datasets with actionable risk signals.',
    isList: true,
    buttonLabel: 'Run actor',
    buttonIcon: ExternalLink,
    buttonHref: 'https://console.apify.com/',
    buttonAction: 'link'
  }
];

export function InteractiveSelector() {
  const [selected, setSelected] = useState(OPTIONS[0]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timeout);
    }
  }, [copied]);


  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
  };

  const handleButtonClick = () => {
    if (selected.buttonAction === 'copy') {
      handleCopy(selected.copyText);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-10 backdrop-blur-sm bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden shadow-2xl shadow-black/50">
      {/* Header / Tabs */}
      <div className="flex items-center border-b border-white/5 bg-black/20 overflow-x-auto no-scrollbar">
        <div className="px-5 py-4 text-secondary text-sm font-medium whitespace-nowrap">
          Run dura via
        </div>
        {OPTIONS.map((option) => {
          const Icon = option.icon;
          const isSelected = selected.id === option.id;
          return (
            <button
              key={option.id}
              onClick={() => {
                setSelected(option);
                setCopied(false);
              }}
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
      <div className="p-6 md:p-6 min-h-[220px] flex flex-col justify-between">
        <div className="font-mono text-sm md:text-base text-secondary bg-black/40 rounded-lg p-4 border border-white/5 shadow-inner">
          {/* CLI command with copy + output preview */}
          {selected.command && !selected.hasUsage && (
            <div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-primary">
                  <span className="text-secondary select-none">$</span>
                  <span className="break-all">{selected.command}</span>
                </div>
                {selected.hasOutput && (
                  <button
                    onClick={() => handleCopy(CLI_COMMAND)}
                    className="p-1.5 text-secondary hover:text-primary transition-colors rounded shrink-0"
                    aria-label="Copy command"
                  >
                    {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  </button>
                )}
              </div>
              {selected.outputLines && (
                <div className="text-secondary/70 mt-3 pt-3 pl-4 border-t border-white/5 text-left">
                  {selected.outputLines.map((line, i) => (
                    <div key={i}>{line || '\u00A0'}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* MCP command with copy + usage toggle */}
          {selected.command && selected.hasUsage && (
            <div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-primary">
                  <span className="text-secondary select-none">$</span>
                  <span className="break-all">{selected.command}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleCopy(MCP_COMMAND)}
                    className="p-1.5 text-secondary hover:text-primary transition-colors rounded"
                    aria-label="Copy command"
                  >
                    {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  </button>
                  {/* <button
                    onClick={() => setUsageOpen(!usageOpen)}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-secondary hover:text-primary transition-colors rounded"
                  >
                    Usage
                    <ChevronDown size={12} className={cn("transition-transform duration-200", usageOpen && "rotate-180")} />
                  </button> */}
                </div>
              </div>

              {/* Collapsible usage */}
              {/* {usageOpen && (
                <div className="mt-3 pt-3 border-t border-white/5">
                  <pre className="text-xs text-secondary/80 overflow-x-auto whitespace-pre">{MCP_USAGE}</pre>
                </div>
              )} */}

              {/* Extra info lines */}
              {selected.extraLines && (
                <div className="flex flex-col gap-2 text-primary opacity-90 mt-3 pt-3 border-t border-white/5">
                  {selected.extraLines.map((line, i) => (
                    <div key={i} className="flex items-center gap-2">
                      {line}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* List content (GitHub, Apify) */}
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
        
        <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
          <div className="space-y-2 max-w-md">
            <p className="text-sm font-medium text-primary">
              {selected.description}
            </p>
          </div>
          
          {selected.buttonAction === 'link' ? (
            <a 
              href={selected.buttonHref} 
              target="_blank" 
              rel="noopener noreferrer"
              className="shrink-0 flex items-center gap-2 bg-primary text-background px-5 py-2.5 rounded-md font-medium text-sm hover:bg-white transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <selected.buttonIcon size={16} />
              {selected.buttonLabel}
            </a>
          ) : (
            <button 
              onClick={handleButtonClick}
              className="shrink-0 flex items-center gap-2 bg-primary text-background px-5 py-2.5 rounded-md font-medium text-sm hover:bg-white transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {copied ? <Check size={16} /> : <selected.buttonIcon size={16} />}
              {copied ? 'Copied!' : selected.buttonLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}