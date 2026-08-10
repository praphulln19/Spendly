import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '../context/ThemeProvider';
import { ExpenseProvider } from '../hooks/useExpenses';

export const metadata: Metadata = {
  title: 'Spendly | Student Expense Tracker',
  description: 'A modern mobile and web expense-tracking app for students, built with Next.js, React 19, and Supabase.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <ExpenseProvider>{children}</ExpenseProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
