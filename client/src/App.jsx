import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { RiskAnalysisDemo } from './components/RiskAnalysisDemo';
import { ExecutionSurfaces } from './components/ExecutionSurfaces';
import { HowItWorks } from './components/HowItWorks';
import { Philosophy } from './components/Philosophy';
import { Footer } from './components/Footer';
import { BackgroundRippleEffect } from './components/background-ripple-effect';

function App() {
  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-accent/20 bg-background overflow-x-hidden">
      <Navbar />
      <main className="flex-grow flex flex-col items-center w-full relative">
        <BackgroundRippleEffect />
        <Hero />
        <RiskAnalysisDemo />
        <ExecutionSurfaces />
        <HowItWorks />
        <Philosophy />
      </main>
      <Footer />
    </div>
  );
}

export default App;
