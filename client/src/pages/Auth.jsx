import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Github, ChevronLeft } from 'lucide-react';
import { cn } from '../utils/utils';
import { Logo } from '../components/Logo';

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    setIsLoading(true);
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/login`;
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 sm:p-8 relative selection:bg-amber-500/30">
      
      {/* Background ambient glow for the whole page */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-amber-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="flex flex-col md:flex-row w-full max-w-[1000px] min-h-[600px] bg-[#0c0c0c] rounded-2xl overflow-hidden border border-white/[0.08] shadow-[0_0_80px_-20px_rgba(0,0,0,1)] relative z-10">
        
        {/* LEFT SIDE - Branding */}
        <div className="relative w-full md:w-1/2 p-10 flex flex-col justify-between bg-black overflow-hidden border-r border-white/[0.04]">
          
          {/* Layer 1: Colored base shapes */}
          <div className="w-[22rem] h-[18rem] bg-amber-500 absolute z-[1] rounded-full -bottom-10 -left-2"></div>
          <div className="w-[18rem] h-[4rem] bg-white absolute z-[1] rounded-full bottom-11 left-40"></div>
          <div className="w-[8rem] h-[3rem] bg-white absolute z-[1] rounded-full bottom-0 right-0"></div>

          {/* Layer 2: Backdrop blur strips to create curtain effect */}
          <div className="flex absolute inset-0 z-[2] overflow-hidden backdrop-blur-2xl w-full h-full pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-full flex-1 bg-gradient-to-r from-transparent via-[#000000] via-[69%] to-[#ffffff30] opacity-30 overflow-hidden"></div>
            ))}
          </div>

          {/* Layer 3: Fade to black towards the top */}
          <div className="w-full h-full z-[3] absolute inset-0 bg-gradient-to-t from-transparent to-black pointer-events-none"></div>

          {/* Top Text */}
          <div className="relative z-[10] mt-4">
            <h1 className="text-[30px] font-bold tracking-tight leading-[1.2] text-white/90">
              You're one click away from better code.
            </h1>
          </div>
          
          {/* <div className="relative z-[10] hidden md:block mt-auto text-white/20 font-mono text-[10px] tracking-widest uppercase">
            dura authentication
          </div> */}
        </div>

        {/* RIGHT SIDE - Auth Content */}
        <div className="w-full md:w-1/2 p-10 lg:p-14 flex flex-col justify-center relative bg-[#0c0c0c]">
          
          {/* Back to Home Button */}
          <Link 
            to="/" 
            className="absolute top-8 left-8 lg:top-10 lg:left-13 flex items-center gap-0.5 text-white/50 hover:text-white transition-colors z-20 group"
          >
            <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
            <span className="text-[15px] font-medium tracking-wide">Home</span>
          </Link>

          <div className="max-w-[340px] w-full mx-auto relative z-10">
            {/* Header matching image style */}
            <div className="mb-8">
              <Logo className="w-8 h-8 text-accent mb-6" />
              <h2 className="text-2xl font-semibold tracking-tight text-white/95 mb-2">Get Started</h2>
              <p className="text-[14px] text-white/50 leading-relaxed">
                Welcome to dura :) Connect your GitHub and start shipping with confidence.
              </p>
            </div>

            {/* Action Area */}
            <div className="space-y-6">
              <button
                onClick={handleLogin}
                disabled={isLoading}
                className={cn(
                  "group relative w-full flex items-center justify-center gap-3 px-4 py-3",
                  "bg-amber-500/5 text-amber-500/90 font-medium",
                  "rounded-xl transition-all border border-amber-500/20",
                  "hover:bg-amber-500/15 hover:border-amber-500/40 hover:text-amber-400",
                  "hover:-translate-y-0.5 shadow-sm hover:shadow-md hover:shadow-amber-500/10",
                  "disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                )}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Redirecting...</span>
                  </>
                ) : (
                  <>
                    <Github className="w-5 h-5 opacity-90 group-hover:opacity-100 transition-opacity" />
                    <span>Continue with GitHub</span>
                  </>
                )}
              </button>

              {/* Login hint / footer */}
              <p className="text-center text-[13px] text-white/40 pt-4">
                New to dura?{" "}
                <button 
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="text-white/80 hover:text-white transition-colors cursor-pointer border-b border-white/20 hover:border-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create an account
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
