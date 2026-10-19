export interface RawCaptionCue {
  startSec: number;
  durationSec: number;
  text: string;
}

export interface VideoSegmentChunk {
  videoId: string;
  startSec: number;
  endSec: number;
  text: string;
}

export interface SegmenterOptions {
  targetDurationSec?: number; // default: 45s
  overlapSec?: number;        // default: 15s
  minDurationSec?: number;    // default: 10s
}

/**
 * Splits raw video caption cues into overlapping chunks (30-60s) for passage-level indexing.
 */
export function segmentVideoCaptions(
  videoId: string,
  cues: RawCaptionCue[],
  options: SegmenterOptions = {}
): VideoSegmentChunk[] {
  if (!cues || cues.length === 0) return [];

  const targetDuration = options.targetDurationSec ?? 45;
  const overlap = options.overlapSec ?? 15;
  const step = Math.max(5, targetDuration - overlap);

  // Sort cues by start timestamp
  const sortedCues = [...cues].sort((a, b) => a.startSec - b.startSec);
  const totalEnd = sortedCues[sortedCues.length - 1]!.startSec + sortedCues[sortedCues.length - 1]!.durationSec;

  const chunks: VideoSegmentChunk[] = [];
  let currentWindowStart = sortedCues[0]!.startSec;

  while (currentWindowStart < totalEnd) {
    const currentWindowEnd = currentWindowStart + targetDuration;

    // Collect all cues that overlap with this window
    const windowCues = sortedCues.filter((cue) => {
      const cueEnd = cue.startSec + cue.durationSec;
      return cue.startSec < currentWindowEnd && cueEnd > currentWindowStart;
    });

    if (windowCues.length > 0) {
      const actualStart = Math.max(0, Math.round(windowCues[0]!.startSec));
      const lastCue = windowCues[windowCues.length - 1]!;
      const actualEnd = Math.round(lastCue.startSec + lastCue.durationSec);

      const combinedText = windowCues
        .map((c) => c.text.trim())
        .filter((t) => t.length > 0)
        .join(' ')
        .replace(/\s+/g, ' ');

      if (combinedText.length > 0 && actualEnd - actualStart >= (options.minDurationSec ?? 5)) {
        chunks.push({
          videoId,
          startSec: actualStart,
          endSec: actualEnd,
          text: combinedText
        });
      }
    }

    currentWindowStart += step;
  }

  return chunks;
}

export interface WebPassageChunk {
  passageIndex: number;
  text: string;
  wordCount: number;
  charStart: number;
  charEnd: number;
}

export interface WebChunkerOptions {
  targetWordCount?: number; // default: 120
  overlapWords?: number;    // default: 30
}

/**
 * Splits web article text into overlapping passages respecting sentence boundaries.
 */
export function chunkWebArticle(
  text: string,
  options: WebChunkerOptions = {}
): WebPassageChunk[] {
  const clean = text.replace(/\r\n/g, '\n').replace(/\n{2,}/g, '\n\n').trim();
  if (!clean) return [];

  const targetWords = options.targetWordCount ?? 120;
  const overlap = options.overlapWords ?? 30;
  const step = Math.max(20, targetWords - overlap);

  // Split into sentences (rudimentary punctuation match without destroying decimals)
  const sentences = clean.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || [clean];
  const passages: WebPassageChunk[] = [];

  let currentWords: string[] = [];
  let currentSentences: string[] = [];
  let charTracker = 0;

  for (const sentence of sentences) {
    const sentenceWords = sentence.trim().split(/\s+/).filter(Boolean);
    currentWords.push(...sentenceWords);
    currentSentences.push(sentence);

    if (currentWords.length >= targetWords) {
      const passageText = currentSentences.join('').trim();
      passages.push({
        passageIndex: passages.length,
        text: passageText,
        wordCount: currentWords.length,
        charStart: charTracker,
        charEnd: charTracker + passageText.length
      });

      // Slide window by step words
      const wordsToKeep = currentWords.slice(step);
      currentWords = wordsToKeep;

      // Approximate sentence overlap retention
      const halfSentences = Math.max(1, Math.floor(currentSentences.length / 2));
      currentSentences = currentSentences.slice(halfSentences);
      charTracker += passageText.length;
    }
  }

  // Push trailing sentences if any remain
  if (currentSentences.length > 0 && currentWords.length > 15) {
    const trailingText = currentSentences.join('').trim();
    passages.push({
      passageIndex: passages.length,
      text: trailingText,
      wordCount: currentWords.length,
      charStart: charTracker,
      charEnd: charTracker + trailingText.length
    });
  }

  return passages;
}
