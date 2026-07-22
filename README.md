<div align="center">

# 🚀 PostPilot AI

**Turn your raw ideas into perfect, high-converting social posts for X & LinkedIn.**

[![Next.js](https://img.shields.io/badge/Next.js-16.2.1-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4.0-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.3-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Vercel AI SDK](https://img.shields.io/badge/Vercel_AI_SDK-4.1-000000?style=flat-square&logo=vercel)](https://sdk.vercel.ai/docs)
[![Arcjet](https://img.shields.io/badge/Arcjet-Protected-5B5BD6?style=flat-square)](https://arcjet.com/)

</div>

---

## ✨ Overview

**PostPilot AI** is a privacy-first, developer-focused AI content engine designed for founders, engineers, and creators. Simply dump your raw thoughts, choose a desired tone and target audience, and PostPilot AI instantly formats your ideas into native, high-converting copy tailored for **LinkedIn** and **X (Twitter)**.

Designed with modern minimalist aesthetics, glassmorphism UI, interactive WebGL light ray canvases, and zero-clutter manual publishing controls.

---

## ⚡ Core Features

### 🎯 1. AI-Powered Multi-Tone Generation
- **Raw Idea Transformation**: Turn quick bullet points or rough notes into engaging social copy.
- **Customizable Brand Tones**: Switch between *Founder*, *Thought Leader*, *Technical*, *Storyteller*, *Minimalist*, *Witty*, *Direct*, and *Bold*.
- **Audience & Format Alignment**: Tailor output for Founders, Engineers, Marketers, Creators, Investors, or Students in Short Punchy, Detailed, or Story Arc formats.

### 📑 2. Multi-Platform Draft Workspace
- **Dual-Platform Formatting**: Generates tailored LinkedIn posts and X single-posts/threads side-by-side.
- **Atomic JSON Content Storage**: Keeps platform content isolated in database columns (`linkedinContent`, `xContent`) to prevent cross-platform contamination.
- **Version Conflict Protection**: Built-in concurrency control (`version` check) to prevent accidental data overwrites during simultaneous edits.
- **1-Click Rich Text Copying**: Formatted clipboard copying ready for direct pasting into native social apps.

### 📅 3. Interactive Visual Content Calendar
- **Month & Week Scheduling Views**: Drag-and-drop planning to visualize your publishing pipeline.
- **Platform Status Tracking**: Monitor `DRAFT` vs `SCHEDULED` posts with dedicated timestamps (`xScheduledAt`, `linkedinScheduledAt`).

### 🪙 4. Daily 10-Token Allowance Ledger
- **Automatic 24-Hour Refill**: Every user receives 10 free AI generation tokens every single day.
- **Atomic Transaction Ledger**: Transparent transaction history tracking token allotments, usage, and automatic refunds.
- **Stream Safety Refunds**: Automatically refunds tokens if AI streaming fails mid-generation.

### 🛡️ 5. Enterprise Security & Authentication
- **Dual Authentication**: Seamless Google OAuth 2.0 login alongside email/password credentials with Argon2 hashing.
- **Jose HTTP-Only JWTs**: Secure, stateless authentication sessions using `jose` JWT cookies.
- **Arcjet Security Guardrails**: Built-in rate limiting, bot detection, and AI prompt injection protection.

---

## 🛠️ Tech Stack

### **Frontend & UI**
- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/) with Turbopack bundler.
- **Library**: [React 19](https://react.dev/)
- **Styling**: [TailwindCSS v4](https://tailwindcss.com/) with Vanilla CSS custom design tokens.
- **Animations**: [Framer Motion](https://www.framer.com/motion/) for fluid UI micro-interactions.
- **Graphics**: [OGL Canvas](https://github.com/oamap/ogl) for WebGL ambient `SideRays` light beam shaders.
- **Icons**: [Lucide React](https://lucide.dev/) + Custom SVG icons.
- **State & Data Fetching**: [TanStack React Query v5](https://tanstack.com/query) for real-time caching & optimistic UI updates.

### **Backend & Infrastructure**
- **Runtime**: Next.js Route Handlers (Edge & Node.js runtimes).
- **Database & ORM**: [PostgreSQL](https://www.postgresql.org/) managed via [Prisma ORM](https://www.prisma.io/).
- **AI SDK**: [Vercel AI SDK (`ai`)](https://sdk.vercel.ai/docs) supporting OpenAI, Google Gemini, Anthropic, and Groq models.
- **Authentication**: Google OAuth 2.0 (`google-auth-library` / `googleapis`), Argon2 password hashing (`argon2`), and `jose` JWTs.
- **Security Guardrails**: [Arcjet](https://arcjet.com/) security middleware for rate limiting and prompt injection defense.

### **Testing & Quality Control**
- **Test Runner**: [Vitest](https://vitest.dev/)
- **Testing Utilities**: React Testing Library & `@testing-library/user-event`
- **Code Standards**: Biome & ESLint

---

## 🏗️ Architectural Mandates

PostPilot AI follows a strict **Relational Single Source of Truth (SSOT)** pattern:

1. **Status & Scheduling**: Metadata like post status (`linkedinStatus`, `xStatus`) and scheduling timestamps (`xScheduledAt`, `linkedinScheduledAt`) reside ONLY in top-level Prisma database columns.
2. **Platform Content**: Platform-specific copy resides in dedicated JSON columns (`linkedinContent`, `xContent`) for atomic updates and clean maintenance.
3. **No Redundancy**: Metadata is stripped from platform JSON blobs prior to database storage and reconstructed into unified frontend objects via `reconstructPostContent()` in `lib/drafts.ts`.

---

## 📂 Project Structure

```
postpilot-ai/
├── app/                        # Next.js App Router (Pages & API Routes)
│   ├── (auth)/                 # Login, Signup, Verification routes
│   ├── api/                    # REST API endpoints (Auth, Drafts, Tokens, Analytics)
│   ├── changelog/              # Minimal editorial changelog page
│   ├── dashboard/              # Protected dashboard workspace (Calendar, Drafts, Settings)
│   ├── globals.css             # Design tokens & TailwindCSS v4 setup
│   ├── icon.svg                # Vector SVG brand favicon
│   └── page.tsx                # High-end landing page
├── components/                 # UI Component Library
│   ├── landing/                # Hero, Bento Grid, Problem-Solution, FAQ, Header & Footer
│   ├── dashboard/              # Calendar, Post Editor, Sidebar, Token Counter
│   └── ui/                     # ScreenshotFrame, SideRays, Field, Input, Button
├── lib/                        # Core Utilities & Business Logic
│   ├── auth/                   # JWT Jose session, password hashing, base URL resolver
│   ├── server/                 # Token ledger, draft store & SSOT helpers
│   ├── arcjet.ts               # Security guardrails & rate limiter
│   └── prisma.ts               # Prisma ORM singleton client
├── prisma/                     # Database Schema & Migrations
│   └── schema.prisma           # Relational PostgreSQL data model
├── public/                     # Static assets & screenshots
├── tests/                      # Vitest setup & unit test suite
└── next.config.ts              # Next.js & image optimization configuration
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `>=18.0.0`
- **PostgreSQL**: Local or hosted database instance (e.g. Neon, Supabase, Railway)
- **Package Manager**: `npm` or `pnpm`

### 1. Clone & Install
```bash
git clone https://github.com/subodhGalande/PostPilot-AI.git
cd PostPilot-AI
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/postpilot_db"

# Base URL & Auth
NEXTAUTH_URL="http://localhost:3000"
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"

# Google OAuth 2.0
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# AI SDK Providers
OPENAI_API_KEY="your-openai-api-key"
# GOOGLE_GENERATIVE_AI_API_KEY="your-gemini-key"

# Security (Arcjet)
ARCJET_KEY="your-arcjet-api-key"
```

### 3. Run Database Migrations
```bash
npx prisma migrate dev --name init
```

### 4. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to start building!

---

## 🧪 Testing & Verification

Run the comprehensive Vitest unit test suite:

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npx vitest

# Check production build
npm run build
```
