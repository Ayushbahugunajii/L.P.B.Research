import React, { useEffect, useState, useRef } from 'react';
import { useAppStore } from '../lib/store';
import { fetchVideoDetail } from '../lib/api';
import { VideoDetailResponse } from '@study-search/shared';
import { X, Play, Clock, Sparkles, ExternalLink, FastForward, Rewind } from 'lucide-react';
import { formatTimestamp } from '../lib/utils';

export const VideoPlayerModal: React.FC = () => {
  const { activeVideo, setActiveVideo } = useAppStore();
  const [videoData, setVideoData] = useState<VideoDetailResponse | null>(null);
  const [currentSec, setCurrentSec] = useState<number>(0);
  const [searchFilter, setSearchFilter] = useState('');
  const transcriptListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activeVideo) {
      setVideoData(null);
      return;
    }
    const initial = activeVideo.initialTimestamp ?? 0;
    setCurrentSec(initial);

    let isMounted = true;
    fetchVideoDetail(activeVideo.videoId).then((data) => {
      if (isMounted) setVideoData(data);
    });

    return () => {
      isMounted = false;
    };
  }, [activeVideo]);

  if (!activeVideo) return null;

  const seekTo = (seconds: number) => {
    setCurrentSec(seconds);
  };

  const segments = videoData?.segments || [];
  const matchingTimestamps = videoData?.matchingTimestamps || [];

  const filteredSegments = searchFilter
    ? segments.filter((s) => s.text.toLowerCase().includes(searchFilter.toLowerCase()))
    : segments;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl h-[90vh] max-h-[850px] bg-card border border-border/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-border/70 flex items-center justify-between bg-card/90">
          <div className="flex items-center gap-3 overflow-hidden">
            <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4" />
            </span>
            <div className="truncate">
              <h2 className="text-sm sm:text-base font-semibold text-foreground truncate">
                {activeVideo.title}
              </h2>
              <p className="text-xs text-muted-foreground truncate">
                {activeVideo.channel} • Synchronized Transcript & Key Moments
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <a
              href={`https://www.youtube.com/watch?v=${activeVideo.videoId}&t=${currentSec}s`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border hover:bg-secondary transition-colors"
            >
              <span>YouTube</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              onClick={() => setActiveVideo(null)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary border border-transparent hover:border-border transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Grid: Player + Transcript */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Left Column: Video Embed & Controls */}
          <div className="lg:col-span-7 xl:col-span-8 bg-black flex flex-col justify-between">
            {/* Embedded Responsive Player */}
            <div className="relative w-full aspect-video bg-zinc-950">
              <iframe
                key={`${activeVideo.videoId}-${currentSec}`}
                src={`https://www.youtube-nocookie.com/embed/${activeVideo.videoId}?start=${currentSec}&autoplay=1&rel=0&modestbranding=1`}
                title={activeVideo.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Quick Seek Scrub Bar & Key Moments */}
            <div className="p-4 bg-card border-t border-border/60">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span className="font-mono text-foreground font-semibold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  Currently at {formatTimestamp(currentSec)}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => seekTo(Math.max(0, currentSec - 10))}
                    className="flex items-center gap-1 px-2 py-1 rounded-md bg-secondary hover:bg-secondary/80 text-foreground border border-border font-mono text-xs"
                    title="Rewind 10 seconds"
                  >
                    <Rewind className="w-3 h-3" />
                    <span>-10s</span>
                  </button>
                  <button
                    onClick={() => seekTo(currentSec + 10)}
                    className="flex items-center gap-1 px-2 py-1 rounded-md bg-secondary hover:bg-secondary/80 text-foreground border border-border font-mono text-xs"
                    title="Fast forward 10 seconds"
                  >
                    <FastForward className="w-3 h-3" />
                    <span>+10s</span>
                  </button>
                </div>
              </div>

              {/* Key Moments Bar */}
              {matchingTimestamps.length > 0 && (
                <div>
                  <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Key Moments in this Video:</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {matchingTimestamps.map((sec, idx) => {
                      const isActive = Math.abs(currentSec - sec) < 20;
                      return (
                        <button
                          key={idx}
                          onClick={() => seekTo(sec)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                            isActive
                              ? 'bg-amber-500 text-black font-bold shadow-md shadow-amber-500/30 scale-105'
                              : 'bg-secondary hover:bg-secondary/80 text-foreground border border-border'
                          }`}
                        >
                          <Play className="w-2.5 h-2.5 fill-current" />
                          <span>{formatTimestamp(sec)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Synced Interactive Transcript */}
          <div className="lg:col-span-5 xl:col-span-4 border-t lg:border-t-0 lg:border-l border-border/70 flex flex-col h-full bg-secondary/10">
            {/* Transcript Search header */}
            <div className="p-3.5 border-b border-border/70 bg-card/60 backdrop-blur-xs flex items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Synced Transcript ({segments.length} segments)
              </span>
              <input
                type="text"
                placeholder="Filter transcript..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-36 text-xs px-2.5 py-1 rounded-md bg-background border border-border outline-none focus:border-primary placeholder:text-muted-foreground"
              />
            </div>

            {/* Scrollable Transcript List */}
            <div
              ref={transcriptListRef}
              className="flex-1 overflow-y-auto p-3 space-y-2 divide-y divide-border/30"
            >
              {filteredSegments.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  No transcript segments match your filter.
                </div>
              ) : (
                filteredSegments.map((segment) => {
                  const isCurrent =
                    currentSec >= segment.startSec && currentSec <= segment.endSec;
                  const isKeyMoment = matchingTimestamps.some(
                    (ts) => Math.abs(ts - segment.startSec) <= 15
                  );

                  return (
                    <div
                      key={segment.id}
                      onClick={() => seekTo(segment.startSec)}
                      className={`pt-2 p-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
                        isCurrent
                          ? 'bg-primary/15 border-l-4 border-l-primary shadow-xs'
                          : isKeyMoment
                          ? 'bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/30'
                          : 'hover:bg-secondary/60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`inline-flex items-center gap-1 font-mono text-xs font-semibold px-2 py-0.5 rounded-md ${
                            isCurrent
                              ? 'bg-primary text-white'
                              : isKeyMoment
                              ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          <Play className="w-2.5 h-2.5 fill-current" />
                          {formatTimestamp(segment.startSec)}
                        </span>
                        {isKeyMoment && (
                          <span className="text-[10px] font-semibold uppercase text-amber-500 flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" />
                            Topic Match
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-foreground/90 leading-relaxed">
                        {segment.text}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
