import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { RiskAnalysisDemo } from './components/RiskAnalysisDemo';
import { ExecutionSurfaces } from './components/ExecutionSurfaces';
import { HowItWorks } from './components/HowItWorks';
import { Philosophy } from './components/Philosophy';
import { Footer } from './components/Footer';

function App() {
  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-accent/20 bg-background overflow-x-hidden">
      <Navbar />
      <main className="flex-grow flex flex-col items-center w-full relative">
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
