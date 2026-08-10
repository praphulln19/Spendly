import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '../context/ThemeProvider';
import { ExpenseProvider } from '../hooks/useExpenses';
import { PWAPrompt } from '../components/PWAPrompt';

export const metadata: Metadata = {
  title: 'Spendly | Student Expense Tracker',
  description: 'A modern mobile and web expense-tracking app for students, built with Next.js 15, React 19, and Supabase.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Spendly',
  },
};

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body>
        <ThemeProvider>
          <ExpenseProvider>
            {children}
            <PWAPrompt />
          </ExpenseProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
