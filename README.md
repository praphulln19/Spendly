# Spendly

A responsive expense-tracking app for students, built with React, TypeScript, Vite, and Supabase.

## Features

- Dashboard with total, needs, and wants spending summaries
- Expense list with categories and transaction details
- Add and delete expense interactions
- Supabase-ready typed data layer
- PostgreSQL row-level security so users can access only their own data

## Tech stack

- React + TypeScript
- Vite
- Supabase Auth and PostgreSQL
- CSS

## Run locally

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite (normally `http://127.0.0.1:5173`).

## Configure Supabase

1. Create a Supabase project.
2. In the Supabase SQL Editor, run [the expense migration](frontend/supabase/migrations/20260808_create_expenses.sql).
3. Copy `frontend/.env.example` to `frontend/.env.local`.
4. Set your project values:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

The migration creates the `expenses` table, its validation rules, an index, and row-level security policies. It requires authenticated users and ensures each user can read, create, update, and delete only their own records.

## Project structure

```text
frontend/
├── src/
│   ├── hooks/useExpenses.ts        # Expense state and async actions
│   ├── lib/supabase.ts             # Supabase client
│   ├── services/expenseService.ts  # Expense CRUD operations
│   └── types/expense.ts            # Shared expense types
├── supabase/migrations/            # Database schema and RLS policies
└── .env.example                    # Required public client environment variables
```

## Commands

From `frontend/`:

```bash
npm run dev      # Start the development server
npm run build    # Type-check and create a production build
npm run preview  # Serve the production build locally
```

## Security notes

Never commit `.env.local` or a Supabase service-role key. The browser app should use only the project URL and anon key; database access is protected by Supabase Auth and row-level security.
