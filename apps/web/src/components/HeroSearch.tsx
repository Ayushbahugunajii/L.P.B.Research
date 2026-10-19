import React from 'react';
import { Search, Sparkles, Video, FileText, Globe, ArrowRight } from 'lucide-react';
import { SUGGESTED_TOPICS } from '../lib/mockData';
import { useAppStore } from '../lib/store';

interface HeroSearchProps {
  onSearchSubmit: (q: string) => void;
}

export const HeroSearch: React.FC<HeroSearchProps> = ({ onSearchSubmit }) => {
  const { query, setQuery } = useAppStore();

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearchSubmit(query.trim());
    }
  };

  return (
    <div className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary/15 dark:bg-primary/20 blur-[130px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto px-4 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-secondary/80 border border-border text-xs font-medium text-foreground mb-6 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
          <span>Multimodal Academic Search Engine</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-primary font-semibold">Fast & Precise</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
          Deep Academic Search with{' '}
          <span className="bg-gradient-to-r from-primary via-indigo-500 to-amber-500 bg-clip-text text-transparent">
            Exact Key Moments
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Stop scrubbing through hours of video lectures and scanning 50-page PDFs. Get timestamp-level key moments,
          peer-reviewed paper summaries, and auto-scrolled web article passages instantly.
        </p>

        {/* Search Input Box */}
        <form onSubmit={handleFormSubmit} className="mt-8 max-w-2xl mx-auto">
          <div className="relative flex items-center shadow-xl shadow-primary/5 rounded-2xl bg-card border-2 border-border/80 focus-within:border-primary transition-all p-1.5">
            <Search className="w-5 h-5 text-muted-foreground ml-3" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search any study topic (e.g. Attention Is All You Need, Raft Consensus)..."
              className="w-full px-3 py-3 text-base bg-transparent outline-none placeholder:text-muted-foreground text-foreground"
            />
            <button
              type="submit"
              className="flex-shrink-0 px-5 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-all flex items-center gap-2 shadow-sm"
            >
              <span>Search</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Topic Suggestion Chips */}
        <div className="mt-6 flex items-center justify-center gap-2 flex-wrap text-xs">
          <span className="text-muted-foreground font-medium">Try exploring:</span>
          {SUGGESTED_TOPICS.map((topic) => (
            <button
              key={topic}
              onClick={() => {
                setQuery(topic);
                onSearchSubmit(topic);
              }}
              className="px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 border border-border text-foreground hover:border-primary/40 transition-all cursor-pointer font-medium"
            >
              {topic}
            </button>
          ))}
        </div>

        {/* 3 Pillars Feature Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-5 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-xs hover:border-primary/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3.5">
              <Video className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-foreground mb-1">
              Video Key Moments
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Jumps directly to the exact second a topic is explained, complete with synchronized transcripts and scrubbers.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-xs hover:border-primary/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-3.5">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-foreground mb-1">
              Research Papers
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Finds peer-reviewed papers with citation metrics, author affiliations, instant BibTeX export, and open PDF downloads.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-xs hover:border-primary/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3.5">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-foreground mb-1">
              Passage Highlighting
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Uses modern Text Fragment URLs to open external articles and automatically scroll to & highlight the key passage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
