/*
 * One source of truth for everything a crawler reads.
 *
 * The canonical origin, the title/description pair and the social card used to
 * exist only inside the root layout, which left the sitemap, the robots file and
 * the OG image with no way to agree with it. Anything that has to name the site
 * imports from here.
 */

function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, '');

  // Vercel injects the production domain at build time, so a deploy resolves to
  // the right origin even before NEXT_PUBLIC_SITE_URL is set by hand.
  const vercel =
    process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel.replace(/\/+$/, '')}`;

  return 'https://spendly-bice-iota.vercel.app';
}

export const siteUrl = resolveSiteUrl();

export const siteName = 'Spendly';

export const siteTitle = 'Spendly | What can I spend today?';

/*
 * Search results truncate around 155 characters, so the sentence that has to
 * survive the cut comes first and the brand name is in it.
 */
export const siteDescription =
  'Spendly turns your budget into one daily number. Set what you have and how long it has to last, log spends in two taps, and it recalculates every morning.';

export const siteKeywords = [
  'Spendly',
  'Spendly app',
  'daily spending allowance',
  'what can I spend today',
  'daily budget app',
  'expense tracker',
  'daily allowance calculator',
  'budget tracker',
  'spending tracker app',
  'offline expense tracker',
  'personal finance app',
];

/** Routes that are only meaningful to a signed-in user, so never indexed. */
export const privateRoutes = ['/expenses', '/insights', '/auth/callback'];
