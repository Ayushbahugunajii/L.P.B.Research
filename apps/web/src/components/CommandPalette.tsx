import React, { useEffect } from 'react';
import { Command } from 'cmdk';
import { useAppStore } from '../lib/store';
import { SUGGESTED_TOPICS } from '../lib/mockData';
import { Search, Layers, Video, FileText, Globe, Sun, Moon, Bookmark, Sparkles, X } from 'lucide-react';

interface CommandPaletteProps {
  onSelectQuery: (q: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ onSelectQuery }) => {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    setActiveTab,
    toggleTheme,
    theme,
    setIsBookmarksOpen,
    recentSearches
  } = useAppStore();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsCommandPaletteOpen(!isCommandPaletteOpen);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [isCommandPaletteOpen, setIsCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
        <Command className="w-full">
          {/* Input */}
          <div className="flex items-center px-4 border-b border-border">
            <Search className="w-4 h-4 text-muted-foreground mr-2.5" />
            <Command.Input
              placeholder="Search topics, change filters, or run actions..."
              className="w-full py-4 text-sm bg-transparent outline-none placeholder:text-muted-foreground text-foreground"
              autoFocus
            />
            <button
              onClick={() => setIsCommandPaletteOpen(false)}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* List */}
          <Command.List className="max-h-80 overflow-y-auto p-2 space-y-1">
            <Command.Empty className="p-4 text-center text-xs text-muted-foreground">
              No results found.
            </Command.Empty>

            {/* Suggested Academic Topics */}
            <Command.Group heading="Suggested Research Topics" className="text-xs font-semibold text-muted-foreground px-2 py-1.5">
              {SUGGESTED_TOPICS.map((topic) => (
                <Command.Item
                  key={topic}
                  onSelect={() => {
                    onSelectQuery(topic);
                    setIsCommandPaletteOpen(false);
                  }}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-foreground hover:bg-secondary cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span>{topic}</span>
                </Command.Item>
              ))}
            </Command.Group>

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <Command.Group heading="Recent Searches" className="text-xs font-semibold text-muted-foreground px-2 py-1.5">
                {recentSearches.map((search) => (
                  <Command.Item
                    key={search}
                    onSelect={() => {
                      onSelectQuery(search);
                      setIsCommandPaletteOpen(false);
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-foreground hover:bg-secondary cursor-pointer"
                  >
                    <Search className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>{search}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {/* Quick Filters */}
            <Command.Group heading="Filter Content Type" className="text-xs font-semibold text-muted-foreground px-2 py-1.5">
              <Command.Item
                onSelect={() => {
                  setActiveTab('all');
                  setIsCommandPaletteOpen(false);
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-foreground hover:bg-secondary cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Show All Results</span>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  setActiveTab('video');
                  setIsCommandPaletteOpen(false);
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-foreground hover:bg-secondary cursor-pointer"
              >
                <Video className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Filter: Videos (Key Moments)</span>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  setActiveTab('paper');
                  setIsCommandPaletteOpen(false);
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-foreground hover:bg-secondary cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Filter: Research Papers</span>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  setActiveTab('web');
                  setIsCommandPaletteOpen(false);
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-foreground hover:bg-secondary cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Filter: Web Articles</span>
              </Command.Item>
            </Command.Group>

            {/* App Settings */}
            <Command.Group heading="Preferences" className="text-xs font-semibold text-muted-foreground px-2 py-1.5">
              <Command.Item
                onSelect={() => {
                  setIsBookmarksOpen(true);
                  setIsCommandPaletteOpen(false);
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-foreground hover:bg-secondary cursor-pointer"
              >
                <Bookmark className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Open Saved Bookmarks</span>
              </Command.Item>

              <Command.Item
                onSelect={() => {
                  toggleTheme();
                  setIsCommandPaletteOpen(false);
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-foreground hover:bg-secondary cursor-pointer"
              >
                {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-700" />}
                <span>Toggle {theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
};
