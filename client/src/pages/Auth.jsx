import { useState } from 'react';
import { Github } from 'lucide-react';
import { cn } from '../utils/utils';

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    setIsLoading(true);
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/login`;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row text-white font-sans selection:bg-amber-500/30">
      
      {/* LEFT SIDE - Branding */}
      <div className="relative hidden md:flex flex-1 flex-col justify-center px-12 lg:px-24 overflow-hidden border-r border-white/5 bg-black/20">
        
        {/* Abstract Background Effects */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-500/10 blur-[120px] rounded-full mix-blend-screen transition-opacity duration-1000" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-white/5 blur-[100px] rounded-full mix-blend-overlay" />
          
          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgMGg0MHY0MEgwVjB6bTM5IDM5VjFoLTM4djM4aDM4eiIgZmlsbD0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjAxKSIgZmlsbC1ydWxlPSJldmVub2RkIi8+PC9zdmc+')] mix-blend-overlay opacity-30" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-xl">
          <div className="inline-block px-3 py-1 mb-8 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
            <span className="font-mono text-xs font-medium tracking-wider text-amber-500/90 uppercase">
              dura authentication
            </span>
          </div>
          
          <h1 className="text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.1] mb-6 drop-shadow-sm">
            You're one click away from <span className="text-white/80 italic">better code.</span>
          </h1>
          
          <p className="text-lg text-white/50 leading-relaxed font-light max-w-lg">
            Connect your GitHub and start shipping with confidence.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE - Auth Card */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 relative bg-black/10">
        
        {/* Mobile Background Effects */}
        <div className="absolute inset-0 md:hidden bg-gradient-to-br from-background to-black pointer-events-none">
          <div className="absolute top-20 left-10 w-40 h-40 bg-amber-500/10 blur-[80px] rounded-full" />
        </div>

        <div className="relative z-10 w-full max-w-sm">
          
          {/* Card */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
            
            {/* Inner Top Glow */}
            <div className="absolute top-0 inset-x-0 h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            
            <div className="text-center mb-8">
              <h2 className="text-2xl font-semibold tracking-tight mb-2">Sign in to dura</h2>
              <p className="text-sm text-white/50">No password required</p>
            </div>

            <button
              onClick={handleLogin}
              disabled={isLoading}
              className={cn(
                "group relative w-full flex items-center justify-center gap-3 px-4 py-3.5",
                "bg-white/5 hover:bg-white/10 active:bg-white/5",
                "border border-white/10 hover:border-white/20",
                "rounded-xl font-medium tracking-wide transition-all duration-300 ease-out",
                "hover:-translate-y-0.5 shadow-sm hover:shadow-md hover:shadow-white/5 hover:shadow-amber-500/10",
                "disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              )}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white/90 rounded-full animate-spin" />
                  <span>Redirecting...</span>
                </>
              ) : (
                <>
                  <Github className="w-5 h-5 opacity-90 group-hover:opacity-100 transition-opacity duration-300" />
                  <span>Continue with GitHub</span>
                </>
              )}
              
              {/* Button Ambient Glow Overlay */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none mix-blend-overlay" />
            </button>
            
            {/* Footer Text */}
            <p className="mt-8 text-center text-xs text-white/40">
              New to dura?{" "}
              <span className="text-white/70 transition-colors duration-300">
                Create your account
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
