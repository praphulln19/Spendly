# Spendly

A modern, student-focused expense tracking web application built with **Next.js 15 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS**, **Framer Motion**, and **Supabase**.

Designed with Apple Human Interface Guidelines and Airbnb-grade monochromatic glassmorphism aesthetics.

## Features

- **Apple Watch Style Budget Goal Ring**: Monthly budget goal visualizer with live daily allowance limit calculation.
- **Daily Spending Trends Analytics**: Framer Motion animated bar chart visualizing spending patterns.
- **Category Breakdown**: Translucent frosted glass cards with glowing progress bars.
- **Transaction Records Table**: Searchable, filterable list with category pills, date range filters, and CSV data export.
- **Supabase Authentication**: Google and GitHub OAuth sign-in with row-level security.
- **Light & Dark Theme**: Apple-style theme toggle.

## Tech Stack

- Next.js 15 (App Router) & React 19
- Tailwind CSS & Framer Motion
- TypeScript & Lucide Icons
- Supabase Auth & PostgreSQL Database

## Local Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and set your Supabase project credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

3. Start the Next.js development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start Next.js development server
- `npm run build` - Build production application bundle
- `npm start` - Run production server after building
- `npm run typecheck` - Validate TypeScript types across the app

## Deploying to Vercel

1. Import your GitHub repository into Vercel.
2. Vercel automatically detects Next.js out-of-the-box (zero configuration needed).
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to Vercel Environment Variables.
4. Click **Deploy**.
