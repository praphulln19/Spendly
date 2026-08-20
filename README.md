<p align="center">
  <img src="public/icon.svg" alt="Spendly Logo" width="96" height="96" style="border-radius: 20px;" />
</p>

<h1 align="center">Spendly</h1>

<p align="center">
  What can I spend today? Set what you have and how long it has to last, and Spendly works out a daily number — recalculated every morning, offline-friendly, and built with Apple-grade glassmorphism clarity.
</p>

---

## What it does

- **Daily Allowance Engine** - Set a budget and a period; Spendly divides what's left by the days remaining and rolls yesterday's under/overspend into today's number automatically.
- **Today Hero & Day Strip** - A single daily figure up front, backed by a per-day strip that shows spending *pace* (relative to that day's own allowance) rather than raw amounts, so a low number today is never a mystery.
- **Budget Alerts** - Tone-scaled warnings (good → caution → warning → critical) that can be dismissed for the day, with escalation breaking through the silence if things get worse.
- **Need vs. Want Split** - Spend priced in days of allowance instead of currency, split by need/want so the habit that's actually costing you is visible.
- **Insights & Trends** - Month-by-month navigation with a budget ring, an interactive SVG spending trend graph, and a glowing category breakdown.
- **Transaction Records & Export** - Searchable, filterable expense history with a shared filter picker, plus CSV and formatted PDF report export.
- **Offline-First** - Expenses log instantly to local state and queue for sync when the connection drops — built for logging spend standing at a counter on bad reception, not as an edge case.
- **PWA & Mobile Support** - Installable app with offline service worker, custom iOS/Android install guidance, an installed-app quick-add shortcut, and a mobile dock nav.
- **Signed-Out Landing Page** - A marketing landing page with a live product preview for visitors, separate from the authenticated app shell.

---

## Tech Stack

| Category | Technology |
|---|---|
| Frontend | [![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org) [![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev) [![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org) |
| Styling & UI | [![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com) [![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion) [![GSAP](https://img.shields.io/badge/GSAP-88CE02?style=for-the-badge&logo=greensock&logoColor=black)](https://gsap.com) [![Lucide Icons](https://img.shields.io/badge/Lucide_Icons-F55036?style=for-the-badge&logoColor=white)](https://lucide.dev) |
| Auth & DB | [![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com) [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org) |
| Analytics & PWA | [![Umami](https://img.shields.io/badge/Umami-2B4C7E?style=for-the-badge&logo=umami&logoColor=white)](https://umami.is) [![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps) |
| Data Export | [![jsPDF](https://img.shields.io/badge/jsPDF-EC3B4D?style=for-the-badge&logoColor=white)](https://github.com/parallax/jsPDF) |

---

## Getting Started

```bash
git clone https://github.com/Praphull/Spendly.git
cd Spendly
npm install
```

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
Spendly/
├── src/
│   ├── app/
│   │   ├── auth/
│   │   │   └── callback/        # OAuth callback route
│   │   ├── expenses/            # All transactions page
│   │   ├── insights/            # Trends, month navigation & category breakdown
│   │   ├── globals.css          # Global styles & design tokens
│   │   ├── layout.tsx           # Root layout shell & providers
│   │   └── page.tsx             # Today view (daily allowance dashboard)
│   ├── components/
│   │   ├── AnalyticsBarChart.tsx     # SVG spending trend line graph
│   │   ├── AppleNavbar.tsx           # Top bar navigation & drawer
│   │   ├── AppShell.tsx              # Session gating, chrome & global sheets
│   │   ├── BudgetAlert.tsx           # Tone-scaled budget status banner
│   │   ├── BudgetRing.tsx            # Apple Watch style budget ring
│   │   ├── categoryIcons.ts          # Category → icon mapping
│   │   ├── DayStrip.tsx              # Per-day spend-pace strip
│   │   ├── GlassCategoryBreakdown.tsx # Frosted glass category distribution
│   │   ├── GlassExpenseList.tsx      # Filterable transaction table & export
│   │   ├── LandingPage.tsx           # Signed-out marketing page & preview
│   │   ├── MobileBottomNav.tsx       # Mobile floating dock bar
│   │   ├── NeedWantSplit.tsx         # Need/want spend split in days
│   │   ├── OfflineBanner.tsx         # Connectivity & pending-sync indicator
│   │   ├── PeriodSetupModal.tsx      # Budget period setup/edit modal
│   │   ├── PickerMenu.tsx            # Shared filter/picker menu
│   │   ├── PWAPrompt.tsx             # Mobile PWA install guidance
│   │   ├── QuickAddSheet.tsx         # Quick expense entry sheet
│   │   ├── SpendlyMark.tsx           # Wordmark/logo component
│   │   └── TodayHero.tsx             # Today's allowance hero card
│   ├── context/
│   │   ├── SessionProvider.tsx  # Supabase auth session context
│   │   └── ThemeProvider.tsx    # Light/Dark mode context
│   ├── hooks/
│   │   └── useExpenses.tsx      # Expense store, allowance state & CSV/PDF export
│   ├── lib/
│   │   ├── offlineQueue.ts      # Queues writes made while offline
│   │   ├── supabase.ts          # Supabase client setup
│   │   └── userStorage.ts       # User-scoped localStorage helpers
│   ├── services/
│   │   └── expenseService.ts    # Supabase CRUD for expenses
│   ├── types/
│   │   ├── budget.ts            # Budget period interfaces
│   │   └── expense.ts           # Expense interfaces & categories
│   └── utils/
│       ├── allowance.ts         # Daily allowance & date math
│       ├── budgetUtils.ts       # Month navigation & aggregation helpers
│       └── format.ts            # Currency/date formatting
├── supabase/
│   └── migrations/              # Postgres schema & RLS policies
├── public/                      # Manifest, service worker & icons
│   ├── icon.svg
│   ├── apple-touch-icon.png
│   ├── manifest.json
│   └── sw.js
├── .env.example                 # Environment variables template
├── next.config.js
├── tailwind.config.js
└── package.json
```

---

## Available Scripts

- `npm run dev` - Start Next.js development server
- `npm run build` - Build production application bundle
- `npm start` - Run production server after building
- `npm run lint` - Lint the codebase
- `npm run typecheck` - Validate TypeScript types across the app

---

## Deploying to Vercel

1. Import your GitHub repository into Vercel.
2. Vercel automatically detects Next.js out-of-the-box (zero configuration needed).
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to Vercel Environment Variables.
4. Click **Deploy**.

---

<p align="center">
  <em>Spendly - Master your money, conquer your goals.</em>
</p>
