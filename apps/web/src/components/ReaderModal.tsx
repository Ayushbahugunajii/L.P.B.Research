import React, { useEffect, useRef } from 'react';
import { useAppStore } from '../lib/store';
import { X, ExternalLink, Highlighter, BookOpen, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

export const ReaderModal: React.FC = () => {
  const { activeReader, setActiveReader } = useAppStore();
  const highlightRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    if (activeReader && highlightRef.current) {
      // Smooth auto-scroll into view with small delay for modal animation
      const timer = setTimeout(() => {
        highlightRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [activeReader]);

  if (!activeReader) return null;

  const handleCopyPassage = () => {
    navigator.clipboard.writeText(activeReader.highlightPassage);
    setCopied(true);
    toast.success('Passage copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl h-[88vh] max-h-[800px] bg-card border border-border/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border/70 flex items-center justify-between bg-card/90">
          <div className="flex items-center gap-3 overflow-hidden">
            <span className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-4 h-4" />
            </span>
            <div className="truncate">
              <h2 className="text-sm sm:text-base font-semibold text-foreground truncate">
                {activeReader.title}
              </h2>
              <p className="text-xs text-muted-foreground truncate">
                Distraction-free Reader View • Auto-scrolled to target passage
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleCopyPassage}
              className="text-xs text-muted-foreground hover:text-foreground hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:bg-secondary transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy Quote</span>
            </button>
            <a
              href={activeReader.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:bg-secondary transition-colors"
            >
              <span>Original Webpage</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={() => setActiveReader(null)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary border border-transparent hover:border-border transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Article Body */}
        <div className="flex-1 overflow-y-auto px-6 py-8 sm:px-12 sm:py-12 max-w-3xl mx-auto w-full space-y-6 text-foreground/90 font-serif leading-relaxed text-base sm:text-lg">
          <div className="border-b border-border/40 pb-6 not-italic font-sans">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground mb-2">
              {activeReader.title}
            </h1>
            <p className="text-xs text-muted-foreground font-mono">
              Source: {activeReader.url}
            </p>
          </div>

          <p className="text-muted-foreground">
            In modern artificial intelligence and machine learning architectures, understanding how representations
            are formed and processed sequentially is fundamental to both theoretical research and practical deployment.
          </p>

          <p className="text-muted-foreground">
            Earlier paradigms encountered severe information bottlenecks when scaling parameters, particularly in recurrent
            computations where memory degradation occurred across extended token contexts.
          </p>

          {/* Target Highlighted Passage */}
          <div
            ref={highlightRef}
            className="my-8 p-6 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border-2 border-amber-500/40 shadow-xl shadow-amber-500/5 relative transition-all"
          >
            <div className="flex items-center gap-2 mb-3 not-italic font-sans">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-amber-500 text-black flex items-center gap-1.5 shadow-sm">
                <Highlighter className="w-3.5 h-3.5" />
                Target Highlighted Passage
              </span>
              <span className="text-xs text-muted-foreground">
                Matches your search topic
              </span>
            </div>

            <blockquote className="text-lg sm:text-xl font-medium text-foreground leading-relaxed italic border-l-4 border-amber-500 pl-4 py-1">
              "{activeReader.highlightPassage}"
            </blockquote>
          </div>

          <p className="text-muted-foreground">
            Consequently, this breakthrough allows multi-head query-key-value mechanisms to compute cross-attention
            and self-attention weights completely in parallel across matrix hardware accelerators.
          </p>

          <p className="text-muted-foreground">
            Extensive empirical evaluations across multilingual translation benchmarks, language modeling evaluations,
            and multimodal reasoning prove that these structural transformations generalize across diverse domain modalities.
          </p>
        </div>
      </div>
    </div>
  );
};
