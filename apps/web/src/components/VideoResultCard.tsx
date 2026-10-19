import React from 'react';
import { VideoResultItem } from '@study-search/shared';
import { Play, Clock, Bookmark, ExternalLink, Sparkles, Youtube } from 'lucide-react';
import { formatTimestamp, formatNumber, formatDate } from '../lib/utils';
import { useAppStore } from '../lib/store';
import { toast } from 'sonner';

interface VideoResultCardProps {
  item: VideoResultItem;
}

export const VideoResultCard: React.FC<VideoResultCardProps> = ({ item }) => {
  const { setActiveVideo, toggleBookmark, isBookmarked } = useAppStore();
  const bookmarked = isBookmarked(item.id);

  const handleOpenVideo = (timestamp?: number) => {
    setActiveVideo({
      videoId: item.id,
      title: item.title,
      channel: item.channel,
      initialTimestamp: timestamp ?? item.bestStartSec
    });
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleBookmark(item);
    toast.success(bookmarked ? 'Removed from saved items' : 'Saved video moment to bookmarks');
  };

  return (
    <div className="group relative rounded-2xl border border-border/80 bg-card hover:bg-card/90 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-200 overflow-hidden p-5 flex flex-col md:flex-row gap-5">
      {/* Thumbnail + Play Action */}
      <div
        onClick={() => handleOpenVideo(item.bestStartSec)}
        className="relative w-full md:w-64 h-36 flex-shrink-0 rounded-xl overflow-hidden cursor-pointer bg-muted"
      >
        <img
          src={item.thumbnailUrl}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            // fallback image if remote fails
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=640&q=80';
          }}
        />
        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-colors">
          <div className="w-12 h-12 rounded-full bg-primary/90 text-white flex items-center justify-center shadow-lg shadow-black/40 group-hover:scale-110 transition-transform">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
        </div>

        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-xs text-white text-[11px] font-mono px-2 py-0.5 rounded-md">
          {formatTimestamp(item.durationSec)}
        </div>

        {/* Key moment badge */}
        <div className="absolute top-2 left-2 bg-primary/95 text-white text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-md flex items-center gap-1 shadow-md">
          <Sparkles className="w-3 h-3" />
          <span>Key Moment</span>
        </div>
      </div>

      {/* Content info */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Header row: Channel, views, bookmark */}
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground flex items-center gap-1">
                <Youtube className="w-3.5 h-3.5 text-red-500" />
                {item.channel}
              </span>
              <span>•</span>
              {item.viewCount && <span>{formatNumber(item.viewCount)} views</span>}
              {item.publishedAt && (
                <>
                  <span>•</span>
                  <span>{formatDate(item.publishedAt)}</span>
                </>
              )}
            </div>

            <button
              onClick={handleBookmark}
              className={`p-1.5 rounded-lg border transition-all ${
                bookmarked
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'border-border/60 text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
              title={bookmarked ? 'Remove bookmark' : 'Bookmark this video'}
            >
              <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Title */}
          <h3
            onClick={() => handleOpenVideo(item.bestStartSec)}
            className="text-base font-semibold text-foreground group-hover:text-primary transition-colors cursor-pointer line-clamp-2 leading-snug"
          >
            {item.title}
          </h3>

          {/* Best matching snippet with timestamp callout */}
          <div className="mt-2.5 p-3 rounded-xl bg-secondary/40 border border-border/60">
            <div className="flex items-center gap-2 mb-1">
              <button
                onClick={() => handleOpenVideo(item.bestStartSec)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-mono text-xs font-semibold hover:bg-amber-500/20 transition-colors"
                title="Jump to this exact timestamp"
              >
                <Clock className="w-3 h-3" />
                <span>Starts at {formatTimestamp(item.bestStartSec)}</span>
              </button>
              <span className="text-[11px] text-muted-foreground italic">
                Exact key moment found
              </span>
            </div>
            <p className="text-xs text-foreground/90 leading-relaxed italic">
              "{item.highlightSnippet}"
            </p>
          </div>

          {/* Also mentioned at timeline chips */}
          {item.alsoMentionedAt && item.alsoMentionedAt.length > 0 && (
            <div className="mt-3 flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-muted-foreground font-medium mr-1">
                Also discussed at:
              </span>
              {item.alsoMentionedAt.map((moment, idx) => (
                <button
                  key={idx}
                  onClick={() => handleOpenVideo(moment.startSec)}
                  className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-lg bg-secondary hover:bg-secondary/80 border border-border text-foreground hover:border-primary/50 transition-colors"
                  title={moment.text}
                >
                  <Play className="w-2.5 h-2.5 fill-current text-primary" />
                  <span>{formatTimestamp(moment.startSec)}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bottom actions */}
        <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenVideo(item.bestStartSec)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-primary/90 flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Watch Key Moments & Transcript</span>
            </button>
          </div>

          <a
            href={item.deepLinkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            <span>Open on YouTube</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
