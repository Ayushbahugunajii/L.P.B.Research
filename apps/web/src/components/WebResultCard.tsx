import React from 'react';
import { WebResultItem } from '@study-search/shared';
import { Globe, Bookmark, ExternalLink, BookOpen, Highlighter, Sparkles } from 'lucide-react';
import { formatDate } from '../lib/utils';
import { useAppStore } from '../lib/store';
import { toast } from 'sonner';

interface WebResultCardProps {
  item: WebResultItem;
}

export const WebResultCard: React.FC<WebResultCardProps> = ({ item }) => {
  const { setActiveReader, toggleBookmark, isBookmarked } = useAppStore();
  const bookmarked = isBookmarked(item.id);

  const handleOpenReader = () => {
    setActiveReader({
      title: item.title,
      url: item.url,
      highlightPassage: item.highlightPassage
    });
  };

  const handleBookmark = () => {
    toggleBookmark(item);
    toast.success(bookmarked ? 'Removed from saved articles' : 'Saved article passage to bookmarks');
  };

  return (
    <div className="group relative rounded-2xl border border-border/80 bg-card hover:bg-card/90 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-200 p-6 flex flex-col justify-between">
      <div>
        {/* Domain & Meta */}
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2">
            {item.faviconUrl ? (
              <img
                src={item.faviconUrl}
                alt=""
                className="w-4 h-4 rounded-sm object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <Globe className="w-4 h-4 text-muted-foreground" />
            )}
            <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
              {item.domain}
            </span>
            {item.publishedAt && (
              <>
                <span className="text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">{formatDate(item.publishedAt)}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
              <Highlighter className="w-2.5 h-2.5" />
              <span>Passage Highlight</span>
            </span>

            <button
              onClick={handleBookmark}
              className={`p-1.5 rounded-lg border transition-all ${
                bookmarked
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'border-border/60 text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
              title={bookmarked ? 'Remove bookmark' : 'Bookmark this passage'}
            >
              <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
          <a
            href={item.textFragmentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline flex items-start gap-1.5"
            title="Open webpage and scroll to highlight"
          >
            <span>{item.title}</span>
          </a>
        </h3>

        {/* Auto-highlighted passage callout */}
        <div className="mt-3.5 p-4 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/30">
          <div className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Target Passage (Auto-Scrolled & Highlighted)</span>
          </div>
          <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed font-normal">
            <mark className="bg-amber-300/40 dark:bg-amber-400/30 text-foreground px-1 py-0.5 rounded-xs font-medium">
              {item.highlightPassage}
            </mark>
          </p>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-5 pt-3.5 border-t border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Main Action: Native Scroll & Highlight via Text Fragment */}
          <a
            href={item.textFragmentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 shadow-sm transition-all"
            title="Opens external site directly scrolled to the target text fragment"
          >
            <Highlighter className="w-3.5 h-3.5" />
            <span>Open & Highlight Passage</span>
          </a>

          {/* Reader View Modal */}
          <button
            onClick={handleOpenReader}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border text-xs font-medium transition-all"
            title="Read in clean reader mode inside app"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Reader View</span>
          </button>
        </div>

        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
        >
          <span>Visit Source</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};
