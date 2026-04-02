import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';
import { cn } from '../utils/utils';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { User, Settings as SettingsIcon, Monitor, Sun, Moon, Github, Mail, Shield, Bell } from 'lucide-react';

export default function Settings() {
  const location = useLocation();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  // Determine initial tab based on route
  const isAccountRoute = location.pathname.includes('/account');
  const [activeTab, setActiveTab] = useState(isAccountRoute ? 'account' : 'general');

  // Keep layout variables aligned
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const displayName = user?.githubName || user?.githubLogin || 'Developer';
  const role = 'Admin';
  const avatarUrl = user?.avatarUrl || user?.avatar_url || (user?.githubLogin ? `https://github.com/${user.githubLogin}.png` : null);

  const TABS = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'account', label: 'Account', icon: User },
    // Mock future tabs to look like a premium SaaS dashboard
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background text-gray-900 dark:text-foreground font-sans selection:bg-accent/30 flex relative overflow-hidden">
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} installState="has-repos" />
      <Topbar isCollapsed={isCollapsed} installState="has-repos" />

      <main className={cn(
        "flex-1 pt-[60px] min-h-screen relative z-10 flex bg-gray-50 dark:bg-[#050505] transition-all duration-300",
        isCollapsed ? "ml-[80px]" : "ml-[240px]"
      )}>
        {/* Subtle ambient glow */}
        <div className="absolute top-0 right-1/4 w-1/3 h-64 bg-accent/5 dark:bg-accent/5 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="flex-1 max-w-[1200px] w-full mx-auto flex h-full">
          
          {/* Settings Sidebar */}
          <div className="w-64 border-r border-gray-200 dark:border-white/5 py-10 pr-8 pl-8 sm:pl-12">
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white mb-8">Settings</h2>
            
            <nav className="flex flex-col gap-1.5">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium transition-all duration-200 text-left w-full",
                    activeTab === tab.id
                      ? "bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white shadow-sm border border-gray-300 dark:border-white/10"
                      : "text-gray-600 dark:text-white/50 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/[0.03] dark:hover:text-white/80 border border-transparent"
                  )}
                >
                  <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-white/40")} />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Settings Content Area */}
          <div className="flex-1 py-10 pl-8 pr-8 sm:pr-12 max-w-2xl">
            {activeTab === 'general' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1 tracking-tight">Appearance</h3>
                  <p className="text-[14px] text-gray-500 dark:text-white/40 mb-6">Customize how Dura looks on your device.</p>
                  
                  <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-xl dark:shadow-black/40 backdrop-blur-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                      <div>
                        <h4 className="text-[15px] font-medium text-gray-900 dark:text-white mb-1">Theme Preference</h4>
                        <p className="text-[13px] text-gray-500 dark:text-white/40">Choose specific theme or sync with system.</p>
                      </div>
                      
                      <div className="flex items-center gap-1 bg-gray-100 dark:bg-black/30 p-1 rounded-xl border border-gray-200 dark:border-white/10">
                        {[{ id: 'light', icon: Sun, label: 'Light' }, { id: 'dark', icon: Moon, label: 'Dark' }, { id: 'system', icon: Monitor, label: 'System' }].map(t => (
                          <button
                            key={t.id}
                            onClick={() => setTheme(t.id)}
                            className={cn(
                              "flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-all",
                              theme === t.id
                                ? "bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-white/10"
                                : "text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white border border-transparent"
                            )}
                          >
                            <t.icon className="w-4 h-4" />
                            <span className="hidden sm:inline">{t.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'account' && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1 tracking-tight">Your Profile</h3>
                  <p className="text-[14px] text-gray-500 dark:text-white/40 mb-6">Manage your GitHub account linkage and personal details.</p>
                  
                  <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-sm dark:shadow-xl dark:shadow-black/40 backdrop-blur-sm space-y-8">
                    
                    {/* Avatar & Basic Info */}
                    <div className="flex items-start gap-6">
                      <div className="relative group">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt={displayName} className="w-20 h-20 rounded-full shadow-md ring-2 ring-gray-200 dark:ring-white/10 object-cover" />
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-accent to-amber-600 flex items-center justify-center text-xl font-bold text-white shadow-md ring-2 ring-white/10">
                            {displayName.charAt(0)}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer backdrop-blur-sm">
                          <span className="text-[11px] text-white font-medium uppercase tracking-wider">Sync GitHub</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col pt-1">
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white">{displayName}</h4>
                        <span className="text-[13px] text-accent font-medium mt-0.5">{role}</span>
                        <div className="flex items-center gap-1.5 mt-2 text-[13px] text-gray-500 dark:text-white/40">
                          <Github className="w-3.5 h-3.5" />
                          <span>Connected via GitHub Auth</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1 tracking-tight">Danger Zone</h3>
                  <p className="text-[14px] text-gray-500 dark:text-white/40 mb-6">Destructive actions for your account.</p>
                  
                  <div className="border border-red-500/20 bg-red-50/50 dark:bg-red-500/5 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
                    <div>
                      <h4 className="text-[15px] font-medium text-gray-900 dark:text-white mb-1">Delete Account</h4>
                      <p className="text-[13px] text-gray-500 dark:text-white/40 max-w-sm">
                        Permanently delete your user profile and sever all GitHub OAuth connections. Associated analysis data will remain anonymously.
                      </p>
                    </div>
                    <button className="px-5 py-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 border border-red-500/20 dark:border-red-500/30 rounded-xl text-[13px] font-medium transition-all shadow-sm whitespace-nowrap">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Scaffolding for future tabs */}
            {(activeTab === 'notifications' || activeTab === 'security') && (
               <div className="flex flex-col items-center justify-center h-64 text-center border border-gray-200 dark:border-white/5 border-dashed rounded-2xl bg-gray-50 dark:bg-white/[0.02] animate-in fade-in slide-in-from-bottom-2">
                 <Shield className="w-10 h-10 text-gray-400 dark:text-white/20 mb-4" />
                 <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Coming Soon</h3>
                 <p className="text-gray-500 dark:text-white/40 text-[14px] max-w-sm">This module is currently in development and will be available in future updates.</p>
               </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
