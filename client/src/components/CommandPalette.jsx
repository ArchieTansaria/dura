import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { Search, Database, Settings, User, Moon, Sun, Monitor, LogOut, TerminalSquare } from 'lucide-react';
import { cn } from '../utils/utils';

export function CommandPalette({ isOpen, setIsOpen }) {
  const [query, setQuery] = useState('');
  const [repos, setRepos] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { setTheme } = useTheme();

  // Static commands
  const staticCommands = [
    { id: 'dash', name: 'Dashboard', icon: TerminalSquare, action: () => navigate('/dashboard'), category: 'Navigation' },
    { id: 'settings', name: 'Preferences', icon: Settings, action: () => navigate('/settings'), category: 'Navigation' },
    { id: 'account', name: 'Account Settings', icon: User, action: () => navigate('/account'), category: 'Navigation' },
    { id: 'theme-dark', name: 'Switch to Dark Theme', icon: Moon, action: () => setTheme('dark'), category: 'Appearance' },
    { id: 'theme-light', name: 'Switch to Light Theme', icon: Sun, action: () => setTheme('light'), category: 'Appearance' },
    { id: 'theme-sys', name: 'Use System Theme', icon: Monitor, action: () => setTheme('system'), category: 'Appearance' },
    { id: 'logout', name: 'Log Out', icon: LogOut, action: () => { window.location.assign(`${import.meta.env.VITE_BACKEND_URL}/logout`); }, category: 'Danger' }
  ];

  // Global listener for Cmd+K
  useEffect(() => {
    const down = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [setIsOpen]);

  // Fetch repos when opened
  useEffect(() => {
    if (isOpen && repos.length === 0) {
      const fetchRepos = async () => {
        try {
          const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/dashboard`, { credentials: 'include' });
          if (!res.ok) return;
          const data = await res.json();
          if (!data.installations) return;
          // Transform repo data into command palette format
          const allRepos = data.installations.flatMap(inst => inst.repos || []);
          const formattedRepos = allRepos.map(r => ({
            id: `repo-${r.id}`,
            name: r.full_name,
            icon: Database,
            action: () => navigate(`/repo/${r.full_name}`, { state: { isPrivate: r.private } }),
            category: 'Repositories',
            private: r.private
          }));
          setRepos(formattedRepos);
        } catch (e) {
          console.error("Failed to fetch repos for palette", e);
        }
      };
      fetchRepos();
    }
  }, [isOpen, navigate, repos.length]);

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }

  // Manage focus and overflow
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 10);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  // Unified items filtered by query
  const allItems = [...repos, ...staticCommands];
  const filteredItems = allItems.filter(item => 
    item.name.toLowerCase().includes(query.toLowerCase()) || 
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, filteredItems.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].action();
          setIsOpen(false);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, setIsOpen]);



  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex animate-in fade-in duration-200">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />
      <div className="relative w-full max-w-xl mx-auto mt-[10vh] h-fit max-h-[80vh] flex flex-col bg-white dark:bg-[#0A0A0A] rounded-2xl shadow-2xl dark:shadow-[0_0_80px_rgba(0,0,0,0.8)] border border-gray-200 dark:border-white/10 overflow-hidden transform animate-in zoom-in-95 duration-200">
        
        {/* Search Input */}
        <div className="flex items-center px-4 py-4 border-b border-gray-100 dark:border-white/5">
          <Search className="w-5 h-5 text-gray-400 dark:text-white/40 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white text-lg placeholder:text-gray-400 dark:placeholder:text-white/30"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 font-mono text-[10px] bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-white/40 px-2 py-1 rounded">
            ESC
          </kbd>
        </div>

        {/* Results Body */}
        <div className="overflow-y-auto p-2" style={{ maxHeight: 'calc(80vh - 70px)' }}>
          {filteredItems.length === 0 ? (
            <div className="py-14 text-center">
              <p className="text-[14px] text-gray-500 dark:text-white/40">No results found.</p>
            </div>
          ) : (
             <div className="space-y-1">
                {filteredItems.map((item, i) => (
                  <div
                    key={item.id}
                    onClick={() => { item.action(); setIsOpen(false); }}
                    onMouseMove={() => setSelectedIndex(i)}
                    className={cn(
                      "flex items-center justify-between px-3 py-3 rounded-xl cursor-pointer transition-colors duration-100",
                      selectedIndex === i 
                        ? "bg-accent/10 dark:bg-white/10 text-accent dark:text-white shadow-sm"
                        : "text-gray-600 dark:text-white/60 hover:bg-gray-50 dark:hover:bg-white/5"
                    )}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <item.icon className={cn("w-4 h-4 shrink-0", selectedIndex === i ? "opacity-100" : "opacity-60")} />
                      <span className="text-[14px] font-medium truncate">{item.name}</span>
                      {item.private && (
                        <span className="ml-2 px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded border border-gray-200 dark:border-white/10 text-gray-400 dark:text-white/30 hidden sm:inline-block">Private</span>
                      )}
                    </div>
                    {selectedIndex === i && (
                       <span className="text-[11px] font-medium opacity-50 shrink-0">Jump To</span>
                    )}
                  </div>
                ))}
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
