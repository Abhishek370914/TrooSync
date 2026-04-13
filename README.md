# TrooSync ⚡

> AI-powered landing page personalizer — powered by **Grok** (xAI)

Upload any ad creative + paste a landing page URL → Grok analyzes both and delivers a CRO-optimized, ad-matched version in seconds.

---

## 🚀 One-Click Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Abhishek370914/TrooSync&env=GROK_API_KEY,NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY&envDescription=API+keys+required+for+TrooSync&envLink=https://github.com/Abhishek370914/TrooSync%23environment-variables&project-name=troosync&repository-name=TrooSync)

---

## 🛠 Manual Setup

### 1. Clone & Install

```bash
git clone https://github.com/Abhishek370914/TrooSync.git
cd TrooSync
npm install --legacy-peer-deps
```

### 2. Environment Variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

| Variable | Where to get it |
|---|---|
| `GROK_API_KEY` | [console.x.ai](https://console.x.ai) → API Keys |
| `NEXT_PUBLIC_SUPABASE_URL` | [supabase.com](https://supabase.com/dashboard) → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role |

### 3. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## ☁️ Deploy to Vercel

```bash
npx vercel
```

Then add environment variables in **Vercel Dashboard → Project → Settings → Environment Variables**.

After adding keys, click **Redeploy**.

---

## 🧠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| AI | Grok (xAI) via OpenAI-compatible API |
| Animations | Framer Motion + Canvas 2D |
| State | Zustand |
| Scraping | Cheerio |
| Auth/Storage | Supabase |

---

## 📁 Project Structure

```
src/
  app/
    api/
      personalize/    # Grok vision + CRO endpoint
      tweak/          # Iterative AI edit endpoint
  components/
    Hero.tsx          # Animated hero section
    BuilderDashboard  # Main input UI
    ProcessingScreen  # Neural engine loading screen
    ResultsView       # Side-by-side preview + analytics
```

---

Built for the Troopod AI PM Assignment · Powered by Grok ⚡
