import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { RiskAnalysisDemo } from '../components/RiskAnalysisDemo';
import { ExecutionSurfaces } from '../components/ExecutionSurfaces';
import { Philosophy } from '../components/Philosophy';
import { CtaSection } from '../components/CtaSection';
import { Footer } from '../components/Footer';
import { BackgroundRippleEffect } from '../components/background-ripple-effect';
import { FeatureCards } from '../components/FeatureCards';

export function Home() {
  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-accent/20 bg-background overflow-x-hidden">
      <Navbar />
      <main className="flex-grow flex flex-col items-center w-full relative">
        <BackgroundRippleEffect />
        <Hero />
        <section className="w-full relative z-20">
          {/* Seamless blend gradient */}
          <div className="absolute top-[-6rem] inset-0 bottom-0 bg-gradient-to-b from-transparent via-[#050505] via-[8rem] to-[#050505]" />
          
          <div className="relative z-10 w-full">
            <RiskAnalysisDemo />
          </div>
        </section>

        <section id="features" className="w-full relative z-20 bg-[#0000004d] border-t border-white/[0.08]">
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
          <div className="relative z-10 w-full pt-28">
            <FeatureCards />
          </div>
        </section>
        <ExecutionSurfaces />
        <CtaSection />
        <Philosophy />
      </main>
      <Footer />
    </div>
  );
}
