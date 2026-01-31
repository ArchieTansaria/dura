import { FileText, Activity, BarChart3 } from 'lucide-react';

const STEPS = [
  {
    icon: FileText,
    title: "Reads real release notes",
    description: "Analyzes actual changelogs and release text, not just version numbers."
  },
  {
    icon: Activity,
    title: "Detects breaking signals",
    description: "Identifies explicit and implicit breaking indicators across dependencies."
  },
  {
    icon: BarChart3,
    title: "Scores update risk",
    description: "Combines semantic versioning with real-world signals to produce a risk score."
  }
];

export function HowItWorks() {
  return (
    <section className="py-24 px-4 w-full">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-sm font-mono text-center text-secondary mb-8 uppercase tracking-wider">How dura works</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div 
                key={idx} 
                className="group p-6 rounded-xl backdrop-blur-sm bg-white/[0.02] border border-white/5 shadow-lg hover:bg-white/[0.04] transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mb-5 text-secondary group-hover:text-primary transition-colors">
                  <Icon size={20} strokeWidth={1.5} />
                </div>
                <h3 className="text-base font-medium text-primary mb-2">{step.title}</h3>
                <p className="text-sm text-secondary leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
