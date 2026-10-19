import { SearchResponse, VideoDetailResponse } from '@study-search/shared';

export const SUGGESTED_TOPICS = [
  'Attention Is All You Need',
  'Neural Networks Backpropagation',
  'Raft Consensus Distributed Systems',
  'Vector Search HNSW',
  'Virtual Memory Paging OS',
  'LLaMA Open Foundation Models'
];

export const MOCK_SEARCH_RESULTS: Record<string, SearchResponse> = {
  default: {
    meta: {
      query: 'Attention Is All You Need',
      type: 'all',
      totalHits: 6,
      page: 1,
      limit: 20,
      tookMs: 42,
      cached: false,
      breakdown: {
        videos: 2,
        papers: 2,
        web: 2
      }
    },
    results: [
      {
        id: 'wjZofJX0v4U',
        type: 'video',
        title: 'Attention Is All You Need — Transformer Architecture Deep Dive',
        channel: 'Yannic Kilcher',
        channelUrl: 'https://youtube.com/@ykilcher',
        thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=640&q=80',
        durationSec: 2480,
        bestStartSec: 105,
        bestEndSec: 180,
        highlightSnippet:
          'The central insight of transformers is self-attention, replacing recurrence completely with parallel dot-product operations.',
        deepLinkUrl: 'https://www.youtube.com/watch?v=wjZofJX0v4U&t=105s',
        alsoMentionedAt: [
          {
            startSec: 180,
            endSec: 270,
            text: 'Scaled Dot-Product Attention: queries Q and keys K scaled by sqrt(d_k) with softmax.'
          },
          {
            startSec: 270,
            endSec: 365,
            text: 'Multi-Head Attention allows the model to jointly attend to multiple representation subspaces.'
          },
          {
            startSec: 760,
            endSec: 845,
            text: 'Masked multi-head attention in the decoder prevents attending to subsequent positions.'
          }
        ],
        score: 0.98,
        publishedAt: '2023-01-15',
        viewCount: 420000
      },
      {
        id: '10.48550/arXiv.1706.03762',
        type: 'paper',
        title: 'Attention Is All You Need',
        authors: [
          { name: 'Ashish Vaswani', affiliation: 'Google Brain' },
          { name: 'Noam Shazeer', affiliation: 'Google Brain' },
          { name: 'Niki Parmar', affiliation: 'Google Research' },
          { name: 'Jakob Uszkoreit', affiliation: 'Google Brain' },
          { name: 'Llion Jones', affiliation: 'Google Research' },
          { name: 'Aidan N. Gomez', affiliation: 'Univ. of Toronto' }
        ],
        year: 2017,
        abstract:
          'The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely. Experiments on two machine translation tasks show these models to be superior in quality while being more parallelizable and requiring significantly less time to train.',
        highlightSnippet:
          'We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely.',
        citationCount: 114250,
        isOpenAccess: true,
        pdfUrl: 'https://arxiv.org/pdf/1706.03762.pdf',
        landingPageUrl: 'https://arxiv.org/abs/1706.03762',
        venue: 'NeurIPS 2017',
        doi: '10.48550/arXiv.1706.03762',
        score: 0.99
      },
      {
        id: 'web_illustrated_transformer',
        type: 'web',
        title: 'The Illustrated Transformer — Jay Alammar',
        url: 'https://jalammar.github.io/illustrated-transformer/',
        domain: 'jalammar.github.io',
        faviconUrl: 'https://www.google.com/s2/favicons?domain=jalammar.github.io&sz=64',
        highlightPassage:
          'The inputs first flow through a self-attention layer – a layer that helps the encoder look at other words in the input sentence as it encodes a specific word. The outputs of the self-attention layer are fed to a feed-forward neural network.',
        textFragmentUrl:
          'https://jalammar.github.io/illustrated-transformer/#:~:text=The%20inputs%20first%20flow,feed%2Dforward%20neural%20network.',
        readerViewUrl:
          '/reader?url=https%3A%2F%2Fjalammar.github.io%2Fillustrated-transformer%2F&textStart=The%20inputs%20first%20flow',
        score: 0.95,
        publishedAt: '2018-06-27'
      },
      {
        id: 'aircAruvnKk',
        type: 'video',
        title: 'Neural Networks and Deep Learning — Chapter 1: But what is a neural network?',
        channel: '3Blue1Brown',
        channelUrl: 'https://youtube.com/@3blue1brown',
        thumbnailUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=640&q=80',
        durationSec: 1152,
        bestStartSec: 205,
        bestEndSec: 300,
        highlightSnippet:
          'Hidden layers detect edges, strokes, and sub-components of digits through weighted sums and biases passed through activation functions.',
        deepLinkUrl: 'https://www.youtube.com/watch?v=aircAruvnKk&t=205s',
        alsoMentionedAt: [
          {
            startSec: 300,
            endSec: 380,
            text: 'The activation function, like sigmoid or ReLU, squashes real-valued inputs into non-linear outputs.'
          },
          {
            startSec: 645,
            endSec: 755,
            text: 'Gradient descent and backpropagation: how weights update to minimize the cost function.'
          }
        ],
        score: 0.91,
        publishedAt: '2022-09-10',
        viewCount: 15200000
      },
      {
        id: '10.48550/arXiv.2005.14165',
        type: 'paper',
        title: 'Language Models are Few-Shot Learners (GPT-3)',
        authors: [
          { name: 'Tom B. Brown', affiliation: 'OpenAI' },
          { name: 'Benjamin Mann', affiliation: 'OpenAI' },
          { name: 'Nick Ryder', affiliation: 'OpenAI' },
          { name: 'Dario Amodei', affiliation: 'OpenAI' }
        ],
        year: 2020,
        abstract:
          'Recent work has demonstrated substantial gains on many NLP tasks and benchmarks by pre-training on a large corpus of text followed by fine-tuning on a specific task. While typically task-agnostic in architecture, this method still requires task-specific fine-tuning datasets of thousands or tens of thousands of examples. Here we show that scaling up language models greatly improves task-agnostic, few-shot performance, sometimes even reaching competitiveness with prior state-of-the-art fine-tuning approaches.',
        highlightSnippet:
          'Here we show that scaling up language models greatly improves task-agnostic, few-shot performance, reaching competitiveness with prior fine-tuning.',
        citationCount: 38200,
        isOpenAccess: true,
        pdfUrl: 'https://arxiv.org/pdf/2005.14165.pdf',
        landingPageUrl: 'https://arxiv.org/abs/2005.14165',
        venue: 'NeurIPS 2020',
        doi: '10.48550/arXiv.2005.14165',
        score: 0.92
      },
      {
        id: 'web_augmented_rnns',
        type: 'web',
        title: 'Attention and Augmented Recurrent Neural Networks — Distill',
        url: 'https://distill.pub/2016/augmented-rnns/',
        domain: 'distill.pub',
        faviconUrl: 'https://www.google.com/s2/favicons?domain=distill.pub&sz=64',
        highlightPassage:
          'Attention addresses the fundamental information bottleneck of standard RNNs: encoding an entire input sequence into a single fixed-length vector. Instead, attention allows the decoder to look back at all previous hidden states.',
        textFragmentUrl:
          'https://distill.pub/2016/augmented-rnns/#:~:text=Attention%20addresses%20the%20fundamental,previous%20hidden%20states.',
        readerViewUrl:
          '/reader?url=https%3A%2F%2Fdistill.pub%2F2016%2Faugmented-rnns%2F&textStart=Attention%20addresses%20the%20fundamental',
        score: 0.88,
        publishedAt: '2016-09-08'
      },
      {
        id: 'kCc8FmEb1nY',
        type: 'video',
        title: 'Building microservices: Distributed Systems consensus and Raft algorithm',
        channel: 'MIT 6.824 Distributed Systems',
        channelUrl: 'https://youtube.com/@mitocw',
        thumbnailUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=640&q=80',
        durationSec: 4920,
        bestStartSec: 150,
        bestEndSec: 260,
        highlightSnippet:
          'Raft divides consensus into three sub-problems: Leader election, Log replication, and Safety invariants.',
        deepLinkUrl: 'https://www.youtube.com/watch?v=kCc8FmEb1nY&t=150s',
        alsoMentionedAt: [
          {
            startSec: 260,
            endSec: 380,
            text: 'Leader election uses randomized election timeouts so split votes are quickly resolved.'
          },
          {
            startSec: 580,
            endSec: 720,
            text: 'Log replication: the leader broadcasts AppendEntries RPCs to all followers.'
          }
        ],
        score: 0.95,
        publishedAt: '2023-04-12',
        viewCount: 680000
      },
      {
        id: '10.1145/2673577.2673587',
        type: 'paper',
        title: 'In Search of an Understandable Consensus Algorithm (Raft)',
        authors: [
          { name: 'Diego Ongaro', affiliation: 'Stanford University' },
          { name: 'John Ousterhout', affiliation: 'Stanford University' }
        ],
        year: 2014,
        abstract:
          'Raft is a consensus algorithm for managing a replicated log. It produces a result equivalent to Paxos, but separates leader election, log replication, and safety to make fault-tolerant systems easier to understand and build.',
        highlightSnippet:
          'Raft separates the key elements of consensus, such as leader election, log replication, and safety, making fault-tolerant systems easier to understand and implement.',
        citationCount: 4200,
        isOpenAccess: true,
        pdfUrl: 'https://raft.github.io/raft.pdf',
        landingPageUrl: 'https://raft.github.io/',
        venue: 'USENIX ATC 2014',
        doi: '10.1145/2673577.2673587',
        score: 0.96
      },
      {
        id: 'web_heartbeat_patterns',
        type: 'web',
        title: 'HeartBeat — Patterns of Distributed Systems by Martin Fowler',
        url: 'https://martinfowler.com/articles/patterns-of-distributed-systems/heartbeat.html',
        domain: 'martinfowler.com',
        faviconUrl: 'https://www.google.com/s2/favicons?domain=martinfowler.com&sz=64',
        highlightPassage:
          'The HeartBeat pattern establishes regular periodic ping messages sent from one server to another to indicate liveness. If no heartbeat is received within a predetermined timeout window, the sender is assumed to have failed.',
        textFragmentUrl:
          'https://martinfowler.com/articles/patterns-of-distributed-systems/heartbeat.html#:~:text=The%20HeartBeat%20pattern,assumed%20to%20have%20failed.',
        readerViewUrl:
          '/reader?url=https%3A%2F%2Fmartinfowler.com%2Farticles%2Fpatterns-of-distributed-systems%2Fheartbeat.html&textStart=The%20HeartBeat%20pattern',
        score: 0.93,
        publishedAt: '2021-03-15'
      },
      {
        id: 'bX3qC3p2T6c',
        type: 'video',
        title: 'Operating Systems: Virtual Memory, Paging, and Page Faults',
        channel: 'Computerphile',
        channelUrl: 'https://youtube.com/@computerphile',
        thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=640&q=80',
        durationSec: 940,
        bestStartSec: 100,
        bestEndSec: 180,
        highlightSnippet:
          'Paging: physical RAM is split into 4KB page frames, and virtual space is split into matching pages managed by the MMU.',
        deepLinkUrl: 'https://www.youtube.com/watch?v=bX3qC3p2T6c&t=100s',
        alsoMentionedAt: [
          {
            startSec: 180,
            endSec: 270,
            text: 'The MMU uses page tables and the TLB for hardware caching.'
          },
          {
            startSec: 320,
            endSec: 395,
            text: 'When a page is not present in RAM, a Page Fault exception fires.'
          }
        ],
        score: 0.92,
        publishedAt: '2023-08-01',
        viewCount: 890000
      },
      {
        id: 'web_vector_search_hnsw',
        type: 'web',
        title: 'What is Vector Search? Finding Similarities in High-Dimensional Space',
        url: 'https://cloud.google.com/blog/products/ai-machine-learning/what-is-vector-search',
        domain: 'cloud.google.com',
        faviconUrl: 'https://www.google.com/s2/favicons?domain=cloud.google.com&sz=64',
        highlightPassage:
          'Vector search converts unstructured data into dense numerical vectors called embeddings. Finding similar items becomes a geometric calculation in high-dimensional vector space using cosine similarity, dot product, and HNSW graphs.',
        textFragmentUrl:
          'https://cloud.google.com/blog/products/ai-machine-learning/what-is-vector-search#:~:text=Vector%20search%20converts,and%20HNSW%20graphs.',
        readerViewUrl:
          '/reader?url=https%3A%2F%2Fcloud.google.com%2Fblog%2Fproducts%2Fai-machine-learning%2Fwhat-is-vector-search&textStart=Vector%20search%20converts',
        score: 0.94,
        publishedAt: '2023-05-18'
      },
      {
        id: '10.48550/arXiv.2302.13971',
        type: 'paper',
        title: 'LLaMA: Open and Efficient Foundation Language Models',
        authors: [
          { name: 'Hugo Touvron', affiliation: 'Meta AI' },
          { name: 'Thibaut Lavril', affiliation: 'Meta AI' },
          { name: 'Gautier Izacard', affiliation: 'Meta AI' }
        ],
        year: 2023,
        abstract:
          'We introduce LLaMA, a collection of foundation language models ranging from 7B to 65B parameters. LLaMA-13B outperforms GPT-3 on most benchmarks while being significantly smaller and more efficient.',
        highlightSnippet:
          'LLaMA-13B outperforms GPT-3 (175B) on most benchmarks, demonstrating that smaller models trained on more tokens achieve superior efficiency.',
        citationCount: 16500,
        isOpenAccess: true,
        pdfUrl: 'https://arxiv.org/pdf/2302.13971.pdf',
        landingPageUrl: 'https://arxiv.org/abs/2302.13971',
        venue: 'arXiv preprint',
        doi: '10.48550/arXiv.2302.13971',
        score: 0.95
      }
    ]
  }
};

