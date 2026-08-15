import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';
import { ThemeProvider } from '../context/ThemeProvider';
import { SessionProvider } from '../context/SessionProvider';
import { ExpenseProvider } from '../hooks/useExpenses';
import { PWAPrompt } from '../components/PWAPrompt';

export const metadata: Metadata = {
  title: 'Spendly | What can I spend today?',
  description:
    'Set what you have and how long it has to last. Spendly works out what you can spend today, and recalculates every morning.',
  manifest: '/manifest.json',
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    // iOS ignores SVG here and wants a raster, full-bleed square; it applies its
    // own corner mask.
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <SessionProvider>
            <ExpenseProvider>
              {children}
              <PWAPrompt />
            </ExpenseProvider>
          </SessionProvider>
        </ThemeProvider>
        <Script
          src="https://cloud.umami.is/script.js"
          data-website-id="39202846-ccbc-419f-8dd1-1dc5aa8c802f"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
