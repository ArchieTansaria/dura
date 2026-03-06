import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { RiskAnalysisDemo } from './components/RiskAnalysisDemo';
import { ExecutionSurfaces } from './components/ExecutionSurfaces';
import { HowItWorks } from './components/HowItWorks';
import { Philosophy } from './components/Philosophy';
import { Footer } from './components/Footer';
import { BackgroundRippleEffect } from './components/background-ripple-effect';
import { FeatureCards } from './components/FeatureCards';

function App() {
  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-accent/20 bg-background overflow-x-hidden">
      <Navbar />
      <main className="flex-grow flex flex-col items-center w-full relative">
        <BackgroundRippleEffect />
        <Hero />
        <section className="w-full relative z-20">
          {/* Seamless blend gradient */}
          <div className="absolute top-[-7rem] inset-x-0 bottom-0 bg-gradient-to-b from-transparent via-[#050505] via-[8rem] to-[#050505] border-b border-white/[0.08]" />
          
          <div className="relative z-10 w-full">
            <FeatureCards />
            <RiskAnalysisDemo />
          </div>
        </section>
        <ExecutionSurfaces />
        <HowItWorks />
        <Philosophy />
      </main>
      <Footer />
    </div>
  );
}

export default App;
