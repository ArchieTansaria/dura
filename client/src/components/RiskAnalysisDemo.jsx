import { useState, useEffect, useRef } from "react";
import { AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { motion, useInView } from "motion/react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs) => twMerge(clsx(inputs));

const DEPENDENCIES = [
  {
    name: "ioredis",
    update: "4.18.2 → 5.0.0",
    risk: "HIGH",
    signal: "Breaking middleware signature",
    riskColor: "text-red-400",
    riskBg: "bg-red-500/10 border-red-500/20",
    hoverShadow: "group-hover:shadow-[0_0_8px_rgba(255,80,80,0.4)]",
  },
  {
    name: "react",
    update: "18.2.0 → 19.0.0",
    risk: "MEDIUM",
    signal: "Legacy lifecycle methods removed",
    riskColor: "text-amber-400",
    riskBg: "bg-amber-500/10 border-amber-500/20",
    hoverShadow: "group-hover:shadow-[0_0_8px_rgba(255,200,0,0.35)]",
  },
  {
    name: "eslint",
    update: "8.56.0 → 9.0.0",
    risk: "MEDIUM",
    signal: "Flat config format required",
    riskColor: "text-amber-400",
    riskBg: "bg-amber-500/10 border-amber-500/20",
    hoverShadow: "group-hover:shadow-[0_0_8px_rgba(255,200,0,0.35)]",
  },
  {
    name: "lodash",
    update: "4.17.21 → 4.18.0",
    risk: "LOW",
    signal: "No breaking changes found",
    riskColor: "text-emerald-400",
    riskBg: "bg-emerald-500/10 border-emerald-500/20",
    hoverShadow: "group-hover:shadow-[0_0_8px_rgba(0,255,160,0.35)]",
  },
];

const TypewriterText = ({ text }) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    setDisplayedText("");
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, 25);
    return () => clearInterval(interval);
  }, [text]);

  return <span>{displayedText}</span>;
};

export function RiskAnalysisDemo() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });
  const [typingStep, setTypingStep] = useState(0);

  useEffect(() => {
    if (isInView) {
      const timers = [
        setTimeout(() => setTypingStep(1), 1000),
        setTimeout(() => setTypingStep(2), 2000),
        setTimeout(() => setTypingStep(3), 3000),
      ];
      return () => timers.forEach(clearTimeout);
    }
  }, [isInView]);

  return (
    <section className="w-full max-w-7xl mx-auto px-4 pt-24 pb-32 relative z-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Left Side: Copy & Checklist */}
        <div className="lg:col-span-5 flex flex-col">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-primary mb-6">
            Not just version diffs. <br className="hidden lg:block mt-2" />
            <span className="text-primary"><span className="font-display italic">Real</span> breaking change <span className="font-display italic ">detection.</span></span>
          </h2>
          <p className="text-secondary text-lg mb-8 leading-relaxed font-light">
            Dura analyzes release notes, changelogs, and dependency graphs to
            detect real upgrade risks before they break production.
          </p>

          <ul className="space-y-4 font-mono text-sm text-secondary/80">
            <li className="flex items-center gap-3">
              <CheckCircle2 size={18} className="text-emerald-500" />
              <span>release notes analysis</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 size={18} className="text-emerald-500" />
              <span>changelog parsing</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 size={18} className="text-emerald-500" />
              <span>dependency graph impact</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle2 size={18} className="text-emerald-500" />
              <span className="font-medium tracking-tight">
                real breaking change detection
              </span>
            </li>
          </ul>
        </div>

        {/* Right Side: Demo UI */}
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="lg:col-span-7 relative group/demoui mt-10 rounded-xl border border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.6)] hover:shadow-[0_0_40px_rgba(245,158,11,0.12)] hover:border-white/[0.15] transition-all duration-500 w-full"
        >
          {/* Top inset glassy glare line */}
          <div/>
          
          {/* Ambient Glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent opacity-50 z-0 pointer-events-none" />
          {/* Header - mimic terminal or tool header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
            </div>
            <div className="text-[10px] font-mono text-secondary uppercase tracking-widest opacity-60">
              Analysis Output
            </div>
          </div>

          {/* Column Labels */}
          <div className="flex items-center px-4 py-2 border-b border-white/[0.03] bg-white/[0.01] text-[10px] font-mono text-secondary/50 uppercase tracking-wider">
            <div className="w-32 shrink-0">Package</div>
            <div className="w-48 shrink-0">Version Change</div>
            <div className="flex-grow">Breaking Change</div>
            <div className="w-16 text-right">Risk</div>
          </div>

          {/* Content Table */}
          <div className="font-mono text-xs md:text-sm relative overflow-hidden">
            {/* Horizontal Scan Line Animation */}
            {isInView && (
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 1.5, ease: "linear" }}
                className="absolute top-0 bottom-0 w-full bg-gradient-to-r from-transparent via-cyan-100/10 to-transparent blur-[1px] z-20 pointer-events-none"
              />
            )}

            {DEPENDENCIES.map((dep, idx) => {
              const rowDelay = 1.5 + idx * 0.3;

              return (
              <motion.div
                key={dep.name}
                initial={{ opacity: 0.4 }}
                animate={isInView ? { opacity: 1 } : { opacity: 0.4 }}
                transition={{ duration: 0.3, delay: rowDelay }}
                className={cn(
                  "group relative flex flex-col md:flex-row md:items-center py-3 px-4 border-b border-white/[0.03] last:border-0 hover:bg-white/[0.05] transition-colors duration-150 overflow-hidden",
                )}
              >
                {/* Row Pulse Highlight */}
                {isInView && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 0.4, delay: rowDelay, ease: "easeInOut" }}
                    className="absolute inset-0 bg-white/[0.04] z-0 pointer-events-none"
                  />
                )}

                <div className="w-32 shrink-0 font-medium text-primary mb-1 md:mb-0 relative z-10">
                  {dep.name}
                </div>

                <div className="flex items-center gap-2 w-48 shrink-0 text-secondary mb-2 md:mb-0 relative z-10">
                  <span>{dep.update.split("→")[0].trim()}</span>
                  <ArrowRight size={12} className="opacity-40" />
                  <span className="text-primary/90">
                    {dep.update.split("→")[1].trim()}
                  </span>
                </div>

                <div className="flex-grow flex items-center justify-between gap-4 relative z-10">
                  <span className="text-secondary opacity-70">
                    {dep.signal}
                  </span>

                  {/* Animated Risk Badge */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : { opacity: 0 }}
                    transition={{ duration: 0.25, delay: rowDelay }}
                    className={cn(
                      "w-16 flex justify-center py-0.5 rounded text-[10px] font-bold tracking-wider border transition-shadow duration-150",
                      dep.riskBg,
                      dep.riskColor,
                      dep.hoverShadow
                    )}
                  >
                    {dep.risk}
                  </motion.div>
                </div>
              </motion.div>
            )})}
          </div>

          {/* Footer Status */}
          <div className="px-4 py-3 bg-white/[0.02] border-t border-white/5 flex justify-between items-center text-[10px] text-secondary font-mono h-10 relative z-30">
            <div className="flex-1 text-secondary/70">
              {typingStep === 0 && <TypewriterText text="Scanning dependencies..." />}
              {typingStep === 1 && <TypewriterText text="Analyzing release notes..." />}
              {typingStep === 2 && <TypewriterText text="Detecting breaking changes..." />}
              {typingStep === 3 && <span>Scan complete in 20s</span>}
            </div>
            
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: typingStep === 3 ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              className="text-emerald-500 flex items-center gap-1"
            >
              <CheckCircle2 size={10} />
              Verification Ready
            </motion.span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
