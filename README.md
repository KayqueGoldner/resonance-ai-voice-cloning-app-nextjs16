<p align="center">
  <h1 align="center">🎙️ Resonance</h1>
  <p align="center">A production-ready AI voice cloning & text-to-speech SaaS platform built on Next.js 16, powered by Chatterbox TTS running on Modal GPU infrastructure.</p>
</p>

<p align="center">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16.1.6-black?style=flat-square&logo=next.js" />
  <img alt="React" src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript" />
  <img alt="Prisma" src="https://img.shields.io/badge/Prisma-7-2D3748?style=flat-square&logo=prisma" />
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss" />
</p>

---

## 📖 Overview

**Resonance** is a full-stack AI-powered voice cloning and text-to-speech (TTS) SaaS application. Users can clone voices from audio samples and generate lifelike speech from any text — all managed through a polished, multi-tenant dashboard.

The platform integrates a custom **[Chatterbox TTS](https://github.com/resemble-ai/chatterbox)** inference service deployed on **Modal** (serverless GPU infrastructure), with file storage on **Cloudflare R2**, authentication via **Clerk**, usage-based billing via **Polar**, and full observability with **Sentry**.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🗣️ **Voice Cloning** | Upload a reference audio sample to create a custom cloned voice |
| 📝 **Text-to-Speech** | Generate high-quality WAV audio from text using any system or custom voice |
| 🎛️ **Fine-grained Controls** | Tune `temperature`, `top_p`, `top_k`, and `repetition_penalty` per generation |
| 📚 **Generation History** | Browse, replay, and manage all past TTS generations per organization |
| 🗂️ **Voice Library** | Manage a library of custom and system-provided voices with categories & language tags |
| 🔐 **Multi-Tenant Auth** | Clerk-powered authentication with organization-level data isolation |
| 💳 **Usage-Based Billing** | Polar integration: subscription checkout, customer portal, and per-character metering |
| ☁️ **Serverless GPU** | Chatterbox TTS runs on Modal A10G GPUs — scales to zero when idle |
| 🔭 **Observability** | Sentry error tracking and logging with tRPC middleware integration |
| 📡 **Type-Safe API** | End-to-end type safety with tRPC v11 + TanStack Query v5 |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│                  Next.js 16 App                 │
│  ┌────────────┐  ┌─────────┐  ┌─────────────┐  │
│  │  Dashboard │  │  Voices │  │Text-to-Speech│  │
│  │  (sidebar) │  │  CRUD   │  │  Generator   │  │
│  └────────────┘  └─────────┘  └─────────────┘  │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │          tRPC v11 API Layer               │   │
│  │  generationsRouter | voicesRouter |       │   │
│  │  billingRouter                            │   │
│  └──────────────────────────────────────────┘   │
└─────────────────┬───────────────────────────────┘
                  │
     ┌────────────┼────────────────────┐
     │            │                    │
     ▼            ▼                    ▼
┌─────────┐  ┌──────────┐       ┌──────────────┐
│PostgreSQL│  │Cloudflare│       │  Modal.com   │
│(Prisma)  │  │  R2      │       │  Chatterbox  │
│Voices    │  │Audio WAV │       │  TTS API     │
│Generations│  │Storage   │       │  (A10G GPU)  │
└─────────┘  └──────────┘       └──────────────┘
     │                                  │
     └─── Clerk Auth ────────────────── ┘
          Polar Billing
          Sentry Monitoring
```

### Key Architectural Decisions

- **App Router** — Uses Next.js 15+ App Router with React Server Components, Server Actions are handled via tRPC mutations.
- **Organization-scoped data** — Every DB query is scoped by Clerk `orgId`, enforced in a dedicated `orgProcedure` tRPC middleware.
- **Audio storage** — Generated WAV files are stored in Cloudflare R2 and served via signed pre-authenticated URLs (1 h TTL) through a dedicated `/api/audio/[generationId]` route handler.
- **Voice files** — Custom voice samples are uploaded directly to R2 via `/api/voices/create`, then mounted read-only on Modal for inference.
- **GPU inference** — The Chatterbox model is deployed as a persistent Modal class, cached across requests, and scales down automatically after 5 minutes of inactivity.
- **Billing** — Polar tracks usage events (`tts_generation`) with `characters` metadata, enabling per-character metered billing.

---

## 🗂️ Project Structure

```
resonance-ai-voice-cloning-app-nextjs16/
├── chatterbox_tts.py           # Modal GPU deployment — Chatterbox TTS microservice
├── prisma/
│   ├── schema.prisma           # Database schema (Voice, Generation models)
│   └── migrations/             # Prisma migration history
├── scripts/
│   └── sync-api.ts             # OpenAPI → TypeScript types sync script
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (dashboard)/        # Protected dashboard route group
│   │   │   ├── layout.tsx      # Sidebar layout
│   │   │   ├── page.tsx        # Dashboard home
│   │   │   ├── text-to-speech/ # TTS generation page
│   │   │   └── voices/         # Voice library page
│   │   ├── api/
│   │   │   ├── audio/[generationId]/   # Signed audio streaming
│   │   │   ├── trpc/           # tRPC HTTP handler
│   │   │   └── voices/         # Voice upload handler
│   │   ├── sign-in/            # Clerk sign-in page
│   │   ├── sign-up/            # Clerk sign-up page
│   │   └── org-selection/      # Clerk org switcher page
│   ├── components/
│   │   ├── ui/                 # shadcn/ui component library
│   │   ├── voice-avatar/       # DiceBear avatar component
│   │   └── page-header.tsx     # Shared page header
│   ├── features/               # Feature-sliced modules
│   │   ├── billing/            # Subscription & portal components
│   │   ├── dashboard/          # Sidebar & navigation
│   │   ├── text-to-speech/     # TTS form, generation list, audio player
│   │   └── voices/             # Voice library, upload, management
│   ├── hooks/                  # Shared React hooks
│   ├── lib/
│   │   ├── chatterbox-client.ts # openapi-fetch client for Chatterbox API
│   │   ├── db.ts               # Prisma client singleton
│   │   ├── env.ts              # Type-safe env vars (@t3-oss/env-nextjs)
│   │   ├── polar.ts            # Polar billing client
│   │   ├── r2.ts               # Cloudflare R2 / S3 client helpers
│   │   └── utils.ts            # Shared utilities (cn, etc.)
│   ├── trpc/
│   │   ├── init.ts             # tRPC context, middleware, procedures
│   │   ├── client.tsx          # React client provider
│   │   ├── server.tsx          # Server-side caller
│   │   └── routers/
│   │       ├── _app.ts         # Root router
│   │       ├── billing.ts      # Checkout & subscription management
│   │       ├── generations.ts  # TTS generation CRUD + Chatterbox calls
│   │       └── voices.ts       # Voice CRUD
│   └── types/                  # Shared TypeScript types
├── sentry.server.config.ts     # Sentry server-side config
├── sentry.edge.config.ts       # Sentry edge runtime config
├── next.config.ts              # Next.js + Sentry build config
├── prisma.config.ts            # Prisma CLI config
└── components.json             # shadcn/ui configuration
```

---

## 🗄️ Database Schema

The database is hosted on **PostgreSQL** and managed by **Prisma 7**.

### `Voice`

| Column | Type | Description |
|---|---|---|
| `id` | `String` (cuid) | Primary key |
| `orgId` | `String?` | Owning organization (null for system voices) |
| `name` | `String` | Voice display name |
| `description` | `String?` | Optional description |
| `category` | `VoiceCategory` | Use-case category |
| `language` | `String` | BCP-47 language tag (default `en-US`) |
| `variant` | `VoiceVariant` | `SYSTEM` or `CUSTOM` |
| `r2ObjectKey` | `String?` | R2 storage key for the reference audio |

**`VoiceCategory`** enum: `AUDIOBOOK`, `CONVERSATIONAL`, `CUSTOMER_SERVICE`, `GENERAL`, `NARRATIVE`, `CHARACTERS`, `MEDITATION`, `MOTIVATIONAL`, `PODCAST`, `ADVERTISING`, `VOICEOVER`, `CORPORATE`

### `Generation`

| Column | Type | Description |
|---|---|---|
| `id` | `String` (cuid) | Primary key |
| `orgId` | `String` | Owning organization |
| `voiceId` | `String?` | FK to `Voice` (nullable on voice delete) |
| `voiceName` | `String` | Snapshot of voice name at generation time |
| `text` | `String` | Input text |
| `r2ObjectKey` | `String?` | R2 key for the generated WAV file |
| `temperature` | `Float` | Sampling temperature |
| `topP` | `Float` | Nucleus sampling probability |
| `topK` | `Int` | Top-K sampling |
| `repetitionPenalty` | `Float` | Repetition penalty factor |

---

## ⚙️ Environment Variables

All environment variables are validated at startup using `@t3-oss/env-nextjs` with Zod.

Create a `.env` file in the project root:

```env
# ─── Database ───────────────────────────────────────────
DATABASE_URL="postgresql://user:password@host:5432/resonance"

# ─── App ────────────────────────────────────────────────
APP_URL="http://localhost:3000"

# ─── Cloudflare R2 ──────────────────────────────────────
R2_ENDPOINT_URL="https://<account_id>.r2.cloudflarestorage.com"
R2_ACCOUNT_ID="<account_id>"
R2_ACCESS_KEY_ID="<access_key_id>"
R2_SECRET_ACCESS_KEY="<secret_access_key>"
R2_BUCKET_NAME="resonance"

# ─── Chatterbox TTS (Modal deployment) ──────────────────
CHATTERBOX_API_URL="https://<your-modal-endpoint>/generate"
CHATTERBOX_API_KEY="<your-api-key>"

# ─── Polar (Billing) ────────────────────────────────────
POLAR_ACCESS_TOKEN="<polar-access-token>"
POLAR_SERVER="sandbox"           # "sandbox" | "production"
POLAR_PRODUCT_ID="<product-id>"

# ─── Clerk (Authentication) ─────────────────────────────
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/"

# ─── Sentry (Observability) ─────────────────────────────
SENTRY_AUTH_TOKEN="<sentry-auth-token>"   # .env.sentry-build-plugin
NEXT_PUBLIC_SENTRY_DSN="https://...@sentry.io/..."
```

> **Note:** Clerk environment variables are read by the Clerk SDK automatically — refer to the [Clerk Next.js docs](https://clerk.com/docs/quickstarts/nextjs) for the full list.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 20
- **pnpm** / **npm** / **yarn**
- **PostgreSQL** database
- **Cloudflare R2** bucket
- **Clerk** account (with Organizations enabled)
- **Polar** account
- **Modal** account (for the Chatterbox TTS microservice)

### 1. Clone & Install

```bash
git clone https://github.com/KayqueGoldner/resonance-ai-voice-cloning-app-nextjs16.git
cd resonance-ai-voice-cloning-app-nextjs16
npm install
```

> `postinstall` automatically runs `prisma generate` to build the Prisma client.

### 2. Configure Environment

Copy the example and fill in your credentials:

```bash
cp .env.example .env
# Edit .env with your values
```

### 3. Run Database Migrations

```bash
npx prisma migrate dev
```

### 4. Deploy the Chatterbox TTS Microservice

The TTS inference layer is a **Modal** serverless app. Deploy it separately:

```bash
# Install Modal CLI
pip install modal

# Set secrets on Modal
modal secret create hf-token HF_TOKEN=<huggingface-token>
modal secret create chatterbox-api-key CHATTERBOX_API_KEY=<your-api-key>
modal secret create cloudflare-r2 \
  AWS_ACCESS_KEY_ID=<r2-access-key-id> \
  AWS_SECRET_ACCESS_KEY=<r2-secret-access-key>

# Fill in R2_BUCKET_NAME and R2_ACCOUNT_ID at the top of chatterbox_tts.py

# Deploy
modal deploy chatterbox_tts.py
```

Copy the deployed endpoint URL and API key into your `.env` as `CHATTERBOX_API_URL` and `CHATTERBOX_API_KEY`.

### 5. Start the Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧠 Chatterbox TTS Microservice

The `chatterbox_tts.py` file defines a **Modal** serverless application that:

1. **Runs on an A10G GPU** with `chatterbox-tts==0.1.6` and `ChatterboxTurboTTS`.
2. **Mounts your R2 bucket read-only** at `/r2` — voice reference audio files are read directly from there.
3. **Exposes a FastAPI endpoint** (`POST /generate`) protected by an API key header (`X-Api-Key`).
4. **Scales down automatically** after 5 minutes of inactivity (`scaledown_window=60*5`).
5. **Supports up to 10 concurrent inputs** per container (`@modal.concurrent(max_inputs=10)`).

### TTS Request Parameters

| Parameter | Type | Default | Range | Description |
|---|---|---|---|---|
| `prompt` | `string` | — | 1–5000 chars | Text to synthesize |
| `voice_key` | `string` | — | — | R2 object key for reference audio |
| `temperature` | `float` | `0.8` | 0.0–2.0 | Controls randomness |
| `top_p` | `float` | `0.95` | 0.0–1.0 | Nucleus sampling |
| `top_k` | `int` | `1000` | 1–10000 | Top-K sampling |
| `repetition_penalty` | `float` | `1.2` | 1.0–2.0 | Penalizes repetition |
| `norm_loudness` | `bool` | `true` | — | Normalize audio loudness |

### Testing the Microservice

```bash
# Via Modal CLI (local test)
modal run chatterbox_tts.py \
  --prompt "Hello from Chatterbox!" \
  --voice-key "voices/system/<voice-id>"

# Via cURL (deployed endpoint)
curl -X POST "<CHATTERBOX_API_URL>/generate" \
  -H "Content-Type: application/json" \
  -H "X-Api-Key: <CHATTERBOX_API_KEY>" \
  -d '{"prompt": "Hello!", "voice_key": "voices/system/<voice-id>"}' \
  --output output.wav
```

---

## 📡 API Reference

All application API endpoints are served through Next.js route handlers.

### tRPC Endpoints

Accessible at `/api/trpc/*`. All procedures require Clerk authentication; `orgProcedure` additionally requires an active organization context.

#### `generations`

| Procedure | Type | Description |
|---|---|---|
| `generations.getAll` | `query` | List all generations for the current org |
| `generations.getById` | `query` | Get a single generation by ID |
| `generations.create` | `mutation` | Generate speech (requires active subscription) |

#### `voices`

| Procedure | Type | Description |
|---|---|---|
| `voices.getAll` | `query` | List system + custom voices (with optional search) |
| `voices.delete` | `mutation` | Delete a custom voice and its R2 audio |

#### `billing`

| Procedure | Type | Description |
|---|---|---|
| `billing.getStatus` | `query` | Get subscription status and estimated cost |
| `billing.createCheckout` | `mutation` | Create a Polar checkout session |
| `billing.createPortalSession` | `mutation` | Create a Polar customer portal session |

### REST Handlers

| Route | Method | Description |
|---|---|---|
| `/api/audio/[generationId]` | `GET` | Stream generated audio via signed R2 URL |
| `/api/voices/create` | `POST` | Upload a voice reference audio to R2 |
| `/api/voices/[voiceId]` | `GET` | Get a signed URL for a specific voice sample |

---

## 🛡️ Authentication & Multi-Tenancy

Authentication is handled by **[Clerk](https://clerk.com)** with full **Organizations** support.

- Users **must belong to an organization** — data is isolated at the `orgId` level.
- The `orgProcedure` tRPC middleware enforces this: any request without a valid `orgId` receives `403 FORBIDDEN`.
- Users who haven't selected an org are redirected to `/org-selection`.
- Sign-in and sign-up pages are hosted at `/sign-in` and `/sign-up`.

---

## 💳 Billing & Monetization

Billing is powered by **[Polar](https://polar.sh)** with usage-based metering.

### Flow

1. User subscribes via a Polar Checkout session (created by `billing.createCheckout`).
2. Each `generations.create` call verifies an active subscription before generating audio.
3. After each successful generation, a `tts_generation` usage event is ingested to Polar with `{ characters: text.length }` metadata — enabling per-character billing.
4. Users can manage their subscription through the Polar Customer Portal (`billing.createPortalSession`).

### Configuring Billing

- Set `POLAR_SERVER=sandbox` for development and `POLAR_SERVER=production` for production.
- Create a product in your Polar dashboard and copy its ID to `POLAR_PRODUCT_ID`.
- Set up a usage-based price meter on the `tts_generation` event in Polar.

---

## 🔭 Observability

Resonance uses **[Sentry](https://sentry.io)** for full-stack error tracking and logging.

- **tRPC Middleware**: `sentryMiddleware` wraps every tRPC procedure and attaches RPC input to error reports.
- **Server Logging**: `Sentry.logger.info/error` is called at key points in the generation pipeline.
- **Source Maps**: Uploaded during build (`widenClientFileUpload: true`) for readable stack traces.
- **Tunnel Route**: Browser requests are routed through `/monitoring` to bypass ad-blockers.
- **Cron Monitors**: Configured via `automaticVercelMonitors` for Vercel Cron Jobs.

Configure Sentry:
```bash
# .env.sentry-build-plugin
SENTRY_AUTH_TOKEN="<your-auth-token>"
```

The Sentry org is `personal-uoq` and the project is `resonance` — update these in `next.config.ts` to match your own Sentry organization.

---

## 🛠️ Scripts

| Script | Command | Description |
|---|---|---|
| Dev server | `npm run dev` | Starts the Next.js development server |
| Build | `npm run build` | Builds the production bundle |
| Start | `npm run start` | Starts the production server |
| Lint | `npm run lint` | Runs ESLint |
| Sync API types | `npm run sync-api` | Regenerates TypeScript types from the Chatterbox OpenAPI spec |

### `sync-api`

The `scripts/sync-api.ts` script uses `openapi-typescript` to pull the OpenAPI schema from the live Chatterbox endpoint (`/openapi.json`) and regenerate the typed client at `src/generated/`. Run this whenever the Chatterbox API changes:

```bash
npm run sync-api
```

---

## 🧰 Tech Stack

### Frontend

| Package | Version | Purpose |
|---|---|---|
| `next` | 16.1.6 | Full-stack React framework |
| `react` / `react-dom` | 19 | UI library |
| `tailwindcss` | 4 | Utility-first CSS |
| `@base-ui/react` | ^1.2 | Headless UI primitives |
| `radix-ui` | ^1.4 | Accessible UI components |
| `lucide-react` | ^0.575 | Icon library |
| `next-themes` | ^0.4 | Dark/light mode |
| `sonner` | ^2.0 | Toast notifications |
| `wavesurfer.js` | ^7.12 | Audio waveform visualizer |
| `embla-carousel-react` | ^8.6 | Carousel / slider |
| `react-dropzone` | ^15.0 | Drag-and-drop file uploads |
| `recharts` | ^2.15 | Dashboard charts |
| `nuqs` | ^2.8 | Type-safe URL search params |
| `vaul` | ^1.1 | Drawer component |
| `cmdk` | ^1.1 | Command palette |
| `date-fns` | ^4.1 | Date utilities |
| `@dicebear/core` | ^9.4 | Procedural avatar generation |

### Backend & Data

| Package | Version | Purpose |
|---|---|---|
| `@trpc/server` / `@trpc/client` | 11 | End-to-end type-safe API |
| `@tanstack/react-query` | ^5.96 | Server state management |
| `@prisma/client` | ^7.4 | Type-safe ORM |
| `@prisma/adapter-pg` | ^7.4 | PostgreSQL adapter |
| `pg` | ^8.20 | PostgreSQL driver |
| `@aws-sdk/client-s3` | ^3.1021 | Cloudflare R2 (S3-compatible) |
| `@clerk/nextjs` | ^6.39 | Authentication & organizations |
| `@polar-sh/sdk` | ^0.47 | Usage-based billing |
| `@sentry/nextjs` | ^10.49 | Error tracking & observability |
| `superjson` | ^2.2 | tRPC data transformer |
| `zod` | ^4.3 | Schema validation |
| `@t3-oss/env-nextjs` | ^0.13 | Type-safe env variables |
| `openapi-fetch` | ^0.17 | Typed HTTP client for Chatterbox |
| `music-metadata` | ^11.12 | Audio file metadata parsing |

### ML Inference

| Tool | Purpose |
|---|---|
| **Modal** | Serverless GPU cloud (A10G) |
| **chatterbox-tts** | Voice cloning TTS model |
| **FastAPI** | Inference microservice HTTP layer |
| **torchaudio** | Audio encoding/decoding |

---

## 🤝 Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change, then submit a pull request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

