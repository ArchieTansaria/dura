import { Terminal, Github, Bot } from 'lucide-react';

const SURFACES = [
  {
    label: "CLI",
    icon: Terminal,
    description: "Fast local analysis while reviewing dependency updates."
  },
  {
    label: "GitHub",
    icon: Github,
    description: "Continuous feedback directly inside pull requests."
  },
  {
    label: "MCP",
    icon: Bot,
    description: "Programmatic access for automation and autonomous systems."
  }
];

export function Workflows() {
  return (
    <section className="py-24 px-4 w-full border-t border-white/5">
      <div className="max-w-3xl mx-auto">
        <div className="mb-12 text-center md:text-left">
          <h2 className="text-sm font-mono text-center text-secondary mb-2 uppercase tracking-wider">Designed for developer workflows</h2>
          <p className="text-primary text-xl text-center font-medium">Same engine. Different surfaces.</p>
        </div>

        <div className="space-y-4">
          {SURFACES.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx}
                className="flex items-center justify-center text-center gap-6 p-4 rounded-lg border-l-2 border-transparent hover:border-accent hover:bg-white/[0.02] transition-colors group"
              >
                <div className="hidden md:flex w-24justify-center shrink-0 items-center gap-2 text-secondary font-mono text-sm group-hover:text-primary transition-colors">
                  <Icon size={16} />
                  <span>{item.label}</span>
                </div>
                
                {/* Mobile Label */}
                <div className="md:hidden flex flex-col gap-1 shrink-0">
                   <div className="flex items-center gap-2 text-primary font-mono text-sm">
                      <Icon size={16} />
                      <span>{item.label}</span>
                   </div>
                </div>

                <p className="text-secondary text-base justify-center group-hover:text-primary/90 transition-colors">
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
