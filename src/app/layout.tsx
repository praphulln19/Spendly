import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';
import { ThemeProvider } from '../context/ThemeProvider';
import { SessionProvider } from '../context/SessionProvider';
import { ExpenseProvider } from '../hooks/useExpenses';
import { PWAPrompt } from '../components/PWAPrompt';
import { siteDescription, siteKeywords, siteName, siteTitle, siteUrl } from '../lib/site';

export const metadata: Metadata = {
  // Every relative URL below (canonical, OG image, manifest) resolves against
  // this, so a missing metadataBase is what silently produces localhost links
  // in production social cards.
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: '%s | Spendly',
  },
  description: siteDescription,
  applicationName: siteName,
  keywords: siteKeywords,
  authors: [{ name: 'Praphull N', url: 'https://github.com/praphulln19' }],
  creator: 'Praphull N',
  publisher: siteName,
  category: 'finance',
  alternates: {
    canonical: '/',
  },
  manifest: '/manifest.json',
  openGraph: {
    type: 'website',
    siteName,
    title: siteTitle,
    description: siteDescription,
    url: '/',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    // iOS ignores SVG here and wants a raster, full-bleed square; it applies its
    // own corner mask.
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: siteName,
  },
  formatDetection: {
    telephone: false,
  },
  /*
   * Search Console's meta-tag verification. Kept in an env var so proving
   * ownership is a Vercel setting and a redeploy rather than a code change, and
   * so the tag simply disappears from the markup if the var is unset.
   */
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f5f7' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
  width: 'device-width',
  initialScale: 1,
  // Pinch-zoom stays available: suppressing it is an accessibility failure that
  // Lighthouse reports and that costs nothing to keep.
  maximumScale: 5,
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
