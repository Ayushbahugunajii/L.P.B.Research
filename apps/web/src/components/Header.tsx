import React from 'react';
import { Search, Bookmark, Sun, Moon, Command } from 'lucide-react';
import { useAppStore } from '../lib/store';

interface HeaderProps {
  onSearchSubmit?: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearchSubmit }) => {
  const {
    theme,
    toggleTheme,
    query,
    setQuery,
    bookmarks,
    setIsBookmarksOpen,
    setIsCommandPaletteOpen
  } = useAppStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchSubmit) {
      onSearchSubmit(query);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div
          onClick={() => {
            setQuery('');
            if (onSearchSubmit) onSearchSubmit('');
          }}
          className="flex items-center gap-3 cursor-pointer group flex-shrink-0 select-none"
        >
          <div className="h-10 px-3.5 rounded-xl bg-gradient-to-tr from-primary via-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-md shadow-primary/30 transition-all duration-300 group-hover:scale-105 group-hover:shadow-primary/50 border border-white/20">
            <span className="font-black text-lg tracking-wider font-mono">LPB.</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-primary bg-clip-text text-transparent">
                StudySearch
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground hidden sm:block -mt-0.5 font-medium">
              Deep Academic & Video Key Moments
            </p>
          </div>
        </div>

        {/* Global Search Bar */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 max-w-2xl relative flex items-center"
        >
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search concepts, papers, video moments (e.g. Attention mechanism)..."
              className="w-full pl-10 pr-24 py-2 text-sm rounded-xl bg-secondary/50 hover:bg-secondary/80 focus:bg-background border border-border/80 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground text-foreground"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsCommandPaletteOpen(true)}
                className="hidden sm:flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-muted hover:bg-muted/80 px-2 py-1 rounded-md border border-border transition-colors"
                title="Command Palette (Cmd+K)"
              >
                <Command className="w-3 h-3" />
                <span>K</span>
              </button>
            </div>
          </div>
        </form>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Bookmarks */}
          <button
            onClick={() => setIsBookmarksOpen(true)}
            className="relative p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary border border-transparent hover:border-border transition-all"
            title="Saved Bookmarks"
          >
            <Bookmark className="w-5 h-5" />
            {bookmarks.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary text-[10px] font-bold text-white flex items-center justify-center">
                {bookmarks.length}
              </span>
            )}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary border border-transparent hover:border-border transition-all"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-slate-700" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
