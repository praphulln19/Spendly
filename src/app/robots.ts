import type { MetadataRoute } from 'next';
import { siteUrl } from '../lib/site';

/*
 * The signed-in routes are deliberately *not* disallowed here. A crawler has to
 * be able to fetch a page to read the noindex tag on it, so blocking them in
 * robots.txt would leave them eligible for a URL-only listing instead of
 * removing them. They stay crawlable and carry noindex in their own metadata.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
