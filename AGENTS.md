# AGENTS.md

Instructions for AI agents working in this repository. Read this first, every session.

## The Most Important Rule: This is a Learning Project

The owner is learning. The goal is deep understanding and systems craftsmanship, not just working code. Every reply must teach.

- **Explain the concept first.** Before or while doing something, explain what it is, why it exists, and how it works in simple, concrete words.
- **Explain the why of every design choice.** Not just "do X", but "X because Y" (e.g. why we use Web NFC vs native URL interception on iOS, why CLIP embeddings run through Replicate, or why escrow must use database transactions with webhook idempotency).
- **Teach over doing.** Show the command or the code, then break down the underlying mechanism.
- **No unexplained jargon.** Define a term the first time it appears (e.g. *pgvector*, *cosine similarity*, *ERC-721*, *tamper-evident NFC*, *escrow hold*).
- **Small steps, then pause.** Stop at each architectural gate and invite questions.
- **Prefer showing the mechanism.** When something is a black box (smart contracts, vector embeddings, webhook handshakes, payment escrow), open it up so the owner sees what is actually happening.
- Keep it simple. Short sentences. Concrete examples.

---

## Project: Ọjà Ọnà

**Ọjà Ọnà** (*"art market"* in Yoruba) is a mobile-first web marketplace (PWA) where Nigerian artists sell physical artworks. Each artwork is paired with:
1. **A digital certificate of authenticity** minted on-chain (ERC-721 on Base).
2. **A tamper-evident physical NFC tag** (NTAG 424 DNA) stuck on the back of the piece linking directly to its certificate and confirming physical delivery.
3. **Scan-to-search camera discovery**: Visitors at galleries or pop-up exhibitions photograph a painting to instantly pull up its listing, artist profile, certificate, or visually similar pieces via vector search (CLIP + Supabase `pgvector`).
4. **Trustworthy Escrow**: Buyers pay in Naira (via Paystack) or stablecoins (USDC on Base). Funds are locked in escrow and only released to the artist after the physical artwork arrives safely and is confirmed.

Foundational blueprint: `docs/PLAN.md` (based on `Ọjà Ọnà — MVP Plan.pdf`).

---

## Tech Stack & Architecture

| Layer | Technology | Why Chosen |
| :--- | :--- | :--- |
| **Framework** | **Next.js (App Router, React 19)** | PWA support, SSR for rich link previews on WhatsApp/Instagram, Server Actions for secret API keys. |
| **Styling** | **Tailwind CSS** | Rapid mobile-first responsive utility styling. |
| **Typography** | **Ogaranya + Inter/Manrope** | **Ogaranya** (display serif by Nebo Ikechukwu Kingsley) for logo, headings, artwork titles, and ₦ prices (supports Yoruba tone marks). **Inter/Manrope** for body and controls. |
| **Database & Auth** | **Supabase (PostgreSQL 16)** | Auth, relational tables, storage buckets for high-res images, and `pgvector` in one unified platform. |
| **Visual Search** | **CLIP via Replicate + pgvector** | Converts artwork photos into 768-dimensional vector embeddings stored and indexed directly in PostgreSQL. |
| **Naira Payments** | **Paystack** | Primary card, bank transfer, and USSD gateway; Paystack Transfers API for escrow payouts to artists. (Flutterwave as backup). |
| **Diaspora Payments** | **USDC on Base** | Low fees, fast finality; handled via licensed crypto processor (switched on after legal review). |
| **Wallets** | **Privy** | Frictionless embedded wallets generated from email/phone without seed phrases. |
| **Certificates** | **ERC-721 on Base L2** | Sub-cent minting fees; immutable provenance metadata (artist, title, medium, year, photo hash). |
| **Physical Tags** | **NTAG 424 DNA NFC** | Cryptographically signed tap codes; tamper-evident adhesive prevents tag swapping. |
| **Hosting** | **Vercel** | Edge network, automatic HTTPS, zero-config PWA hosting. |

---

## Architectural Rules & Code Boundaries

