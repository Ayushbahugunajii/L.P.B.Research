import React, { useState } from 'react';
import { PaperResultItem } from '@study-search/shared';
import { FileText, Bookmark, ExternalLink, Download, Quote, Check, ChevronDown, ChevronUp, Award } from 'lucide-react';
import { formatNumber, generateBibtex } from '../lib/utils';
import { useAppStore } from '../lib/store';
import { toast } from 'sonner';

interface PaperResultCardProps {
  item: PaperResultItem;
}

export const PaperResultCard: React.FC<PaperResultCardProps> = ({ item }) => {
  const { toggleBookmark, isBookmarked } = useAppStore();
  const [expanded, setExpanded] = useState(false);
  const [copiedBibtex, setCopiedBibtex] = useState(false);
  const bookmarked = isBookmarked(item.id);

  const handleCopyBibtex = () => {
    const bib = generateBibtex(item);
    navigator.clipboard.writeText(bib);
    setCopiedBibtex(true);
    toast.success('BibTeX citation copied to clipboard');
    setTimeout(() => setCopiedBibtex(false), 2500);
  };

  const handleBookmark = () => {
    toggleBookmark(item);
    toast.success(bookmarked ? 'Removed from saved papers' : 'Saved paper to bookmarks');
  };

  return (
    <div className="group relative rounded-2xl border border-border/80 bg-card hover:bg-card/90 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-200 p-6 flex flex-col justify-between">
      <div>
        {/* Top meta tags */}
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            {item.venue && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                <Award className="w-3 h-3" />
                {item.venue}
              </span>
            )}
            <span className="text-xs font-mono font-medium text-muted-foreground">
              {item.year}
            </span>
            {item.citationCount !== undefined && (
              <span className="text-xs px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground font-mono font-medium border border-border">
                {formatNumber(item.citationCount)} citations
              </span>
            )}
            {item.isOpenAccess && (
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Open Access
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopyBibtex}
              className="p-1.5 rounded-lg border border-border/60 text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
              title="Copy BibTeX Citation"
            >
              {copiedBibtex ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <Quote className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={handleBookmark}
              className={`p-1.5 rounded-lg border transition-all ${
                bookmarked
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'border-border/60 text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
              title={bookmarked ? 'Remove bookmark' : 'Bookmark this paper'}
            >
              <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Paper Title */}
        <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
          <a
            href={item.pdfUrl || item.landingPageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline flex items-start gap-1.5"
          >
            <span>{item.title}</span>
          </a>
        </h3>

        {/* Authors */}
        <div className="mt-2 text-xs text-muted-foreground flex flex-wrap gap-x-2 gap-y-1">
          {item.authors.map((author, idx) => (
            <span key={idx} className="hover:text-foreground transition-colors">
              {author.name}
              {author.affiliation ? ` (${author.affiliation})` : ''}
              {idx < item.authors.length - 1 ? ',' : ''}
            </span>
          ))}
        </div>

        {/* Highlight passage */}
        {item.highlightSnippet && (
          <div className="mt-3.5 p-3 rounded-xl bg-primary/5 border border-primary/20">
            <div className="text-[11px] font-semibold text-primary uppercase tracking-wider mb-1 flex items-center gap-1">
              <FileText className="w-3 h-3" />
              <span>Key Relevant Passage</span>
            </div>
            <p className="text-xs text-foreground leading-relaxed italic">
              "{item.highlightSnippet}"
            </p>
          </div>
        )}

        {/* Abstract with toggle */}
        <div className="mt-3 text-xs text-muted-foreground leading-relaxed">
          <p className={expanded ? '' : 'line-clamp-3'}>{item.abstract}</p>
          {item.abstract.length > 200 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline cursor-pointer"
            >
              <span>{expanded ? 'Show less' : 'Read full abstract'}</span>
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-5 pt-3.5 border-t border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {item.pdfUrl && (
            <a
              href={item.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>View / Download PDF</span>
            </a>
          )}
          <button
            onClick={handleCopyBibtex}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border text-xs font-medium transition-all"
          >
            <Quote className="w-3 h-3" />
            <span>BibTeX</span>
          </button>
        </div>

        {item.landingPageUrl && (
          <a
            href={item.landingPageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            <span>ArXiv / Publisher</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
};
