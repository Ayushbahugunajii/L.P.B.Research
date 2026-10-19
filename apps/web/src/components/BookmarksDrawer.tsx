import React from 'react';
import { useAppStore } from '../lib/store';
import { X, Bookmark, Video, FileText, Globe, Trash2, ExternalLink, Play, BookOpen } from 'lucide-react';
import { formatTimestamp } from '../lib/utils';
import { toast } from 'sonner';

export const BookmarksDrawer: React.FC = () => {
  const {
    isBookmarksOpen,
    setIsBookmarksOpen,
    bookmarks,
    toggleBookmark,
    setActiveVideo,
    setActiveReader
  } = useAppStore();

  if (!isBookmarksOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md h-full bg-card border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Bookmark className="w-4 h-4 fill-current" />
            </span>
            <div>
              <h2 className="text-base font-bold text-foreground">Saved Items</h2>
              <p className="text-xs text-muted-foreground">
                {bookmarks.length} saved papers, videos & passages
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsBookmarksOpen(false)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {bookmarks.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
              <Bookmark className="w-10 h-10 mb-2 stroke-1 opacity-40" />
              <p className="text-sm font-medium text-foreground">No bookmarks saved yet</p>
              <p className="text-xs mt-1">
                Click the bookmark icon on any paper, video key moment, or article passage to save it here.
              </p>
            </div>
          ) : (
            bookmarks.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-border bg-secondary/30 hover:bg-secondary/60 transition-all flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {item.type === 'video' && (
                      <>
                        <Video className="w-3.5 h-3.5 text-primary" />
                        <span>Video Moment</span>
                      </>
                    )}
                    {item.type === 'paper' && (
                      <>
                        <FileText className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Research Paper</span>
                      </>
                    )}
                    {item.type === 'web' && (
                      <>
                        <Globe className="w-3.5 h-3.5 text-amber-500" />
                        <span>Web Passage</span>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      toggleBookmark(item);
                      toast.success('Removed from bookmarks');
                    }}
                    className="text-muted-foreground hover:text-destructive p-1 rounded-md"
                    title="Remove"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h4 className="text-sm font-semibold text-foreground mt-1.5 line-clamp-2">
                  {item.title}
                </h4>

                {item.type === 'video' && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                    Starts at {formatTimestamp(item.bestStartSec)} • {item.channel}
                  </p>
                )}

                {item.type === 'paper' && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                    {item.authors.map((a) => a.name).join(', ')} ({item.year})
                  </p>
                )}

                {item.type === 'web' && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                    {item.domain}
                  </p>
                )}

                <div className="mt-3 pt-2 border-t border-border/40 flex items-center justify-between text-xs">
                  {item.type === 'video' && (
                    <button
                      onClick={() => {
                        setActiveVideo({
                          videoId: item.id,
                          title: item.title,
                          channel: item.channel,
                          initialTimestamp: item.bestStartSec
                        });
                        setIsBookmarksOpen(false);
                      }}
                      className="font-medium text-primary hover:underline flex items-center gap-1"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Play from {formatTimestamp(item.bestStartSec)}</span>
                    </button>
                  )}

                  {item.type === 'paper' && item.pdfUrl && (
                    <a
                      href={item.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-primary hover:underline flex items-center gap-1"
                    >
                      <span>Open PDF</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}

                  {item.type === 'web' && (
                    <button
                      onClick={() => {
                        setActiveReader({
                          title: item.title,
                          url: item.url,
                          highlightPassage: item.highlightPassage
                        });
                        setIsBookmarksOpen(false);
                      }}
                      className="font-medium text-primary hover:underline flex items-center gap-1"
                    >
                      <BookOpen className="w-3 h-3" />
                      <span>Open in Reader</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
