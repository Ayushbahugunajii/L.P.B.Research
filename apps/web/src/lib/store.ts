import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SearchResultItem } from '@study-search/shared';

export interface ActiveVideoModal {
  videoId: string;
  title: string;
  channel: string;
  initialTimestamp?: number;
}

export interface ActiveReaderModal {
  title: string;
  url: string;
  highlightPassage: string;
}

interface AppState {
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;

  query: string;
  setQuery: (q: string) => void;

  activeTab: 'all' | 'video' | 'paper' | 'web';
  setActiveTab: (tab: 'all' | 'video' | 'paper' | 'web') => void;

  activeVideo: ActiveVideoModal | null;
  setActiveVideo: (video: ActiveVideoModal | null) => void;

  activeReader: ActiveReaderModal | null;
  setActiveReader: (reader: ActiveReaderModal | null) => void;

  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;

  isBookmarksOpen: boolean;
  setIsBookmarksOpen: (open: boolean) => void;

  bookmarks: SearchResultItem[];
  toggleBookmark: (item: SearchResultItem) => void;
  isBookmarked: (id: string) => boolean;

  recentSearches: string[];
  addRecentSearch: (search: string) => void;
  clearRecentSearches: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      setTheme: (theme) => {
        set({ theme });
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },
      toggleTheme: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark';
        get().setTheme(next);
      },

      query: '',
      setQuery: (query) => set({ query }),

      activeTab: 'all',
      setActiveTab: (activeTab) => set({ activeTab }),

      activeVideo: null,
      setActiveVideo: (activeVideo) => set({ activeVideo }),

      activeReader: null,
      setActiveReader: (activeReader) => set({ activeReader }),

      isCommandPaletteOpen: false,
      setIsCommandPaletteOpen: (isCommandPaletteOpen) => set({ isCommandPaletteOpen }),

      isBookmarksOpen: false,
      setIsBookmarksOpen: (isBookmarksOpen) => set({ isBookmarksOpen }),

      bookmarks: [],
      toggleBookmark: (item) => {
        const current = get().bookmarks;
        const exists = current.some((b) => b.id === item.id);
        if (exists) {
          set({ bookmarks: current.filter((b) => b.id !== item.id) });
        } else {
          set({ bookmarks: [item, ...current] });
        }
      },
      isBookmarked: (id) => get().bookmarks.some((b) => b.id === id),

      recentSearches: [
        'Attention Is All You Need',
        'Raft Consensus Distributed Systems',
        'Vector Search HNSW'
      ],
      addRecentSearch: (search) => {
        const trimmed = search.trim();
        if (!trimmed) return;
        const filtered = get().recentSearches.filter((s) => s.toLowerCase() !== trimmed.toLowerCase());
        set({ recentSearches: [trimmed, ...filtered].slice(0, 8) });
      },
      clearRecentSearches: () => set({ recentSearches: [] })
    }),
    {
      name: 'study-search-storage',
      partialize: (state) => ({
        theme: state.theme,
        bookmarks: state.bookmarks,
        recentSearches: state.recentSearches
      })
    }
  )
);
