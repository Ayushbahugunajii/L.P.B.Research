import { describe, it, expect } from 'vitest';
import {
  reciprocalRankFusion,
  rankResearchPapers,
  groupVideoSegments,
  PaperRankingCandidate,
  VideoMentionCandidate
} from './ranking.js';

describe('ranking utilities', () => {
  describe('reciprocalRankFusion', () => {
    it('combines multiple rank lists using RRF scoring', () => {
      const bm25List = [
        { item: { id: 'docA', name: 'Document A' }, rank: 1 },
        { item: { id: 'docB', name: 'Document B' }, rank: 2 },
        { item: { id: 'docC', name: 'Document C' }, rank: 3 }
      ];

      const knnList = [
        { item: { id: 'docB', name: 'Document B' }, rank: 1 },
        { item: { id: 'docA', name: 'Document A' }, rank: 2 },
        { item: { id: 'docD', name: 'Document D' }, rank: 3 }
      ];

      const merged = reciprocalRankFusion([bm25List, knnList], 60);

      expect(merged.length).toBe(4);
      // Both docA and docB appear in top 2 in both lists, with equal ranks (1 & 2 vs 2 & 1) -> equal score
      expect(merged[0]!.rrfScore).toBeCloseTo(1 / 61 + 1 / 62, 4);
      expect(merged[1]!.rrfScore).toBeCloseTo(1 / 61 + 1 / 62, 4);
      // Top items should be docA and docB
      const topIds = [merged[0]!.item.id, merged[1]!.item.id];
      expect(topIds).toContain('docA');
      expect(topIds).toContain('docB');
    });
  });

  describe('rankResearchPapers', () => {
    it('ranks papers taking into account relevance, citations, and recency', () => {
      const candidates: PaperRankingCandidate[] = [
        {
          id: 'p1',
          title: 'Recent relevant paper with moderate citations',
          year: 2024,
          citationCount: 45,
          textScore: 0.95
        },
        {
          id: 'p2',
          title: 'Foundational paper from 2017 with high citations',
          year: 2017,
          citationCount: 50000,
          textScore: 0.85
        },
        {
          id: 'p3',
          title: 'Old low relevance paper',
          year: 2010,
          citationCount: 5,
          textScore: 0.2
        }
      ];

      const ranked = rankResearchPapers(candidates, 2026);
      expect(ranked.length).toBe(3);
      // p1 and p2 should both be higher than p3
      expect(ranked[0]!.paper.id).not.toBe('p3');
      expect(ranked[2]!.paper.id).toBe('p3');
      expect(ranked[0]!.finalScore).toBeGreaterThan(ranked[1]!.finalScore);
    });
  });

  describe('groupVideoSegments', () => {
    it('returns null for empty segments', () => {
      expect(groupVideoSegments([])).toBeNull();
    });

    it('identifies best segment and groups distinct timestamps', () => {
      const segments: VideoMentionCandidate[] = [
        { startSec: 120, endSec: 160, text: 'Second discussion of transformers', score: 0.72 },
        { startSec: 45, endSec: 85, text: 'Best explanation of self-attention', score: 0.94 },
        { startSec: 50, endSec: 90, text: 'Overlapping window near best match', score: 0.91 },
        { startSec: 450, endSec: 490, text: 'Later mention of attention heads', score: 0.65 }
      ];

      const grouped = groupVideoSegments(segments, 45);
      expect(grouped).not.toBeNull();
      expect(grouped?.bestStartSec).toBe(45);
      expect(grouped?.highlightSnippet).toBe('Best explanation of self-attention');
      // Overlapping window at 50s should be filtered out from alsoMentionedAt
      const secondaryStarts = grouped?.alsoMentionedAt.map((m) => m.startSec);
      expect(secondaryStarts).toContain(120);
      expect(secondaryStarts).toContain(450);
      expect(secondaryStarts).not.toContain(50);
    });
  });
});
