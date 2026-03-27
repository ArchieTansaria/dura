import { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Monitor, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '../utils/utils';

export function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const dropdownRef = useRef(null);
  
  // Conditionally use auth to avoid crash if provider is missing.
  // We assume AuthProvider does wrap the router where this is used.
  let user = null;
  try {
    const auth = useAuth();
    user = auth?.user;
  } catch (e) {
    console.warn("AuthContext not found, using dummy data", e);
  }

  const displayName = user?.githubName || user?.githubLogin || 'ArchieTansaria';
  const role = 'Admin';
  // mock initial
  const initials = 'AT';
  
  // Use DB avatar, fallback to the github direct PNG via their username if session is older than the avatarUrl DB field addition
  const avatarUrl = user?.avatarUrl || user?.avatar_url || (user?.githubLogin ? `https://github.com/${user.githubLogin}.png` : null);

  // Handle clicking outside to close the dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-1.5 p-1 pr-2 rounded-full border transition-all",
          isOpen ? "bg-gray-100 border-gray-200 dark:bg-white/10 dark:border-white/10" : "border-transparent hover:bg-gray-100 hover:border-gray-200 dark:hover:bg-white/5 dark:hover:border-white/5"
        )}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt={displayName} className="w-7 h-7 rounded-full shadow-sm ring-1 ring-white/10 object-cover" />
        ) : (
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-accent to-amber-600/50 flex items-center justify-center text-[11px] font-bold text-white shadow-sm ring-1 ring-white/10">
            {initials}
          </div>
        )}
        <ChevronDown className={cn("w-3.5 h-3.5 text-gray-600 dark:text-white/50 transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      {/* Dropdown Menu */}
      <div
        className={cn(
          "absolute right-0 top-full mt-2 w-64 bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/50 z-50 transition-all duration-200 origin-top-right overflow-hidden",
          isOpen ? "opacity-100 scale-100 visible" : "opacity-0 scale-95 invisible pointer-events-none"
        )}
      >
        {/* User Info Section */}
        <div className="p-3.5 flex items-center gap-3 border-b border-gray-200 dark:border-white/5">
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} className="w-10 h-10 rounded-full shadow-sm ring-1 ring-black/5 dark:ring-white/10 object-cover shrink-0" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-accent to-amber-600/50 flex items-center justify-center text-[14px] font-bold text-white shadow-sm ring-1 ring-white/10 shrink-0">
              {initials}
            </div>
          )}
          <div className="flex flex-col overflow-hidden">
            <span className="text-[14px] font-bold text-gray-900 dark:text-white truncate">{displayName}</span>
            <span className="text-[12px] text-gray-600 dark:text-white/50 truncate font-semibold">{role}</span>
          </div>
        </div>

        {/* Menu Items Section */}
        <div className="p-1.5 flex flex-col">
          {/* Theme Row */}
          <div className="flex items-center justify-between px-2.5 py-2">
            <span className="text-[13px] text-gray-900 dark:text-white/80 font-semibold">Theme</span>
            <div className="flex items-center gap-0.5 bg-gray-100 dark:bg-white/5 p-0.5 rounded-lg border border-gray-300 dark:border-white/5">
              <button 
                onClick={() => setTheme('light')}
                className={cn("p-1.5 rounded-md transition-all", theme === 'light' ? "bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-[0_1px_3px_rgba(0,0,0,0.1)] border border-gray-200 dark:border-transparent" : "text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white/80")}
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => setTheme('dark')}
                className={cn("p-1.5 rounded-md transition-all", theme === 'dark' ? "bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-[0_1px_3px_rgba(0,0,0,0.1)] border border-gray-200 dark:border-transparent" : "text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white/80")}
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => setTheme('system')}
                className={cn("p-1.5 rounded-md transition-all", theme === 'system' ? "bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-[0_1px_3px_rgba(0,0,0,0.1)] border border-gray-200 dark:border-transparent" : "text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white/80")}
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="h-px w-full bg-gray-200 dark:bg-white/5 my-1" />

          {/* Account Settings */}
          <button className="flex items-center gap-2.5 w-full px-2.5 py-2 text-left text-[13px] text-gray-700 dark:text-white/80 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white rounded-lg transition-colors group">
            <Settings className="w-4 h-4 text-gray-500 dark:text-white/40 group-hover:text-gray-900 dark:group-hover:text-white/80 transition-colors" />
            <span className="font-semibold">Account Settings</span>
          </button>

          <div className="h-px w-full bg-gray-200 dark:bg-white/5 my-1" />

          {/* Logout Action */}
          <a href={`${import.meta.env.VITE_BACKEND_URL}/logout`} className="flex items-center gap-2.5 w-full px-2.5 py-2 text-left text-[13px] text-gray-700 dark:text-white/80 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors group">
            <LogOut className="w-4 h-4 text-gray-500 dark:text-white/40 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors" />
            <span className="font-semibold">Logout</span>
          </a>
        </div>
      </div>
    </div>
  );
}
