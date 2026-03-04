import { InteractiveSelector } from './InteractiveSelector';

export function Hero() {
  return (
    
    <section className="pt-32 pb-16 px-4 md:pt-40 md:pb-24 relative z-20">
      <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
        
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.02] text-xs font-mono text-secondary mb-6">
          <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          Dependency Scanning...
        </div>

        {/* <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-primary mb-6 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <span>Analyze risk</span>
          <span className="text-accent flex items-center gap-2">
            <span className="text-secondary/50 font-display font-semibold">&gt;</span> before prod
          </span>
        </h1> */}

        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-primary mb-6">
          Analyze <span className='font-display font-medium italic'><span className='bg-gradient-to-r from-amber-500 via-amber-500/80 to-amber-500 bg-clip-text text-transparent'>dependency</span> update risk</span> <br className="hidden md:block"/>
          before it breaks prod.
        </h1>
        
        <p className="text-lg md:text-xl text-secondary max-w-2xl mx-auto mb-4 leading-relaxed font-light">
          Finding breaking changes shouldn't be a guessing game. Run deep analysis across your entire dependency tree.
        </p>
        
        <InteractiveSelector />
      </div>
    </section>
  );
}
