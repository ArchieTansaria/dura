import { useState, useEffect } from 'react';
import { InteractiveSelector } from './InteractiveSelector';
import { cn } from '../utils/utils';

const PILL_TEXTS = [
  "Scanning Dependencies...",
  "Found Breaking Changes...",
  "Analyzing Risk..."
];

export function Hero() {
  const [textIndex, setTextIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const animationFrame = requestAnimationFrame(() => {
      setIsVisible(true);
    });

    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setTextIndex((prev) => (prev + 1) % PILL_TEXTS.length);
        setIsFading(false);
      }, 300);
    }, 3000);

    return () => {
      cancelAnimationFrame(animationFrame);
      clearInterval(interval);
    };
  }, []);

  return (
    
    <section className="pt-32 pb-14 px-4 md:pt-40 md:pb-24 relative z-20">
      <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
        
        <div 
          className={cn(
            "inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.02] text-xs font-mono text-secondary mb-5 -mt-2 transition-all duration-700 overflow-hidden",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
          style={{ perspective: "1000px" }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          <div className="relative h-4 w-48 flex items-center justify-start overflow-hidden">
            <span className={cn(
              "absolute inset-0 transition-all duration-500 ease-in-out transform-gpu",
              isFading 
                ? "opacity-0 -rotate-x-90 translate-y-2" 
                : "opacity-100 rotate-x-0 translate-y-0"
            )}>
              {PILL_TEXTS[textIndex]}
            </span>
          </div>
        </div>

        {/* <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-primary mb-6 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <span>Analyze risk</span>
          <span className="text-accent flex items-center gap-2">
            <span className="text-secondary/50 font-display font-semibold">&gt;</span> before prod
          </span>
        </h1> */}

        <h1 className={cn(
          "text-4xl md:text-6xl font-bold tracking-tight text-primary mb-4 mt-2 transition-all duration-1000 delay-200",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}>
          Analyze <span className='font-display font-medium italic'><span className='bg-gradient-to-r from-amber-500 via-amber-500/80 to-amber-500 bg-clip-text text-transparent'>dependency</span> update risk</span> <br className="hidden md:block"/>
          before it breaks prod.
        </h1>
        
        <p className={cn(
          "text-lg md:text-xl text-secondary max-w-2xl mx-auto leading-relaxed font-light transition-all duration-1000 delay-500",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}>
          Finding breaking changes shouldn't be a guessing game. Run deep analysis across your entire dependency tree.
        </p>
        
        <div className={cn(
          "w-full transition-all duration-1000 delay-700",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
        )}>
          <InteractiveSelector />
        </div>
      </div>
    </section>
  );
}
