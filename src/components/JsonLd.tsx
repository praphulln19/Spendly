import { siteDescription, siteName, siteUrl } from '../lib/site';

/*
 * Structured data for the landing page.
 *
 * A single @graph rather than three separate blocks, so the site, the publisher
 * and the app are explicitly the same entity instead of three things Google has
 * to guess are related. Nothing here is claimed that the page does not show:
 * no ratings, no download counts, and the price is genuinely zero.
 */
const graph = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: siteName,
      alternateName: 'Spendly App',
      description: siteDescription,
      inLanguage: 'en',
      publisher: { '@id': `${siteUrl}/#organization` },
    },
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: siteName,
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/icon.svg`,
      },
      sameAs: ['https://github.com/praphulln19/Spendly'],
    },
    {
      '@type': ['SoftwareApplication', 'WebApplication'],
      '@id': `${siteUrl}/#app`,
      name: siteName,
      url: siteUrl,
      description: siteDescription,
      applicationCategory: 'FinanceApplication',
      applicationSubCategory: 'Budgeting',
      operatingSystem: 'Web, iOS, Android',
      browserRequirements: 'Requires JavaScript.',
      isAccessibleForFree: true,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      featureList: [
        'Daily spending allowance recalculated every morning',
        'Two-tap expense logging',
        'Works offline and syncs when you reconnect',
        'Need versus want split priced in days of allowance',
        'Monthly insights, trends and category breakdown',
        'CSV and PDF export',
        'Installable as a progressive web app',
      ],
      publisher: { '@id': `${siteUrl}/#organization` },
    },
  ],
};

export function JsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
