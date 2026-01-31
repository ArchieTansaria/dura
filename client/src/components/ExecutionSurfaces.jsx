import { Terminal, Github, Bot, Box } from 'lucide-react';

const SURFACES = [
  {
    label: "CLI",
    icon: Terminal,
    description: "Runs locally during dependency review."
  },
  {
    label: "GitHub",
    icon: Github,
    description: "Posts risk summaries directly on pull requests."
  },
  {
    label: "MCP",
    icon: Bot,
    description: "Exposes structured risk data for agents."
  },
  {
    label: "Apify Actor",
    icon: Box,
    description: "Scales across repositories as an actor."
  }
];

export function ExecutionSurfaces() {
  return (
    <section className="py-24 px-4 w-full border-t border-white/5 relative bg-gradient-to-b from-black to-black">
       {/* Subtle background glow */}
       <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-full bg-accent/[0.02] blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative">
        <div className="mb-12 text-center">
           <h2 className="text-sm font-mono text-secondary uppercase tracking-widest mb-3">Execution Surfaces</h2>
           <p className="text-primary/80 font-medium">Deploy anywhere your code lives.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SURFACES.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx}
                className="group flex flex-col p-6 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300"
              >
                <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center mb-4 text-secondary group-hover:text-primary transition-colors">
                  <Icon size={16} />
                </div>
                
                <h3 className="text-primary font-mono text-sm mb-2">{item.label}</h3>
                <p className="text-sm text-secondary leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
