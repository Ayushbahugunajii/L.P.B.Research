import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import {
  WebResultItem,
  ReaderViewResponse,
  createTextFragmentLink,
  chunkWebArticle
} from '@study-search/shared';

interface SeedArticle {
  url: string;
  domain: string;
  title: string;
  content: string;
}

const SEED_ARTICLES: SeedArticle[] = [
  {
    url: 'https://jalammar.github.io/illustrated-transformer/',
    domain: 'jalammar.github.io',
    title: 'The Illustrated Transformer — Jay Alammar',
    content: `
      In this post, we will look at The Transformer – a model that uses attention to boost the speed with which these models can be trained.
      The Transformer outperforms the Google Neural Machine Translation model in specific tasks.
      The biggest benefit, however, comes from how The Transformer lends itself to parallelization.
      Let's start by looking at the model as a single black box. In a machine translation application, it would take a sentence in one language and output its translation in another.
      Popping open that black box, we see an encoding component, a decoding component, and connections between them.
      The encoding component is a stack of encoders (six of them stacked on top of each other).
      The decoding component is a stack of decoders of the same number.
      The encoders are all identical in structure (yet they do not share weights). Each one is broken down into two sub-layers: Self-Attention and a Feed-Forward Neural Network.
      The inputs first flow through a self-attention layer – a layer that helps the encoder look at other words in the input sentence as it encodes a specific word.
      The outputs of the self-attention layer are fed to a feed-forward neural network. The exact same feed-forward network is independently applied to each position.
    `
  },
  {
    url: 'https://distill.pub/2016/augmented-rnns/',
    domain: 'distill.pub',
    title: 'Attention and Augmented Recurrent Neural Networks — Distill',
    content: `
      Recurrent Neural Networks are one of the staple workhorses of deep learning.
      They allow neural networks to work with sequences of data like text, audio, and video.
      Attention is an increasingly popular mechanism that helps neural networks remember things across long contexts.
      Attention addresses the fundamental information bottleneck of standard RNNs: encoding an entire input sequence into a single fixed-length vector.
      Instead of trying to compress all information into one hidden state, attention allows the decoder to look back at all previous hidden states and assign soft weights to each.
      This attention distribution determines how much focus to place on different parts of the input sequence when generating each token.
    `
  },
  {
    url: 'https://cloud.google.com/blog/products/ai-machine-learning/what-is-vector-search',
    domain: 'cloud.google.com',
    title: 'What is Vector Search? Finding Similarities in High-Dimensional Space',
    content: `
      Vector search, also known as semantic search or similarity search, allows you to search through vast datasets based on meaning rather than exact keyword matches.
      Traditional search engines index documents by terms and use algorithms like BM25 to rank results based on term frequency and inverse document frequency.
      Vector search converts unstructured data like text, images, and audio into dense numerical vectors called embeddings using neural networks.
      Once data is represented as vectors, finding similar items becomes a geometric calculation: finding vectors that are closest to each other in high-dimensional vector space using cosine similarity, Euclidean distance, or dot product.
      To search billions of vectors in milliseconds, Approximate Nearest Neighbor (ANN) algorithms such as HNSW (Hierarchical Navigable Small World) graphs and ScaNN are used.
    `
  },
  {
    url: 'https://martinfowler.com/articles/patterns-of-distributed-systems/heartbeat.html',
    domain: 'martinfowler.com',
    title: 'HeartBeat — Patterns of Distributed Systems by Martin Fowler',
    content: `
      In distributed systems, servers need to know if other cluster nodes are operational or have crashed.
      A server cannot simply wait indefinitely for a response because networks can partition and processes can pause or fail.
      The HeartBeat pattern establishes regular periodic ping messages sent from one server to another to indicate liveness.
      If no heartbeat is received within a predetermined timeout window, the sender is assumed to have failed, triggering failover or a new leader election.
      Heartbeats can be combined with lease timers to ensure that at most one primary node executes mutations at any time.
    `
  }
];

