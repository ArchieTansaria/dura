import { useState, useEffect, useRef } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence, useMotionValue, useMotionTemplate, useSpring, useTransform } from 'motion/react';
import { Github, GitPullRequest, Search, AlertTriangle, ArrowRight, CornerDownRight, Zap } from 'lucide-react';
import { Logo } from './Logo';
import { cn } from '../utils/utils';

export function FeatureCards() {
  return (
    <div className="w-full relative z-20">
      <div className="relative z-10 pt-20 pb-20 px-4 w-full max-w-7xl mx-auto -mt-2">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-primary mb-4">
            Ship fast. Break <span className='text-accent'>nothing.</span>
          </h2>
          <p className="text-secondary text-lg max-w-2xl mx-auto font-light">
            Stop guessing and manually handling dependency updates.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start relative pb-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
            className="w-full"
          >
            <ScannerCard />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
            className="w-full"
          >
            <BreakingChangesCard />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, delay: 0.5, ease: "easeOut" }}
            className="w-full"
          >
            <AutomateCard />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function CardBase({ number, title, description, children, className }) {
  const cardRef = useRef(null);
  let mouseX = useMotionValue(typeof window !== 'undefined' ? window.innerWidth / 2 : 500);
  let mouseY = useMotionValue(typeof window !== 'undefined' ? window.innerHeight / 2 : 500);
  let localX = useMotionValue(200);
  let localY = useMotionValue(240);

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      
      if (cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        localX.set(e.clientX - rect.left);
        localY.set(e.clientY - rect.top);
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY, localX, localY]);

  const springConfig = { damping: 20, stiffness: 100, mass: 0.5 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);
  const springLocalX = useSpring(localX, springConfig);
  const springLocalY = useSpring(localY, springConfig);

  const normX = useTransform(springX, [0, typeof window !== 'undefined' ? window.innerWidth : 1000], [-1, 1]);
  const normY = useTransform(springY, [0, typeof window !== 'undefined' ? window.innerHeight : 1000], [-1, 1]);

  const rotateX = useTransform(normY, [-1, 1], [4, -4]);
  const rotateY = useTransform(normX, [-1, 1], [-4, 4]);

  const xLayer1 = useTransform(normX, [-1, 1], [-3, 3]);
  const yLayer1 = useTransform(normY, [-1, 1], [-3, 3]);

  const xLayer2 = useTransform(normX, [-1, 1], [-8, 8]);
  const yLayer2 = useTransform(normY, [-1, 1], [-8, 8]);

  const xLayer3 = useTransform(normX, [-1, 1], [-14, 14]);
  const yLayer3 = useTransform(normY, [-1, 1], [-14, 14]);

  return (
    <div ref={cardRef} style={{ perspective: "1000px" }} className={cn("relative h-[480px] w-full", className)}>
      <motion.div 
        whileHover={{ y: -5 }}
        style={{ rotateX, rotateY }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className={cn(
          "relative rounded-2xl bg-[#0a0a0a]/80 backdrop-blur-md border border-white/[0.08] overflow-hidden flex flex-col h-full group w-full",
          "shadow-[0_8px_30px_rgb(0,0,0,0.4)] hover:shadow-[0_20px_40px_rgba(245,158,11,0.04)] hover:border-white/[0.12] transition-colors duration-500 hover:bg-[#0c0c0c]/90"
        )}
      >
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50 z-20" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent opacity-50 z-0 pointer-events-none" />
        
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-2xl opacity-100 z-0"
          style={{
            background: useMotionTemplate`
              radial-gradient(
                400px circle at ${springLocalX}px ${springLocalY}px,
                rgba(255, 255, 255, 0.08),
                transparent 80%
              )
            `,
          }}
        />
        
        <div className="p-6 md:p-8 flex flex-col grow h-full relative z-10">
          <motion.div style={{ x: xLayer1, y: yLayer1 }} className="text-amber-500 font-mono text-sm font-bold mb-4 tracking-wider opacity-90 w-fit">
             {number}
          </motion.div>
          
          <motion.div style={{ x: xLayer2, y: yLayer2 }}>
            <h3 className="text-primary text-xl font-medium mb-3 flex items-center w-fit">
               {title}  
               <ArrowRight className="w-5 h-5 ml-1 transition-all duration-300 ease-out opacity-0 -translate-x-3 group-hover:translate-x-1 group-hover:opacity-100 group-hover:text-amber-500" />
            </h3>
            <p className="text-secondary/70 text-base leading-relaxed mb-8 max-w-[95%]">
              {description}
            </p>
          </motion.div>

          <motion.div 
            style={{ x: xLayer3, y: yLayer3 }}
            className="mt-auto relative rounded-xl border border-white/5 bg-[#0a0a0a] shadow-[0_8px_30px_rgb(0,0,0,0.4)] h-[220px] shrink-0 overflow-hidden flex flex-col items-center"
          >
            <div className="relative z-10 h-full w-full">
              {children}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

function ScannerCard() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    let timer;
    const cycle = () => {
      setPhase(1); // Moving scroll & scanner
      timer = setTimeout(() => {
        setPhase(2); // Warning active on express
        timer = setTimeout(() => {
          setPhase(0); // Reset immediately visually
          timer = setTimeout(cycle, 1500); 
        }, 4000); 
      }, 2000); 
    };
    timer = setTimeout(cycle, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <CardBase 
      number="01" 
      title="Detect risky updates" 
      description="Scan repositories and map the entire dependency tree before upgrading packages." 
    >
      <div className="relative h-full w-[120%] -ml-[10%] flex items-center justify-start xl:ml-2">
        {/* Repo Icon */}
        <div className="z-10 shrink-0 border border-white/5 rounded-lg bg-black/80 p-3 relative ml-4">
          <Github className="w-6 h-6 text-primary" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-[100%] w-6 h-[1px] bg-white/[0.15]" />
        </div>

        {/* Scrolling list */}
        <div className="relative flex-1 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_80%,transparent)] pl-8 h-full flex flex-col justify-center">
           <motion.div 
             className="flex items-center gap-3 w-max"
             initial={{ x: 0 }}
             animate={{ x: phase >= 1 ? -140 : 0 }}
             transition={{ duration: 2, ease: "easeInOut" }}
           >
             <DepNode name="react" version="18.2.0" />
             <DepNode name="lodash" version="4.17.21" />
             <div className="relative">
                <DepNode name="ioredis" version="4.18.2" isWarning={phase >= 2} />
                <AnimatePresence>
                  {phase >= 2 && (
                    <motion.div 
                      key="warning"
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: 5 }}
                      className="absolute top-[110%] left-0 whitespace-nowrap bg-black/90 border border-red-500/30 rounded px-2 py-1.5 flex items-center gap-1.5 shadow-xl z-30"
                    >
                      <AlertTriangle className="w-3 h-3 text-red-400" />
                      <span className="text-[10px] text-red-400 font-medium">Breaking change detected</span>
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>
             <DepNode name="eslint" version="8.56.0" />
           </motion.div>

           {/* Scanner Line */}
           <motion.div 
             className="absolute top-1/4 bottom-1/4 w-[1px] bg-amber-500 shadow-[0_0_15px_2px_rgba(245,158,11,0.5)] z-20"
             initial={{ left: "-10%", opacity: 0 }}
             animate={{ 
               left: phase === 0 ? "-10%" : phase >= 1 ? "120%" : "-10%",
               opacity: phase >= 1 && phase < 2 ? 1 : 0
             }}
             transition={{ duration: phase === 0 ? 0.2 : 4, ease: "linear" }}
           />
        </div>
      </div>
    </CardBase>
  );
}

function DepNode({ name, version, isWarning }) {
  return (
    <div className={cn(
      "px-3 py-2 rounded border bg-[#141414] min-w-[120px] shadow-[0_4px_12px_rgba(0,0,0,0.8)] relative z-10",
      isWarning ? "border-red-500/30 bg-[#1f1010]" : "border-white/10"
    )}>
      <div className={cn("text-xs font-mono font-medium mb-1 transition-colors duration-500", isWarning ? "text-red-400" : "text-primary")}>
        {name}
      </div>
      <div className={cn("text-[10px] font-mono transition-colors duration-500 flex items-center gap-1.5", isWarning ? "text-red-400/80" : "text-secondary")}>
        <span className={isWarning ? "line-through opacity-50" : ""}>{version}</span> 
        {isWarning && <span className="text-red-400 tracking-tight">→ 5.0.0</span>}
      </div>
    </div>
  );
}

function BreakingChangesCard() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsOpen(p => !p);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <CardBase 
      number="02" 
      title="Analyze breaking changes" 
      description="Deep analysis identifies API changes, deprecations, and migration risks." 
    >
      <div className="h-full w-full flex items-start justify-center pt-8">
        
        <motion.div 
          layout
          className={cn(
             "w-[95%] max-w-[280px] bg-[#141414] border border-white/10 rounded-lg overflow-hidden transition-colors duration-700 shadow-[0_8px_24px_rgba(0,0,0,0.9)] relative z-10",
             isOpen ? "border-amber-500/30 bg-[#1c1810]" : ""
          )}
          style={{ originY: 0 }}
          transition={{ type: "spring", bounce: 0, duration: 0.6 }}
        >
          <motion.div layout className="p-3 flex items-center justify-between">
             <div className="flex flex-col gap-1 font-mono">
                <span className={cn("text-xs md:text-sm font-medium transition-colors duration-500", isOpen ? "text-amber-500" : "text-primary")}>ioredis</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-secondary opacity-60 text-[10px] md:text-xs">4.18.2</span>
                  <ArrowRight className="w-3 h-3 text-secondary opacity-40" />
                  <span className={cn("text-[10px] md:text-xs transition-colors duration-500", isOpen ? "text-primary/90" : "text-secondary")}>5.0.0</span>
                </div>
             </div>
             <motion.div 
               animate={{ rotate: isOpen ? 180 : 0, color: isOpen ? 'rgba(156,163,175, 1)' : 'rgba(156,163,175, 0.4)' }} 
               transition={{ duration: 0.5 }}
             >
               <CornerDownRight className="w-4 h-4" />
             </motion.div>
          </motion.div>

          {/* Expanded Content */}
          <AnimatePresence initial={false}>
            {isOpen && (
              <motion.div 
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4 }}
                className="overflow-hidden bg-[#161b22]/50"
              >
                <div className="px-3 pb-4 border-t border-white/5 pt-3 bg-black/40">
                  <div className="text-[10px] text-red-400 font-mono flex items-center gap-1.5 mb-3 px-1.5 py-0.5 rounded border border-red-500/20 bg-red-500/10 w-fit">
                    Breaking changes detected
                  </div>
                  
                  <ul className="space-y-3">
                    {[
                      'middleware signature updated', 
                      'router behavior changed', 
                      'deprecated APIs removed'
                    ].map((item, i) => (
                      <motion.li 
                        key={item}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ delay: 0.1 + (i * 0.1), duration: 0.3 }}
                        className="flex items-start gap-2 text-[10px] text-secondary font-mono"
                      >
                        <span className="text-amber-500 opacity-60">→</span>
                        {item}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

      </div>
    </CardBase>
  );
}

