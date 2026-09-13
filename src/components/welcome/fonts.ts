import { Space_Grotesk } from 'next/font/google';

/*
 * Inter (the site-wide body font) reads too neutral for the hero headline --
 * the reference's display type is a tighter, taller-x-height grotesk. Scoped
 * to this route only, via next/font so it's self-hosted at build time rather
 * than a render-blocking Google Fonts request.
 */
export const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});