export const MOCK_VIDEO_DETAILS: Record<string, VideoDetailResponse> = {
  wjZofJX0v4U: {
    id: 'wjZofJX0v4U',
    title: 'Attention Is All You Need — Transformer Architecture Deep Dive',
    channel: 'Yannic Kilcher',
    durationSec: 2480,
    matchingTimestamps: [105, 180, 270, 760],
    segments: [
      {
        id: 's0',
        videoId: 'wjZofJX0v4U',
        startSec: 0,
        endSec: 45,
        text: 'Welcome to this paper walkthrough of Attention Is All You Need by Vaswani et al.'
      },
      {
        id: 's1',
        videoId: 'wjZofJX0v4U',
        startSec: 45,
        endSec: 105,
        text: 'The traditional sequence to sequence model relies on recurrence and LSTMs with sequential computation bottlenecks.'
      },
      {
        id: 's2',
        videoId: 'wjZofJX0v4U',
        startSec: 105,
        endSec: 180,
        text: 'The central insight of transformers is self-attention, replacing recurrence completely with parallel dot-product operations.'
      },
      {
        id: 's3',
        videoId: 'wjZofJX0v4U',
        startSec: 180,
        endSec: 270,
        text: 'Scaled Dot-Product Attention: we take queries Q and keys K, multiply them, scale by square root of d_k, and apply softmax.'
      },
      {
        id: 's4',
        videoId: 'wjZofJX0v4U',
        startSec: 270,
        endSec: 365,
        text: 'Multi-Head Attention allows the model to jointly attend to information from different representation subspaces at different positions.'
      },
      {
        id: 's5',
        videoId: 'wjZofJX0v4U',
        startSec: 365,
        endSec: 445,
        text: 'Positional encodings are added to the input embeddings to provide token order information since transformers have no recurrence.'
      },
      {
        id: 's6',
        videoId: 'wjZofJX0v4U',
        startSec: 760,
        endSec: 845,
        text: 'Also notice how the decoder uses masked multi-head attention to prevent positions from attending to subsequent positions.'
      },
      {
        id: 's7',
        videoId: 'wjZofJX0v4U',
        startSec: 1540,
        endSec: 1630,
        text: 'Empirical results: on WMT 2014 English-to-German translation, the transformer achieves state of the art BLEU score of 28.4.'
      }
    ]
  },
  kCc8FmEb1nY: {
    id: 'kCc8FmEb1nY',
    title: 'Building microservices: Distributed Systems consensus and Raft algorithm',
    channel: 'MIT 6.824 Distributed Systems',
    durationSec: 4920,
    matchingTimestamps: [150, 260, 580, 1240],
    segments: [
      { id: 'rs0', videoId: 'kCc8FmEb1nY', startSec: 0, endSec: 60, text: 'Welcome to MIT 6.824 lecture on Fault-Tolerant Consensus using the Raft protocol.' },
      { id: 'rs1', videoId: 'kCc8FmEb1nY', startSec: 60, endSec: 150, text: 'The core challenge in distributed state machines is achieving agreement among replicas when network partitions occur.' },
      { id: 'rs2', videoId: 'kCc8FmEb1nY', startSec: 150, endSec: 260, text: 'Raft divides consensus into three sub-problems: Leader election, Log replication, and Safety invariants.' },
      { id: 'rs3', videoId: 'kCc8FmEb1nY', startSec: 260, endSec: 580, text: 'Leader election uses randomized election timeouts so split votes are quickly resolved.' },
      { id: 'rs4', videoId: 'kCc8FmEb1nY', startSec: 580, endSec: 1240, text: 'Log replication: the leader appends client commands and broadcasts AppendEntries RPCs to all followers.' }
    ]
  },
  bX3qC3p2T6c: {
    id: 'bX3qC3p2T6c',
    title: 'Operating Systems: Virtual Memory, Paging, and Page Faults',
    channel: 'Computerphile',
    durationSec: 940,
    matchingTimestamps: [100, 180, 320, 480],
    segments: [
      { id: 'vs0', videoId: 'bX3qC3p2T6c', startSec: 0, endSec: 40, text: 'Virtual memory is one of the most brilliant abstractions in computer systems.' },
      { id: 'vs1', videoId: 'bX3qC3p2T6c', startSec: 40, endSec: 100, text: 'Processes believe they own a contiguous block of address space from zero to 2 to the 64th.' },
      { id: 'vs2', videoId: 'bX3qC3p2T6c', startSec: 100, endSec: 180, text: 'Paging: physical RAM is split into 4KB page frames, and virtual space is split into matching pages.' },
      { id: 'vs3', videoId: 'bX3qC3p2T6c', startSec: 180, endSec: 320, text: 'The Memory Management Unit (MMU) uses page tables and the TLB for hardware caching.' },
      { id: 'vs4', videoId: 'bX3qC3p2T6c', startSec: 320, endSec: 480, text: 'When a page is not present in RAM, a Page Fault exception fires, trapping into OS kernel space.' }
    ]
  },
  aircAruvnKk: {
    id: 'aircAruvnKk',
    title: 'Neural Networks and Deep Learning — Chapter 1: But what is a neural network?',
    channel: '3Blue1Brown',
    durationSec: 1152,
    matchingTimestamps: [120, 205, 300, 645],
    segments: [
      { id: 'ns0', videoId: 'aircAruvnKk', startSec: 0, endSec: 50, text: 'What is a neural network? Let us break down how neurons connect and pass activations.' },
      { id: 'ns1', videoId: 'aircAruvnKk', startSec: 50, endSec: 120, text: 'Imagine recognizing handwritten digits 0 through 9 from a 28 by 28 pixel grid.' },
      { id: 'ns2', videoId: 'aircAruvnKk', startSec: 120, endSec: 205, text: 'Each pixel becomes an input neuron with an activation value between 0.0 and 1.0.' },
      { id: 'ns3', videoId: 'aircAruvnKk', startSec: 205, endSec: 300, text: 'Hidden layers detect edges, strokes, and sub-components through weighted sums and biases.' },
      { id: 'ns4', videoId: 'aircAruvnKk', startSec: 300, endSec: 645, text: 'The activation function, like sigmoid or ReLU, squashes real-valued inputs into non-linear outputs.' },
      { id: 'ns5', videoId: 'aircAruvnKk', startSec: 645, endSec: 890, text: 'Gradient descent and backpropagation: how weights update to minimize the cost function.' }
    ]
  }
};
