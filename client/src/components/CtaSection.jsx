import { ArrowRight, Terminal, Github } from 'lucide-react';

export function CtaSection() {
  return (
    <section className="group relative w-full py-28 md:pt-31 md:py-48 px-4 flex flex-col items-center justify-center overflow-hidden border-y border-white/[0.07] bg-[#020202]">
      {/* Dynamic bottom elliptical glow */}
      <div className="absolute bottom-[-300px] left-1/2 -translate-x-1/2 w-[200%] md:w-[100%] h-[700px] bg-accent/20 blur-[100px] rounded-[100%] pointer-events-none opacity-10 transition-all duration-1000 ease-out group-hover:opacity-60 group-hover:bg-accent/30 group-hover:h-[750px] group-hover:bottom-[-350px]" />
      
      <div className="relative z-10 flex flex-col items-center max-w-3xl mx-auto text-center">
        <h2 className="text-[40px] md:text-[42px] font-bold tracking-tight text-white mb-6 leading-tight">
          Start analyzing dependency<br className="hidden md:block"/> updates today.
        </h2>
        
        <p className="text-lg md:text-xl text-secondary mb-10 max-w-2xl font-light">
          Detect breaking changes before dependency updates reach production.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          {/* Primary CTA */}
          <a
            href={`${import.meta.env.VITE_BACKEND_URL}/connect/github`}
            className="group relative flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-white text-black font-semibold rounded-full hover:-translate-y-0.5 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
          >
            <Github size={18} />
            <span className="text-[13px]">Install GitHub App</span>
          </a>
          
          {/* Secondary CTA */}
          <a
            href="https://www.npmjs.com/package/dura-kit"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 text-white font-medium rounded-full hover:bg-white/10 hover:-translate-y-0.5 transition-all duration-300"
          >
            <Terminal size={16} className="text-secondary group-hover:text-white transition-colors" />
            <span className="text-[13px]">Run via CLI</span>
            <ArrowRight size={16} className="ml-1 text-secondary group-hover:text-white group-hover:translate-x-1 transition-all" />
          </a>
        </div>
      </div>
    </section>
  );
}
