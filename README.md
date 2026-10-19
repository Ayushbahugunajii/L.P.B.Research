# StudySearch — Deep Academic & Multimedia Search Engine

A production-grade, multimodal **Study Search Engine** engineered for students, researchers, and engineers. Instead of scrolling through hours of lecture videos or scanning lengthy PDFs, StudySearch delivers precision:

1. **Videos with Exact Key Moments**: Jumps straight to the exact second where a topic begins (similar to Google Key Moments), accompanied by an interactive synchronized transcript scrubber.
2. **Peer-Reviewed Research Papers**: Instant citation statistics, author affiliations, abstract summaries, direct open-access PDF downloads, and 1-click BibTeX citation generation.
3. **Web Articles with Passage Highlighting**: Uses native W3C Text Fragment URLs (`#:~:text=start,end`) to open target articles directly scrolled to and highlighted at the exact passage that answers your query, alongside an in-app distraction-free Reader View.

---

## 🏗 System Architecture

The project is structured as a high-performance **pnpm monorepo**:

```
study-search-engine/
├── apps/
│   ├── api/          # Fastify 5 + TypeScript 7 + TypeBox + Swagger OpenAPI (/docs)
│   ├── web/          # React 19 + Vite + Tailwind CSS v4 + Radix + Framer Motion
│   └── worker/       # BullMQ async ingestion queue processor (video, papers, web)
├── packages/
│   └── shared/       # Shared TypeBox schemas, segmenter, text fragment builder, ranking
├── nginx/            # Reverse proxy configuration (caching, gzip, rate limiting)
├── docker-compose.yml# Container orchestration (Mongo, Redis, Elasticsearch 8, API, Worker, Nginx)
├── Dockerfile        # Multi-stage non-root container build
├── ecosystem.config.cjs # PM2 cluster configuration for API & Worker
└── tsconfig.base.json# Base TypeScript 7 compiler configuration
```

---

## 🚀 Key Features

- **⚡ Fastify 5 API**: Strict schema validation using `@sinclair/typebox`, JWT & cookie session authentication, interactive OpenAPI documentation at `http://localhost:4000/docs`.
- **🔍 Hybrid Search Engine**: Reciprocal Rank Fusion (RRF) combining BM25 keyword matching with dense vector semantic embeddings in Elasticsearch 8.
- **⏱ Key Moments Video Player**: Embedded video player synced with real-time transcript scrubbing, -10s/+10s jumping, and topic match pills.
- **📄 Academic Research Cards**: Citations badge, venue tags, collapsible abstracts, and instant BibTeX export.
- **🎯 Passage Highlighting**: Automatic generation of standard browser Text Fragments and simulated smooth auto-scroll in Reader Mode.
- **⌨️ Command Palette (`⌘K` / `Ctrl+K`)**: Rapid navigation, topic exploration, type filtering, and preferences.
- **💾 Bookmarks & History**: Save papers, video moments, and article snippets locally or to MongoDB.
- **🌓 Dark / Light Themes**: High-contrast, accessibility-first theme system with Geist Mono and Inter typography.

---

## 🛠 Prerequisites

- **Node.js**: v20+ LTS or v22+
- **pnpm**: v10+ (`corepack enable pnpm`)
- **Docker & Docker Compose** (Optional, for full Elasticsearch/Mongo/Redis backend)

---

## 📦 Quick Start

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```
*(Default values in `.env` are pre-configured for local development with graceful fallbacks if databases are offline).*

### 3. Build All Packages
```bash
pnpm build
```

### 4. Run Development Servers
```bash
# Run all workspaces in parallel (API, Web, Worker):
pnpm dev

# Or run individual applications:
pnpm dev:web     # React 19 UI on http://localhost:5173
pnpm dev:api     # Fastify API on http://localhost:4000
pnpm dev:worker  # Ingestion background worker
```

---

## 🧪 Testing

```bash
# Run all Vitest unit and integration tests:
pnpm test

# Run tests in watch mode:
pnpm test:watch
```

---

## 🐳 Docker Deployment

To spin up the entire containerized production environment (including MongoDB, Redis, Elasticsearch 8, API, Worker, and Nginx reverse proxy):

```bash
docker compose up -d --build
```

- **Frontend**: `http://localhost:80`
- **API**: `http://localhost:80/api`
- **Swagger Documentation**: `http://localhost:80/docs`