export class WebService {
  /**
   * Searches web results, extracts passages, and creates Text Fragment links.
   * Combines curated seed articles with live Wikipedia knowledge queries.
   */
  static async searchWeb(
    query: string,
    limit = 10
  ): Promise<WebResultItem[]> {
    const qLower = query.toLowerCase();
    const queryTokens = qLower.split(/\s+/).filter(Boolean);

    const matches: WebResultItem[] = [];

    // 1. Check curated seed articles first
    for (const article of SEED_ARTICLES) {
      const passages = chunkWebArticle(article.content, {
        targetWordCount: 80,
        overlapWords: 20
      });

      let bestPassage = passages[0]?.text ?? article.content.slice(0, 200);
      let bestScore = 0;

      for (const p of passages) {
        const pLower = p.text.toLowerCase();
        let hitCount = 0;
        for (const token of queryTokens) {
          if (pLower.includes(token)) hitCount++;
        }
        const score = hitCount / Math.max(1, queryTokens.length);
        if (score > bestScore) {
          bestScore = score;
          bestPassage = p.text;
        }
      }

      // If article matches topic
      if (bestScore > 0 || article.title.toLowerCase().includes(qLower)) {
        const textFragmentUrl = createTextFragmentLink(article.url, bestPassage);
        const readerViewUrl = `/api/reader?url=${encodeURIComponent(article.url)}&q=${encodeURIComponent(query)}`;

        matches.push({
          id: Buffer.from(article.url).toString('base64url'),
          type: 'web',
          title: article.title,
          url: article.url,
          domain: article.domain,
          faviconUrl: `https://www.google.com/s2/favicons?domain=${article.domain}&sz=64`,
          highlightPassage: bestPassage,
          textFragmentUrl,
          readerViewUrl,
          score: Math.max(0.75, Math.round(bestScore * 100) / 100)
        });
      }
    }

    // 2. Fetch live Wikipedia knowledge articles if we need more results
    if (matches.length < limit && query.trim().length > 0) {
      const liveWikiArticles = await this.fetchWikipediaLive(query, limit - matches.length);
      matches.push(...liveWikiArticles);
    }

    matches.sort((a, b) => b.score - a.score);
    return matches.slice(0, limit);
  }

