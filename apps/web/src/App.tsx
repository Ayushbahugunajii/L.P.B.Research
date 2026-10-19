import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from './lib/store';
import { fetchSearch } from './lib/api';
import { Header } from './components/Header';
import { HeroSearch } from './components/HeroSearch';
import { FilterTabs } from './components/FilterTabs';
import { VideoResultCard } from './components/VideoResultCard';
import { PaperResultCard } from './components/PaperResultCard';
import { WebResultCard } from './components/WebResultCard';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { ReaderModal } from './components/ReaderModal';
import { BookmarksDrawer } from './components/BookmarksDrawer';
import { CommandPalette } from './components/CommandPalette';
import { Toaster } from 'sonner';
import { Search, Loader2, Sparkles } from 'lucide-react';
import { SearchResultItem } from '@study-search/shared';

export function App() {
  const { query, setQuery, activeTab, addRecentSearch } = useAppStore();
  const [activeSearchTerm, setActiveSearchTerm] = useState<string>('Attention Is All You Need');
  const [hasSearched, setHasSearched] = useState<boolean>(true);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['search', activeSearchTerm, activeTab],
    queryFn: () => fetchSearch(activeSearchTerm, activeTab),
    enabled: hasSearched && activeSearchTerm.trim().length > 0,
    staleTime: 60 * 1000
  });

  const handleExecuteSearch = (newQuery: string) => {
    const trimmed = newQuery.trim();
    if (!trimmed) {
      setHasSearched(false);
      return;
    }
    setQuery(trimmed);
    setActiveSearchTerm(trimmed);
    setHasSearched(true);
    addRecentSearch(trimmed);
  };

  useEffect(() => {
    // Sync initial query
    if (query && query !== activeSearchTerm) {
      setActiveSearchTerm(query);
      setHasSearched(true);
    }
  }, []);

  const results: SearchResultItem[] = data?.results || [];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary">
      {/* App Header */}
      <Header onSearchSubmit={handleExecuteSearch} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!hasSearched ? (
          <HeroSearch onSearchSubmit={handleExecuteSearch} />
        ) : (
          <div className="space-y-6">
            {/* Search Overview & Filter Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <FilterTabs counts={data?.meta?.breakdown} />

              {/* Meta stats */}
              {data && (
                <div className="text-xs text-muted-foreground flex items-center gap-2 self-end sm:self-auto font-mono">
                  <span>
                    {data.meta.totalHits} results ({data.meta.tookMs}ms)
                  </span>
                  {data.meta.cached && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-secondary text-foreground">
                      Cached
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-sm font-medium text-foreground">
                  Searching video key moments, papers & article passages...
                </p>
                <p className="text-xs text-muted-foreground">
                  Vector similarity & BM25 hybrid indexing in progress
                </p>
              </div>
            )}

            {/* Error State */}
            {isError && (
              <div className="p-8 rounded-2xl border border-destructive/30 bg-destructive/5 text-center space-y-3">
                <p className="text-sm font-semibold text-destructive">
                  Unable to connect to search index
                </p>
                <button
                  onClick={() => refetch()}
                  className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90"
                >
                  Retry Search
                </button>
              </div>
            )}

            {/* Results Grid / List */}
            {!isLoading && results.length > 0 && (
              <div className="space-y-4">
                {results.map((item) => {
                  if (item.type === 'video') {
                    return <VideoResultCard key={item.id} item={item} />;
                  }
                  if (item.type === 'paper') {
                    return <PaperResultCard key={item.id} item={item} />;
                  }
                  if (item.type === 'web') {
                    return <WebResultCard key={item.id} item={item} />;
                  }
                  return null;
                })}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && results.length === 0 && (
              <div className="py-24 text-center max-w-md mx-auto space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-muted mx-auto flex items-center justify-center text-muted-foreground">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-foreground">
                  No matching results found
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Try searching for a broader academic concept or explore suggested topics like "Attention Is All You Need" or "Raft Consensus".
                </p>
                <button
                  onClick={() => handleExecuteSearch('Attention Is All You Need')}
                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Explore Attention Mechanism</span>
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60 py-6 mt-12 bg-card/40 text-center text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">StudySearch Engine</span>
            <span>•</span>
            <span>Multimodal Academic & Multimedia Discovery</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span>Fastify 5</span>
            <span>•</span>
            <span>Elasticsearch</span>
            <span>•</span>
            <span>React 19</span>
            <span>•</span>
            <span>Tailwind v4</span>
          </div>
        </div>
      </footer>

      {/* Interactive Modals & Drawers */}
      <VideoPlayerModal />
      <ReaderModal />
      <BookmarksDrawer />
      <CommandPalette onSelectQuery={handleExecuteSearch} />

      {/* Toast Notifications */}
      <Toaster richColors position="bottom-right" />
    </div>
  );
}
export default App;
