import type { Metadata } from 'next';

/*
 * Signed out, this route answers with the landing page, so leaving it indexable
 * would offer Google a second copy of the home page under a different URL.
 * Crawlable, but never indexed.
 */
export const metadata: Metadata = {
  title: 'Transactions',
  robots: { index: false, follow: false, nocache: true },
};

export default function ExpensesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
