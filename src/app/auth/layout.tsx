import type { Metadata } from 'next';

/* Nothing under /auth is ever a landing point from search. */
export const metadata: Metadata = {
  title: 'Signing in',
  robots: { index: false, follow: false, nocache: true },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
