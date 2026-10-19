export type SearchType = 'all' | 'video' | 'paper' | 'web';

export interface SearchQueryFilters {
  dateRange?: 'all' | 'day' | 'week' | 'month' | 'year';
  duration?: 'any' | 'short' | 'medium' | 'long'; // for videos (<4m, 4-20m, >20m)
  openAccessOnly?: boolean; // for papers
  source?: string;
  sortBy?: 'relevance' | 'date' | 'citations';
}

export interface SearchQueryParams {
  q: string;
  type?: SearchType;
  page?: number;
  limit?: number;
  dateRange?: string;
  duration?: string;
  openAccessOnly?: boolean;
  sortBy?: string;
}

export interface VideoMention {
  startSec: number;
  endSec: number;
  text: string;
  score?: number;
}

export interface VideoResultItem {
  id: string; // videoId
  type: 'video';
  title: string;
  channel: string;
  channelUrl?: string;
  thumbnailUrl: string;
  durationSec: number;
  bestStartSec: number;
  bestEndSec: number;
  highlightSnippet: string;
  deepLinkUrl: string;
  alsoMentionedAt: VideoMention[];
  score: number;
  publishedAt?: string;
  viewCount?: number;
}

export interface AuthorInfo {
  name: string;
  affiliation?: string;
  authorId?: string;
}

export interface PaperResultItem {
  id: string; // DOI or paperId
  type: 'paper';
  title: string;
  authors: AuthorInfo[];
  year: number;
  abstract: string;
  highlightSnippet: string;
  citationCount: number;
  isOpenAccess: boolean;
  pdfUrl?: string;
  landingPageUrl: string;
  venue?: string;
  doi?: string;
  score: number;
}

export interface TextFragmentLink {
  fullUrl: string;
  textStart: string;
  textEnd?: string;
  prefix?: string;
  suffix?: string;
  encodedFragment: string;
}

export interface WebResultItem {
  id: string; // URL hash or id
  type: 'web';
  title: string;
  url: string;
  domain: string;
  faviconUrl?: string;
  highlightPassage: string;
  textFragmentUrl: string;
  readerViewUrl: string;
  score: number;
  publishedAt?: string;
}

export type SearchResultItem = VideoResultItem | PaperResultItem | WebResultItem;

export interface SearchMeta {
  query: string;
  type: SearchType;
  totalHits: number;
  page: number;
  limit: number;
  tookMs: number;
  cached: boolean;
  breakdown: {
    videos: number;
    papers: number;
    web: number;
  };
}

export interface SearchResponse {
  meta: SearchMeta;
  results: SearchResultItem[];
}

export interface VideoTranscriptSegment {
  id: string;
  videoId: string;
  startSec: number;
  endSec: number;
  text: string;
  score?: number;
}

export interface VideoDetailResponse {
  id: string;
  title: string;
  channel: string;
  durationSec: number;
  segments: VideoTranscriptSegment[];
  matchingTimestamps: number[];
}

export interface ReaderViewResponse {
  url: string;
  title: string;
  domain: string;
  byline?: string;
  contentHtml: string;
  rawText: string;
  highlightTarget?: {
    textStart: string;
    textEnd?: string;
    prefix?: string;
    suffix?: string;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface BookmarkItem {
  id: string;
  userId: string;
  type: 'video' | 'paper' | 'web';
  title: string;
  targetId: string;
  targetUrl: string;
  timestampSec?: number;
  snippet?: string;
  note?: string;
  folderId?: string;
  tags?: string[];
  createdAt: string;
}

export interface FolderItem {
  id: string;
  userId: string;
  name: string;
  color?: string;
  itemCount: number;
  createdAt: string;
}

export interface NoteItem {
  id: string;
  userId: string;
  bookmarkId?: string;
  title: string;
  content: string;
  updatedAt: string;
  createdAt: string;
}

export interface SearchHistoryItem {
  id: string;
  userId: string;
  query: string;
  type: SearchType;
  filters?: SearchQueryFilters;
  searchedAt: string;
}
