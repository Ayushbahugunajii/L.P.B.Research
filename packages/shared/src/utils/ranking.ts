/**
 * Reciprocal Rank Fusion (RRF) algorithm for combining BM25 keyword rankings
 * and kNN dense vector rankings.
 * Standard constant k = 60 (recommended by Cormack et al. 2009).
 */
export function reciprocalRankFusion<T extends { id: string }>(
  rankLists: Array<Array<{ item: T; rank: number }>>,
  k = 60
): Array<{ item: T; rrfScore: number }> {
  const scoreMap = new Map<string, { item: T; score: number }>();

  for (const list of rankLists) {
    for (const entry of list) {
      const existing = scoreMap.get(entry.item.id);
      const contribution = 1 / (k + entry.rank);

      if (existing) {
        existing.score += contribution;
      } else {
        scoreMap.set(entry.item.id, {
          item: entry.item,
          score: contribution
        });
      }
    }
  }

  const results = Array.from(scoreMap.values()).map((v) => ({
    item: v.item,
    rrfScore: Math.round(v.score * 10000) / 10000
  }));

  // Sort descending by RRF score
  return results.sort((a, b) => b.rrfScore - a.rrfScore);
}

export interface PaperRankingCandidate {
  id: string;
  title: string;
  year: number;
  citationCount: number;
  textScore: number; // 0 to 1
}

/**
 * Multi-factor ranking for research papers:
 * Balance relevance (50%), citations (30%, log scale), and recency decay (20%).
 */
export function rankResearchPapers<T extends PaperRankingCandidate>(
  papers: T[],
  currentYear = new Date().getFullYear()
): Array<{ paper: T; finalScore: number }> {
  return papers
    .map((paper) => {
      // 1. Text relevance: base weight 0.50
      const relevanceComponent = Math.min(1, Math.max(0, paper.textScore)) * 0.5;

      // 2. Citation weight: log10 scale, normalized up to ~10,000 citations
      const logCitations = Math.log10(Math.max(0, paper.citationCount) + 1);
      const citationComponent = Math.min(1, logCitations / 4) * 0.3;

      // 3. Recency factor: exponential decay over years delta
      const yearsAgo = Math.max(0, currentYear - paper.year);
      const recencyFactor = Math.exp(-0.08 * yearsAgo); // halflife approx 8-9 years
      const recencyComponent = recencyFactor * 0.2;

      const finalScore = Math.round((relevanceComponent + citationComponent + recencyComponent) * 1000) / 1000;

      return { paper, finalScore };
    })
    .sort((a, b) => b.finalScore - a.finalScore);
}

export interface VideoMentionCandidate {
  startSec: number;
  endSec: number;
  text: string;
  score: number;
}

export interface GroupedVideoResult {
  bestStartSec: number;
  bestEndSec: number;
  highlightSnippet: string;
  alsoMentionedAt: Array<{ startSec: number; endSec: number; text: string }>;
}

/**
 * Deduplicates and groups video segment hits for a single video.
 * Selects the highest scoring segment as the primary timestamp ("bestStartSec"),
 * and groups secondary timestamps that are at least minDistanceSec apart ("Also mentioned at...").
 */
export function groupVideoSegments(
  segments: VideoMentionCandidate[],
  minDistanceSec = 45
): GroupedVideoResult | null {
  if (!segments || segments.length === 0) return null;

  // Sort by score descending to pick the best match
  const sorted = [...segments].sort((a, b) => b.score - a.score);
  const best = sorted[0]!;

  // Collect other mentions that are not overlapping with best or each other
  const secondary: Array<{ startSec: number; endSec: number; text: string }> = [];

  for (let i = 1; i < sorted.length; i++) {
    const candidate = sorted[i]!;
    const isFarFromBest = Math.abs(candidate.startSec - best.startSec) >= minDistanceSec;
    const isFarFromOthers = secondary.every(
      (m) => Math.abs(m.startSec - candidate.startSec) >= minDistanceSec
    );

    if (isFarFromBest && isFarFromOthers) {
      secondary.push({
        startSec: candidate.startSec,
        endSec: candidate.endSec,
        text: candidate.text
      });
    }

    if (secondary.length >= 4) break;
  }

  // Sort secondary mentions chronologically for user friendly display
  secondary.sort((a, b) => a.startSec - b.startSec);

  return {
    bestStartSec: best.startSec,
    bestEndSec: best.endSec,
    highlightSnippet: best.text,
    alsoMentionedAt: secondary
  };
}