  private static async fetchWikipediaLive(query: string, limit = 16): Promise<WebResultItem[]> {
    try {
      const sRes = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`,
        { signal: AbortSignal.timeout(4000) }
      );
      if (!sRes.ok) return [];
      const sData = (await sRes.json()) as {
        query?: { search?: Array<{ pageid: number; title: string; snippet: string }> };
      };
      const hits = (sData.query?.search || []).slice(0, limit);
      if (hits.length === 0) return [];

      const pageIds = hits.map((h) => h.pageid).join('|');
      const pRes = await fetch(
        `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=1&explaintext=1&pageids=${pageIds}&format=json&origin=*`,
        { signal: AbortSignal.timeout(4000) }
      );
      if (!pRes.ok) return [];
      const pData = (await pRes.json()) as {
        query?: { pages?: Record<string, { pageid: number; extract?: string }> };
      };

      const items: WebResultItem[] = [];
      const qLower = query.toLowerCase();
      const popNoiseRegex = /\((song|album|film|movie|soundtrack|discography|tour|band|single|tv series|novel|manga)\)/i;

      for (const h of hits) {
        // Skip obvious pop culture pages (songs, movies, tours)
        if (popNoiseRegex.test(h.title)) continue;

        const rawExtract = pData.query?.pages?.[h.pageid]?.extract || '';
        if (!rawExtract) continue;

        const sentences = rawExtract.split(/(?<=[.?!])\s+/).filter((s) => s.length > 25);
        let bestPassage = sentences[0] ?? rawExtract.slice(0, 180);

        for (const s of sentences) {
          if (s.toLowerCase().includes(qLower)) {
            bestPassage = s;
            break;
          }
        }

        if (bestPassage.length > 240) {
          bestPassage = bestPassage.slice(0, 230) + '...';
        }

        const cleanTitle = h.title;
        const pageSlug = encodeURIComponent(cleanTitle.replace(/ /g, '_'));
        const articleUrl = `https://en.wikipedia.org/wiki/${pageSlug}`;
        const textFragmentUrl = createTextFragmentLink(articleUrl, bestPassage);
        const readerViewUrl = `/api/reader?url=${encodeURIComponent(articleUrl)}&q=${encodeURIComponent(query)}`;

        const isExactTitle = cleanTitle.toLowerCase() === qLower || cleanTitle.toLowerCase().includes(qLower);
        const score = isExactTitle ? 0.94 : 0.82;

        items.push({
          id: `wiki_${h.pageid}`,
          type: 'web',
          title: `${cleanTitle} — Wikipedia`,
          url: articleUrl,
          domain: 'en.wikipedia.org',
          faviconUrl: 'https://en.wikipedia.org/static/favicon/wikipedia.ico',
          highlightPassage: bestPassage,
          textFragmentUrl,
          readerViewUrl,
          score
        });
      }
      return items;
    } catch (err) {
      console.warn('Wikipedia live search error:', err);
      return [];
    }
  }

  /**
   * Fetches article content, extracts readable body with Readability,
   * highlights target phrase in <mark> tags, and configures smooth auto-scroll.
   */
  static async getReaderView(
    targetUrl: string,
    highlightQuery?: string
  ): Promise<ReaderViewResponse> {
    let html = '';
    let domain = '';

    try {
      const urlObj = new URL(targetUrl);
      domain = urlObj.hostname;
    } catch {
      domain = 'example.com';
    }

    // Check seed articles first
    const seed = SEED_ARTICLES.find((a) => a.url === targetUrl);
    if (seed) {
      html = `
        <!DOCTYPE html>
        <html>
          <head><title>${seed.title}</title></head>
          <body>
            <article>
              <h1>${seed.title}</h1>
              ${seed.content.split('\n\n').map((p) => `<p>${p.trim()}</p>`).join('')}
            </article>
          </body>
        </html>
      `;
    } else {
      // Fetch live URL with timeout
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);
        const res = await fetch(targetUrl, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) StudySearchEngineBot/1.0'
          }
        });
        clearTimeout(timeout);
        if (res.ok) {
          html = await res.text();
        }
      } catch {
        html = `<h1>${targetUrl}</h1><p>Content preview could not be fetched directly.</p>`;
      }
    }

    // Parse with jsdom and Readability
    const dom = new JSDOM(html, { url: targetUrl });
    const reader = new Readability(dom.window.document);
    const parsed = reader.parse();

    let contentHtml = parsed?.content ?? `<div>${html}</div>`;
    const title = parsed?.title ?? seed?.title ?? targetUrl;
    const rawText = parsed?.textContent ?? seed?.content ?? '';

    // Highlight query or passage in <mark>
    if (highlightQuery && highlightQuery.trim().length > 2) {
      const qClean = highlightQuery.trim();
      const escaped = qClean.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escaped})`, 'gi');

      let markedOnce = false;
      contentHtml = contentHtml.replace(regex, (match) => {
        if (!markedOnce) {
          markedOnce = true;
          return `<mark id="study-target-highlight" class="study-highlight" style="background-color: #fef08a; color: #854d0e; padding: 2px 6px; border-radius: 4px; font-weight: 600; box-shadow: 0 0 0 2px #facc15;">${match}</mark>`;
        }
        return `<mark class="study-highlight-secondary" style="background-color: #fef9c3; color: #713f12; padding: 1px 4px; border-radius: 2px;">${match}</mark>`;
      });
    }

    return {
      url: targetUrl,
      title,
      domain,
      byline: parsed?.byline ?? undefined,
      contentHtml,
      rawText,
      highlightTarget: highlightQuery ? { textStart: highlightQuery } : undefined
    };
  }
}
