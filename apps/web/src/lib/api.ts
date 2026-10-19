import { SearchResponse, VideoDetailResponse } from '@study-search/shared';
import { MOCK_SEARCH_RESULTS, MOCK_VIDEO_DETAILS } from './mockData';

const API_BASE = '/api';

export async function fetchSearch(
  query: string,
  type: string = 'all',
  page: number = 1
): Promise<SearchResponse> {
  const trimmed = query.trim();
  if (!trimmed) {
    return MOCK_SEARCH_RESULTS['default']!;
  }

  try {
    const params = new URLSearchParams({
      q: trimmed,
      type,
      page: page.toString(),
      limit: '40'
    });

    const res = await fetch(`${API_BASE}/search?${params.toString()}`, {
      headers: {
        Accept: 'application/json'
      }
    });

    if (!res.ok) {
      throw new Error(`API responded with ${res.status}`);
    }

    const data: SearchResponse = await res.json();
    return data;
  } catch (error) {
    console.warn('API call failed or server offline, using local academic mock dataset:', error);

    // Fallback to rich mock dataset
    const base = MOCK_SEARCH_RESULTS['default']!;
    let filteredResults = base.results;

    if (type !== 'all') {
      filteredResults = filteredResults.filter((r) => r.type === type);
    }

    // Filter by query keywords if possible
    const lowerQ = trimmed.toLowerCase();
    const queryTokens = lowerQ.split(/\s+/).filter(Boolean);

    const queryMatches = filteredResults.filter((item) => {
      const fullText = (
        item.title +
        ' ' +
        (item.type === 'video'
          ? (item.highlightSnippet || '') + ' ' + item.channel
          : item.type === 'paper'
          ? (item.abstract || '') + ' ' + (item.authors?.map((a) => a.name).join(' ') || '')
          : (item.highlightPassage || '') + ' ' + item.domain)
      ).toLowerCase();

      return queryTokens.some((token) => fullText.includes(token));
    });

    const finalResults = queryMatches.length > 0 ? queryMatches : filteredResults;

    return {
      meta: {
        query: trimmed,
        type: type as any,
        totalHits: finalResults.length,
        page,
        limit: 20,
        tookMs: 18,
        cached: true,
        breakdown: {
          videos: finalResults.filter((r) => r.type === 'video').length,
          papers: finalResults.filter((r) => r.type === 'paper').length,
          web: finalResults.filter((r) => r.type === 'web').length
        }
      },
      results: finalResults
    };
  }
}

export async function fetchVideoDetail(videoId: string): Promise<VideoDetailResponse> {
  try {
    const res = await fetch(`${API_BASE}/videos/${videoId}/segments`);
    if (res.ok) {
      return await res.json();
    }
    const fallbackRes = await fetch(`${API_BASE}/videos/${videoId}`);
    if (fallbackRes.ok) {
      return await fallbackRes.json();
    }
    throw new Error(`Video not found: ${res.status}`);
  } catch (err) {
    console.warn(`Falling back to mock video detail for ${videoId}`, err);
    if (MOCK_VIDEO_DETAILS[videoId]) {
      return MOCK_VIDEO_DETAILS[videoId]!;
    }
    // Return synthesized video detail if not explicitly mocked
    return {
      id: videoId,
      title: 'Neural Networks & Deep Learning Key Moments Walkthrough',
      channel: 'Academic Research Media',
      durationSec: 1200,
      matchingTimestamps: [105, 205, 360, 720],
      segments: [
        { id: 's1', videoId, startSec: 0, endSec: 60, text: 'Introduction to key concepts and foundational principles.' },
        { id: 's2', videoId, startSec: 105, endSec: 200, text: 'Detailed breakdown of the core attention and backpropagation algorithm.' },
        { id: 's3', videoId, startSec: 205, endSec: 360, text: 'In-depth architectural comparison with traditional convolutional models.' },
        { id: 's4', videoId, startSec: 720, endSec: 900, text: 'Empirical benchmark results and concluding thoughts.' }
      ]
    };
  }
}
