import type { Metadata } from 'next';

/* Same reasoning as the transactions route: private surface, never indexed. */
export const metadata: Metadata = {
  title: 'Insights',
  robots: { index: false, follow: false, nocache: true },
};

export default function InsightsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
