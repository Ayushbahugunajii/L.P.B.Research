import { describe, it, expect } from 'vitest';
import {
  segmentVideoCaptions,
  chunkWebArticle,
  RawCaptionCue
} from './segmenter.js';

describe('segmenter utilities', () => {
  describe('segmentVideoCaptions', () => {
    it('returns empty array when no cues provided', () => {
      expect(segmentVideoCaptions('v123', [])).toEqual([]);
    });

    it('segments consecutive cues into overlapping chunks', () => {
      const cues: RawCaptionCue[] = [
        { startSec: 0, durationSec: 10, text: 'Welcome to this deep dive into machine learning.' },
        { startSec: 10, durationSec: 15, text: 'Today we will discuss transformer self attention mechanisms.' },
        { startSec: 25, durationSec: 20, text: 'Notice how the query and key vectors compute dot products.' },
        { startSec: 45, durationSec: 15, text: 'This gives us a score matrix that gets softmax normalized.' },
        { startSec: 60, durationSec: 20, text: 'Then we multiply by values to produce the final representation.' }
      ];

      const chunks = segmentVideoCaptions('v123', cues, {
        targetDurationSec: 40,
        overlapSec: 15,
        minDurationSec: 10
      });

      expect(chunks.length).toBeGreaterThanOrEqual(2);
      expect(chunks[0]!.videoId).toBe('v123');
      expect(chunks[0]!.startSec).toBe(0);
      expect(chunks[0]!.text).toContain('Welcome to this deep dive');
      expect(chunks[0]!.text).toContain('self attention');

      // Second chunk should overlap
      expect(chunks[1]!.startSec).toBeLessThan(45);
    });
  });

  describe('chunkWebArticle', () => {
    it('returns empty array for empty string', () => {
      expect(chunkWebArticle('')).toEqual([]);
    });

    it('splits a long article into overlapping passages', () => {
      const sampleText = `
        Neural networks are computational systems loosely inspired by the biological brains of animals.
        They consist of layers of interconnected nodes or artificial neurons.
        Each connection can transmit a signal to other neurons. An artificial neuron receives signals then processes them.
        The output of each neuron is computed by some non-linear function of the sum of its inputs.
        The connections are called edges. Neurons and edges typically have a weight that adjusts as learning proceeds.
        The weight increases or decreases the strength of the signal at a connection.
        Neurons may have a threshold such that a signal is sent only if the aggregate signal crosses that threshold.
        Typically, neurons are aggregated into layers. Different layers may perform different transformations on their inputs.
        Signals travel from the first layer (the input layer) to the last layer (the output layer), possibly after traversing the layers multiple times.
      `;

      const passages = chunkWebArticle(sampleText, {
        targetWordCount: 40,
        overlapWords: 15
      });

      expect(passages.length).toBeGreaterThanOrEqual(2);
      expect(passages[0]!.passageIndex).toBe(0);
      expect(passages[0]!.text.length).toBeGreaterThan(0);
      expect(passages[0]!.wordCount).toBeGreaterThan(0);
    });
  });
});
