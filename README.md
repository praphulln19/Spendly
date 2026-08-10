# Spendly

A modern expense-tracking web application for students, built with Next.js 15 (App Router), React 19, TypeScript, and Supabase.

## Features

- Live dashboard totals for all spending, needs, wants, and category breakdown
- Searchable and filterable transaction list with quick actions
- Authenticated add and delete expense interactions
- Persistent Supabase authentication with Google and GitHub OAuth sign-in
- PostgreSQL row-level security so users can access only their own data
- Dark mode support and responsive glassmorphism UI

## Tech Stack

- Next.js 15 (App Router) & React 19
- TypeScript & Custom CSS Design System
- Supabase Auth & PostgreSQL Database
- Lucide React Icons

## Run Locally

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Configure Supabase

1. Create a Supabase project.
2. In the Supabase SQL Editor, run [the expense migration](frontend/supabase/migrations/20260808_create_expenses.sql).
3. Copy `frontend/.env.example` to `frontend/.env.local`.
4. Set your project credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Project Structure

```text
frontend/
|-- src/
|   |-- app/                            # Next.js App Router (pages, layout, globals.css, auth callback)
|   |-- components/                     # UI components (Navbar, SummaryCards, ExpenseList, AddExpenseModal, etc.)
|   |-- context/                        # ThemeProvider for dark/light mode
|   |-- hooks/                          # Shared expense state and async actions
|   |-- lib/                            # Supabase client setup
|   |-- services/                       # Expense CRUD operations
|   `-- types/                          # TypeScript definitions
|-- supabase/migrations/                # Database schema and RLS policies
`-- .env.example                        # Required public environment variables
```

## Available Commands

From `frontend/`:

```bash
npm run dev       # Start Next.js development server
npm run build     # Build production application bundle
npm start         # Run production server after building
npm run typecheck # Type-check the app with TypeScript compiler
```

## Security Notes

Never commit `.env` or `.env.local` containing service-role keys. The client application uses only the public project URL and anon key; database access is enforced by Supabase Row-Level Security (RLS).
