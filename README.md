# Spendly

A mobile expense-tracking app for students, built with Expo, React Native, TypeScript, and Supabase.

## Features

- Live dashboard totals for all spending, needs, wants, and categories
- Searchable and filterable transaction list
- Authenticated add and delete expense interactions
- Persistent Supabase mobile sessions
- PostgreSQL row-level security so users can access only their own data

## Tech stack

- Expo, React Native, and TypeScript
- React Navigation
- Supabase Auth and PostgreSQL
- React Native StyleSheet components

## Run locally

```bash
cd frontend
npm install
npm start
```

Scan the QR code with Expo Go, or run `npm run android` / `npm run ios` with an emulator available.

## Configure Supabase

1. Create a Supabase project.
2. In the Supabase SQL Editor, run [the expense migration](frontend/supabase/migrations/20260808_create_expenses.sql).
3. Copy `frontend/.env.example` to `frontend/.env`.
4. Set your project values:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

The migration creates the `expenses` table, its validation rules, an index, and row-level security policies. The app supports Google and GitHub OAuth sign-in only.

## Google and GitHub sign-in

The mobile app includes Google and GitHub buttons. Enable both providers before testing them:

1. In Supabase Dashboard, open Authentication > URL Configuration and add `exp://**` as a development redirect URL for Expo Go. This wildcard is only for local development. For a standalone app build, add `spendly://**` instead.
2. In Google Cloud, create a **Web application** OAuth client. Add `https://wmjivimkqbpzujcujzcd.supabase.co/auth/v1/callback` as its authorized redirect URI. In Supabase Dashboard, open Authentication > Providers > Google, enable it, and enter the Google client ID and secret.
3. In GitHub, open Settings > Developer settings > OAuth Apps and register a new OAuth App. Use `https://wmjivimkqbpzujcujzcd.supabase.co/auth/v1/callback` as its Authorization callback URL. Generate a client secret. In Supabase Dashboard, open Authentication > Providers > GitHub, enable it, and enter the GitHub client ID and secret.

Never put Google or GitHub client secrets in the Expo app or `.env`; they belong only in the Supabase provider configuration.

## Project structure

```text
frontend/
|-- App.tsx                             # Native navigation and screens
|-- app.json                            # Expo application configuration
|-- src/
|   |-- hooks/useExpenses.tsx           # Shared expense state and async actions
|   |-- lib/supabase.ts                 # Persistent mobile Supabase client
|   |-- services/expenseService.ts      # Expense CRUD operations
|   `-- types/expense.ts                # Shared expense types
|-- supabase/migrations/                # Database schema and RLS policies
`-- .env.example                        # Required public client environment variables
```

## Commands

From `frontend/`:

```bash
npm start         # Start Expo and show the QR code
npm run android   # Start Expo on Android
npm run ios       # Start Expo on iOS (macOS required)
npm run web       # Start Expo for web
npm run typecheck # Type-check the app
```

## Security notes

Never commit `.env` or a Supabase service-role key. The mobile app should use only the project URL and anon key; database access is protected by Supabase Auth and row-level security.
