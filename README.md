# forge

**forge** is a browser-based database builder for developers who care about design. Think Airtable's structure, Figma's canvas, and Supabase's power — wrapped in a dark, premium dev-tool aesthetic. Build relational schemas visually or in SQL, generate them with AI, visualize your data as cards and charts, and drag live data cards onto an infinite tldraw whiteboard.

---

## tech stack

| layer         | choice                                          |
|---------------|-------------------------------------------------|
| framework     | SvelteKit (TypeScript, file-based routing)      |
| styling       | Tailwind v4 (`@import "tailwindcss"`, no config)|
| database      | Supabase (Postgres, Auth, Realtime, Storage)    |
| ai            | Groq — `llama-3.3-70b-versatile` (free tier)   |
| code editor   | Monaco via `@monaco-editor/loader`              |
| whiteboard    | tldraw                                          |
| icons         | lucide-svelte                                   |
| package mgr   | pnpm                                            |
| fonts         | Syne · DM Mono · Outfit (Google Fonts — free)  |

---

## free-tier guardrails

every service used in this project is **free with no credit card required**:

- **Supabase** — free tier (500 MB DB, 1 GB storage, 50k MAUs)
- **Groq** — free tier (generous rate limits on llama-3.3-70b-versatile)
- **GitHub** — free
- **Vercel** — hobby plan for deployment
- **Google Fonts** — free, no API key needed
- no Stripe, no paid plugins, no paid fonts

---

## local setup

### 1. clone and install

```bash
git clone https://github.com/nylaimanii/forge.git
cd forge
pnpm install
```

### 2. set up environment variables

```bash
cp .env.example .env.local
```

open `.env.local` and fill in:

```env
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
GROQ_API_KEY=gsk_your-groq-key-here
```

- **Supabase**: create a free project at [supabase.com](https://supabase.com), find your URL and anon key under `Project Settings → API`
- **Groq**: create a free account at [console.groq.com](https://console.groq.com), generate an API key

### 3. run the database migration

in your Supabase dashboard → **SQL Editor**, paste the contents of:

```
supabase/migrations/001_initial.sql
```

this creates the `projects`, `whiteboards`, `card_configs`, and `query_history` tables with RLS enabled.

alternatively, if you have the [Supabase CLI](https://supabase.com/docs/guides/cli) installed and linked:

```bash
supabase db push
```

### 4. run locally

```bash
pnpm dev
```

open [http://localhost:5173](http://localhost:5173) — you'll be redirected to `/login`.

---

## project structure

```
src/
├── app.css                  # tailwind v4 + forge design tokens
├── components/
│   ├── layout/              # Sidebar, TopBar, CommandPalette
│   └── ui/                  # Button, Input, Modal, Badge, Toast, ...
├── lib/
│   ├── ai.ts                # groq stubs (implemented in phase 3)
│   ├── supabase.ts          # browser + server supabase clients
│   └── stores/              # svelte writable stores (user, project, toasts)
├── routes/
│   ├── (app)/               # protected app shell (auth-gated)
│   ├── login/               # public auth pages
│   ├── signup/
│   └── api/                 # server-only routes (groq, etc.)
supabase/
└── migrations/
    └── 001_initial.sql      # full schema + RLS policies
```

---

## build for production

```bash
pnpm build
pnpm preview
```

deploy to Vercel with zero config — connect your GitHub repo in the Vercel dashboard and set the same env vars under `Project Settings → Environment Variables`.