### 1. Unidirectional Dependency Rule
Code never imports sideways between distinct domain features. Dependencies strictly flow downward:
- `components/ui/` (Primitives) $\to$ Presentation only. Never import Supabase, actions, or models.
- `components/shared/` $\to$ Reusable product components (`ArtworkCard`, `PriceBadge`, `NfcPrompt`).
- `app/actions/` $\to$ Server Actions for business logic, mutations, Supabase queries, and external APIs.
- `types/` $\to$ Pure TypeScript types only; zero runtime code.
- `utils/` $\to$ Pure utility functions (`format.ts`, `routes.ts`, `crypto.ts`).

### 2. Hard Rules — Never Do These
1. **No `any`.** Strict TypeScript everywhere; use `unknown` and narrow with Zod.
2. **No hardcoded routes.** Always import route paths from `@/utils/routes`.
3. **No client-submitted prices or status values.** Pricing and order state transitions are computed and verified server-side.
4. **No committing raw `Ogaranya` font files or confidential docs.** Font binaries and `docs/` remain strictly local.
5. **No inline raw currency formatting.** All currency rendering goes through `@/utils/format`.
6. **No blanket `'use client'` on route files.** Push client interactivity down to leaf components; keep pages as Server Components for OpenGraph social link metadata.
7. **No un-idempotent webhook processing.** Verify Paystack's HMAC-SHA512 signature and log event references before processing.
8. **No client-side security filtering.** Enforce access control in PostgreSQL Row Level Security (RLS), not in React.
9. **No dead controls.** Rendered buttons and actions must either execute a real behavior or be conditionally hidden.

---

## Ways of Working & Git Hygiene

- **Documentation Git Hygiene:**
  - `docs/` (`PLAN.md`, `DESIGN.md`, `LEARNING.md`) and `.pdf` files are **internal and local to this machine**. They must **never** be pushed to the public GitHub repository (enforced via `.gitignore`).
  - Only clean production code, `README.md`, and `AGENTS.md` are committed and pushed.
- **Proactively update documentation (.md files) without being reminded:**
  - **`docs/DESIGN.md` (Architecture Reference):** Keep it clean, structured, and scannable with diagrams, tables, state machines, tradeoffs, and decisions to defend.
  - **`docs/LEARNING.md` (Study Journal):** Detailed, pedagogical, and deeply educational. Must explain complex topics in depth using simple words, analogies, and step-by-step mechanisms. Never condense it into bare bullet points; it exists to teach someone learning systems engineering from scratch.
  - Keep documentation synchronized immediately at each step without waiting for the owner to ask.
- **Strict Escrow Security:**
  - Never trust client-submitted prices or payment states.
  - All payment verification occurs server-side via cryptographic webhook signatures and direct API verification.
  - Escrow releases require verified NFC confirmation, buyer sign-off, or 7-day courier timeout.
- **Brand & Asset Licensing Hygiene:**
  - `Ogaranya` font files must **never** be committed to public repositories or made downloadable. Load strictly as private webfonts.
  - Never commit `.env` secrets (Paystack secret keys, Supabase service roles, Replicate tokens, Privy app secrets).

---

## Roadmap & Milestone Phases

- **M1 (Catalog, Profiles & Listings):** Supabase schema, artist profiles, artwork CRUD, image uploads to Supabase Storage, responsive gallery grid with Ogaranya branding.
- **M2 (Visual Search Engine):** Replicate CLIP embedding pipeline, Supabase `pgvector` table integration, in-app camera capture, cosine distance similarity queries.
- **M3 (Certificates & NFC Integration):** ERC-721 contract on Base, metadata pinning, Privy wallet integration, NTAG 424 DNA URL structure and verification endpoints.
- **M4 (Checkout & Escrow Pipeline):** Paystack checkout integration, order state machine (`paid` → `shipped` → `delivered` → `paid out`), webhook handler with idempotency keys.
- **M5 (Admin Dashboard & Payouts):** Admin curation panel (artist verification, dispute resolution), Paystack Transfers API payout automation, courier tracking hooks.
- **M6 (Beta & Pop-up Launch Event):** End-to-end integration tests, mobile PWA optimization, offline caching, Lagos gallery pop-up testing.
