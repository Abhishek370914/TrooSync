# TrooSync 🚀

**Turn any ad creative into a perfectly matched, CRO-optimized landing page in seconds.**

Built for the Troopod AI PM Assignment. Powered by Claude 3.5 Sonnet.

---

## Features
- 🎯 **AI Ad Analysis** — Claude Vision reads tone, emotion, offer, CTA style from your ad
- 🌐 **Live Page Fetching** — Extracts and audits any landing page HTML
- ✨ **Full Personalization** — Rewrites copy, headlines, CTAs to match your ad
- 📊 **CRO Score + A/B Simulator** — Real uplift prediction and change breakdown
- 🔄 **3 AI Variants** — Pick the best version
- 💬 **AI Tweak Chat** — "Make the headline more urgent" → instant change
- 🎨 **Side-by-Side Preview** — Original iframe vs live-editable enhanced page
- 🔥 **CRO Heatmap Overlay** — Visual attention zones
- 📥 **Export HTML** — Download ready-to-deploy enhanced page

---

## Tech Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS** + **shadcn/ui** + clsx + tailwind-merge
- **Framer Motion** — Page transitions, scroll animations
- **React Three Fiber** + **@react-three/drei** — 3D hero scene & neural brain
- **Vercel AI SDK** + **Anthropic Claude 3.5 Sonnet** — Vision + CRO generation
- **Supabase** — Auth + storage (for uploaded ad creatives)
- **Zustand** — Global state management
- **Cheerio** — Server-side page HTML extraction
- **React Diff Viewer** — Before/after code diffs

---

## Quick Start

### 1. Clone & Install

```bash
cd /path/to/TrooSync
npm install --legacy-peer-deps
```

> **Note:** `--legacy-peer-deps` is required because R3F v9-alpha has a peer dep conflict with React 19.

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Fill in `.env.local`:
```env
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...
SUPABASE_SERVICE_ROLE_KEY=eyJh...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploy to Vercel (One-Click)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-org/troosync)

Or manually:

```bash
npm install -g vercel
vercel
```

Set the same environment variables in your Vercel Project Settings.

The `vercel.json` is pre-configured:
- Max function duration: 60 seconds (for AI processing)
- Region: `iad1` (US East)

---

## How It Works

1. **Upload Ad Creative** → image, video, GIF, or URL
2. **Paste Landing Page URL** → any publicly accessible page
3. **AI Personalizes** →
   - Claude Vision analyzes ad tone, emotion, offer, CTA style
   - Cheerio fetches and cleans the landing page HTML
   - Claude performs deep CRO audit against the ad
   - Claude generates a modified HTML version with personalized copy
4. **Side-by-Side Preview** → Original (iframe) vs Enhanced (live-editable)
5. **Export or Tweak** → Download HTML or use AI chat to refine

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with fonts + toasts
│   ├── page.tsx            # Main page with state machine
│   ├── globals.css         # Design system (glass, glow, cyber grid)
│   └── api/
│       ├── personalize/    # Main AI pipeline (stream SSE)
│       └── tweak/          # AI single-instruction tweak
├── components/
│   ├── Navbar.tsx
│   ├── Hero.tsx            # Hero + 3D scene wrapper
│   ├── HeroScene.tsx       # React Three Fiber 3D canvas
│   ├── FeaturesSection.tsx
│   ├── BuilderDashboard.tsx # Main input form
│   ├── AdUpload.tsx        # Drag & drop + URL input
│   ├── ProcessingScreen.tsx # Neural brain 3D animation
│   ├── ResultsView.tsx     # Side-by-side + tabs + analytics
│   └── Footer.tsx
└── lib/
    ├── types.ts            # TypeScript interfaces
    ├── store.ts            # Zustand global store
    ├── utils.ts            # cn() utility
    └── supabase.ts         # Supabase client
```

---

## Edge Cases Handled

| Scenario | Handling |
|----------|----------|
| Broken URL | Graceful error with retry + demo load |
| Blocked scraper | Error state with helpful message |
| AI parse failure | Fallback to original HTML + low score |
| Large HTML (>40KB) | Truncated for Claude context window |
| No API key | Error toast with instructions |

---

## License

MIT — Built for the Troopod AI PM Assignment.
# TrooSync
