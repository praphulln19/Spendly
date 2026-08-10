<p align="center">
  <img src="public/icon.svg" alt="Spendly Logo" width="96" height="96" style="border-radius: 20px;" />
</p>

<h1 align="center">Spendly</h1>

<p align="center">
  A modern, elegant expense tracking web application built with Apple-grade glassmorphism clarity. Track spending, calculate daily budget limits, and gain instant financial confidence.
</p>

---

## What it does

- **Budget Goal Ring** - Apple Watch-style ring visualizer tracking monthly budget limits and live daily allowance calculations.
- **Spending Trends Analytics** - Interactive SVG trend graph with axis arrows, grid lines, and hover data tooltips.
- **Category Breakdown** - Frosted glass cards with glowing category distribution progress bars.
- **Transaction Records & Export** - Searchable, filterable transaction history with CSV and formatted PDF report export options.
- **PWA & Mobile Support** - Progressive Web App with offline service worker support, custom iOS/Android installation guidance, and interactive Dock navigation.

---

## Tech Stack

| Category | Technology |
|---|---|
| Frontend | [![Next.js](https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org) [![React](https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev) [![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org) |
| Styling & UI | [![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com) [![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion) [![Lucide Icons](https://img.shields.io/badge/Lucide_Icons-F55036?style=for-the-badge&logoColor=white)](https://lucide.dev) |
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
│   │   │   └── callback/        # OAuth callback router
│   │   ├── expenses/            # All transactions page
│   │   ├── globals.css          # Global styles & design tokens
│   │   ├── layout.tsx           # Root layout shell & providers
│   │   └── page.tsx             # Main dashboard overview
│   ├── components/
│   │   ├── AnalyticsBarChart.tsx # SVG spending trend line graph
│   │   ├── AppleAuthScreen.tsx  # OAuth authentication screen
│   │   ├── AppleNavbar.tsx      # Top bar navigation & drawer
│   │   ├── BudgetRing.tsx       # Apple Watch style budget ring
│   │   ├── Dock.css / Dock.tsx  # React Bits interactive dock bar
│   │   ├── GlassExpenseList.tsx # Filterable transaction table
│   │   ├── MobileBottomNav.tsx  # Mobile floating dock bar
│   │   ├── PWAPrompt.tsx        # Mobile PWA install guidance
│   │   ├── SetBudgetModal.tsx   # Budget limit modal
│   │   └── TextType.tsx         # React Bits animated quote text
│   ├── context/
│   │   └── ThemeProvider.tsx    # Light/Dark mode context
│   ├── data/
│   │   └── quotes.ts            # Curated financial quotes
│   ├── hooks/
│   │   └── useExpenses.tsx      # Expense data store & PDF/CSV export
│   ├── lib/
│   │   └── supabase.ts          # Supabase client setup
│   └── types/
│       └── expense.ts           # TypeScript interfaces & categories
├── public/                      # Manifest, service worker & icons
│   ├── icon.svg
│   ├── manifest.json
│   └── sw.js
├── .env.example                 # Environment variables template
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

## Available Scripts

- `npm run dev` - Start Next.js development server
- `npm run build` - Build production application bundle
- `npm start` - Run production server after building
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
