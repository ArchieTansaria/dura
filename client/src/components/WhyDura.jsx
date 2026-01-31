import { ShieldAlert, GitPullRequest, Zap } from 'lucide-react';

const FEATURES = [
  {
    icon: ShieldAlert,
    title: "Breaking Change Detection",
    description: "Identifies risky updates by analyzing changelogs and code signatures."
  },
  {
    icon: GitPullRequest,
    title: "Zero-Config CI/CD",
    description: "Plug into GitHub Actions or GitLab CI with a single binary."
  },
  {
    icon: Zap,
    title: "Blazing Fast Analysis",
    description: "Written in Rust for instant feedback on massive dependency graphs."
  }
];

export function WhyDura() {
  return (
    <section className="py-16 border-t border-subtle/30">
      <div className="max-w-5xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          {FEATURES.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div key={idx} className="p-6 rounded-lg bg-surface/50 border border-transparent hover:border-subtle transition-colors">
                <div className="w-10 h-10 rounded-lg bg-subtle/50 flex items-center justify-center mb-4 text-accent">
                  <Icon size={20} />
                </div>
                <h3 className="text-lg font-medium text-primary mb-2">{feature.title}</h3>
                <p className="text-sm text-secondary leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