function AutomateCard() {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    let timer;
    const cycle = () => {
      setStage(1); 
      timer = setTimeout(() => {
        setStage(2); 
        timer = setTimeout(() => {
          setStage(3);
          timer = setTimeout(() => {
            setStage(0); 
            timer = setTimeout(cycle, 1500);
          }, 3500);
        }, 800);
      }, 800);
    };
    timer = setTimeout(cycle, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <CardBase 
      number="03" 
      title="Automate analysis" 
      description="Automatically analyze dependency updates on every pull request." 
    >
      <div className="h-full w-full flex justify-center py-2 mt-3 relative overflow-hidden">
         <div className="flex flex-col items-center gap-0 max-w-[220px] w-full absolute top-2 z-10">
         
           {/* Step 1: PR Card */}
           <motion.div 
             animate={{ 
               borderColor: stage === 1 ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.1)",
               backgroundColor: stage === 1 ? "rgba(30,30,30,1)" : "rgba(20,20,20,1)",
               boxShadow: stage === 1 ? "0 8px 24px rgba(0,0,0,0.9)" : "0 4px 12px rgba(0,0,0,0.6)"
             }}
             transition={{ duration: 0.5 }}
             className="w-full border rounded-md p-2 flex items-start gap-2 z-20 shadow-xl"
           >
             <GitPullRequest className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
             <div className="flex flex-col gap-0.5 w-full">
               <span className="text-primary text-[11px] font-mono leading-none">pull_request #8604</span>
               <span className="text-secondary text-[10px] font-mono leading-none opacity-60">react 18 → 19</span>
             </div>
           </motion.div>

           {/* Arrow 1 */}
           <div className="h-5 border-l border-dashed border-white/20 relative z-10 w-px">
             <motion.div 
               initial={{ y: -16, opacity: 0 }}
               animate={{ 
                   y: stage === 1 ? 20 : -16, 
                   opacity: stage === 1 ? [0, 1, 1, 0] : 0 
               }}
               transition={{ duration: 0.8, ease: "linear" }}
               className="absolute top-0 -left-[1.5px] w-[2px] h-4 rounded-full bg-amber-400 shadow-[0_0_8px_1px_rgba(245,158,11,0.8)]"
             />
           </div>

           {/* Step 2: Webhook Card */}
           <div className="relative w-full max-w-[140px] z-20">
             <motion.div 
               animate={{
                  borderColor: stage >= 2 ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.1)",
                  backgroundColor: stage >= 2 ? "rgba(30,30,30,1)" : "rgba(20,20,20,1)",
                  boxShadow: stage >= 2 ? "0 8px 24px rgba(0,0,0,0.9)" : "0 4px 12px rgba(0,0,0,0.6)"
               }}
               transition={{ duration: 0.3 }}
               className="w-full border rounded-md p-2 flex items-center gap-2 z-20 justify-center shadow-xl relative"
             >
               <motion.div
                 animate={{ color: stage >= 2 ? "rgba(251,191,36,1)" : "rgba(251,191,36,0.4)" }}
               >
                 <Zap className={"w-3 h-3 shrink-0"} />
               </motion.div>
               <span className={cn("text-[10px] font-mono leading-none transition-colors duration-300", stage >= 2 ? "text-primary" : "text-secondary opacity-60")}>webhook sent</span>
             </motion.div>
             
             {/* Border tracing sweeps */}
             <svg className="absolute inset-0 w-full h-full pointer-events-none z-30" style={{ overflow: 'visible' }}>
               {stage >= 2 && (
                 <>
                   {/* Right sweep */}
                   <motion.rect
                     x="0" y="0" width="100%" height="100%" rx="6"
                     fill="none"
                     stroke="rgba(245,158,11,1)"
                     strokeWidth="2"
                     initial={{ pathLength: 0, pathOffset: 0.21 }}
                     animate={{ 
                       pathLength: stage === 2 ? [0, 0.5, 0] : 0, 
                       pathOffset: stage === 2 ? [0.21, 0.21, 0.71] : 0.71 
                     }}
                     transition={{ duration: 0.8, ease: "linear" }}
                     style={{ filter: 'drop-shadow(0 0 4px rgba(245,158,11,0.8))' }}
                   />
                   {/* Left sweep */}
                   <motion.rect
                     x="0" y="0" width="100%" height="100%" rx="6"
                     fill="none"
                     stroke="rgba(245,158,11,1)"
                     strokeWidth="2"
                     initial={{ pathLength: 0, pathOffset: 0.21 }}
                     animate={{ 
                       pathLength: stage === 2 ? [0, 0.5, 0] : 0, 
                       pathOffset: stage === 2 ? [0.21, -0.29, -0.29] : -0.29 
                     }}
                     transition={{ duration: 0.8, ease: "linear" }}
                     style={{ filter: 'drop-shadow(0 0 4px rgba(245,158,11,0.8))' }}
                   />
                 </>
               )}
             </svg>
           </div>

           {/* Arrow 2 */}
           <div className="h-5 border-l border-dashed border-white/20 relative z-10 w-px">
             <motion.div 
               initial={{ y: -16, opacity: 0 }}
               animate={{ 
                   y: stage === 3 ? 20 : -16, 
                   opacity: stage === 3 ? [0, 1, 1, 0] : 0 
               }}
               transition={{ duration: 0.8, ease: "linear" }}
               className="absolute top-0 -left-[1.5px] w-[2px] h-4 rounded-full bg-indigo-400 shadow-[0_0_8px_1px_rgba(99,102,241,0.8)]"
             />
           </div>

           {/* Step 3: Bot Comment Card */}
           <motion.div 
             initial={{ opacity: 0, y: 10 }}
             animate={{ 
               opacity: stage >= 3 ? 1 : 0, 
               y: stage >= 3 ? 0 : 10
             }}
             transition={{ duration: 0.4, delay: stage === 3 ? 0.8 : 0 }}
             className="w-full bg-[#141414] border border-white/10 rounded-md p-1.5 flex flex-col gap-1.5 z-20 relative overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.9)]"
           >
             <div className="flex items-center gap-2">
               <div className="w-5 h-5 rounded bg-white/[0.05] border border-white/10 flex items-center justify-center p-0.5">
                 <Logo size={12} />
               </div>
               <span className="text-secondary opacity-80 text-[10px] font-mono mt-px flex items-center h-full">dura bot</span>
             </div>
             
             <motion.div 
               animate={stage === 3 ? {
                 borderColor: "rgba(248,113,113,0.3)",
                 backgroundColor: "rgba(248,113,113,0.1)"
               } : {
                 borderColor: "rgba(255,255,255,0.05)",
                 backgroundColor: "rgba(255,255,255,0.02)"
               }}
               transition={{ duration: 1.5, delay: stage === 3 ? 0.8 : 0 }}
               className="border rounded px-1.5 py-1 flex flex-col ml-6 relative"
             >
               <div className="flex items-center text-red-400 relative z-10 font-mono">
                  <span className="text-[8.5px] font-bold">HIGH RISK DETECTED</span>
               </div>
               <span className="text-secondary text-[8.5px] font-mono relative z-10 leading-snug mt-0.5">Breaking lifecycle changes.</span>
             </motion.div>
           </motion.div>
         </div>
      </div>
    </CardBase>
  );
}

