import Typewriter from './typewriter';

export function ExecutionSurfaces() {
  return (
    <section className="py-16 lg:py-36 px-4 w-full relative bg-[#050505] flex flex-col items-center justify-center overflow-hidden">
       {/* Subtle background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-full bg-accent/[0.015] blur-[100px] pointer-events-none" />

      <div className="max-w-7xl w-full mx-auto relative px-4 flex flex-col items-center">
        
        <div className="w-full max-w-4xl mx-auto relative">
          {/* Corner Crosshairs */}
          <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 text-white/30 font-mono text-lg font-light leading-none select-none z-10">+</div>
          <div className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 text-white/30 font-mono text-lg font-light leading-none select-none z-10">+</div>
          <div className="absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2 text-white/30 font-mono text-lg font-light leading-none select-none z-10">+</div>
          <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 text-white/30 font-mono text-lg font-light leading-none select-none z-10">+</div>
          
          {/* Center dashed line */}
          <div className="absolute top-0 bottom-0 left-1/2 border-l border-white/[0.05] border-dashed pointer-events-none -translate-x-1/2 hidden md:block z-10" />

          <div className="w-full bg-[#0a0a0a]/80 backdrop-blur-sm p-8 md:px-16 md:py-28 flex flex-col items-center">
            
            {/* Corner-clipped borders */}
            <div className="absolute top-0 left-2.5 right-2.5 h-px bg-white/10 pointer-events-none" />
            <div className="absolute bottom-0 left-2.5 right-2.5 h-px bg-white/10 pointer-events-none" />
            <div className="absolute top-2.5 bottom-2.5 left-0 w-px bg-white/10 pointer-events-none" />
            <div className="absolute top-2.5 bottom-2.5 right-0 w-px bg-white/10 pointer-events-none" />

            <h2 className="text-sm font-mono text-amber-500 uppercase tracking-[0.2em] mb-4 text-center z-10">
              Execution Surfaces
            </h2>
          
            <div className="flex flex-col lg:flex-row flex-wrap items-center justify-center w-full text-[32px] sm:text-[42px] md:text-[52px] lg:text-[48px] font-bold tracking-tight leading-tight mt-2 gap-x-4 lg:gap-x-5 gap-y-2">
              <div className="flex items-center justify-center">
                <span className="text-white whitespace-nowrap">Use dura via</span>
                <span className="text-gray-500 font-bitcount font-medium ml-3 lg:ml-5">{'>'}</span>
              </div>

              <Typewriter
                text={[
                  "GitHub App",
                  "Terminal",
                  "MCP Server",
                  "Apify Actor"
                ]}
                speed={90}
                className="text-amber-500 font-mono -ml-2"
                waitTime={1600}
                deleteSpeed={60}
                cursorChar={"|"}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
