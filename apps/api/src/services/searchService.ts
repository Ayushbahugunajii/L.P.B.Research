import { Client } from '@elastic/elasticsearch';
import {
  SearchType,
  SearchQueryParams,
  SearchResponse,
  SearchResultItem
} from '@study-search/shared';
import { VideoService } from './videoService.js';
import { PaperService } from './paperService.js';
import { WebService } from './webService.js';
import { SearchHistoryModel } from '../models/SearchHistory.js';
import mongoose from 'mongoose';

export class SearchService {
  /**
   * Executes multi-source unified search across Videos, Papers, and Web Articles.
   */
  static async search(
    params: SearchQueryParams,
    elastic: Client | null,
    userId?: string
  ): Promise<SearchResponse> {
    const startTime = Date.now();
    const query = params.q.trim();
    const type: SearchType = params.type ?? 'all';
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;

    let videoResults: SearchResultItem[] = [];
    let paperResults: SearchResultItem[] = [];
    let webResults: SearchResultItem[] = [];

    // Save search history asynchronously if user is logged in
    if (userId && mongoose.connection.readyState === 1) {
      SearchHistoryModel.create({
        userId: new mongoose.Types.ObjectId(userId),
        query,
        type,
        filters: {
          dateRange: params.dateRange,
          duration: params.duration,
          openAccessOnly: params.openAccessOnly,
          sortBy: params.sortBy
        }
      }).catch(() => {
        // non-blocking
      });
    }

    if (type === 'all' || type === 'video') {
      const vLimit = type === 'video' ? limit : Math.max(12, Math.ceil(limit / 2));
      videoResults = await VideoService.searchVideos(query, elastic, vLimit);
    }

    if (type === 'all' || type === 'paper') {
      const pLimit = type === 'paper' ? limit : Math.max(16, Math.ceil(limit / 2));
      paperResults = await PaperService.searchPapers(query, elastic, pLimit);
    }

    if (type === 'all' || type === 'web') {
      const wLimit = type === 'web' ? limit : Math.max(12, Math.ceil(limit / 2));
      webResults = await WebService.searchWeb(query, wLimit);
    }

    let combined: SearchResultItem[] = [];

    if (type === 'all') {
      // Interleave results for a rich, dynamic study experience:
      // Video (with best timestamp) -> Paper (with abstract/cite) -> Web (with passage jump)
      const maxLen = Math.max(videoResults.length, paperResults.length, webResults.length);
      for (let i = 0; i < maxLen; i++) {
        if (videoResults[i]) combined.push(videoResults[i]!);
        if (paperResults[i]) combined.push(paperResults[i]!);
        if (webResults[i]) combined.push(webResults[i]!);
      }
    } else if (type === 'video') {
      combined = videoResults;
    } else if (type === 'paper') {
      combined = paperResults;
    } else if (type === 'web') {
      combined = webResults;
    }

    // Pagination slice
    const startIndex = (page - 1) * limit;
    const paginatedResults = combined.slice(startIndex, startIndex + limit);

    const tookMs = Date.now() - startTime;

    return {
      meta: {
        query,
        type,
        totalHits: combined.length,
        page,
        limit,
        tookMs,
        cached: false,
        breakdown: {
          videos: videoResults.length,
          papers: paperResults.length,
          web: webResults.length
        }
      },
      results: paginatedResults
    };
  }
}
