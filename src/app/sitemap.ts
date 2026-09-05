import type { MetadataRoute } from 'next';
import { siteUrl } from '../lib/site';

/*
 * Only the landing page belongs here. The rest of the app is a signed-in
 * surface: listing it would ask Google to crawl pages that answer with the
 * landing page for a logged-out visitor, which reads as duplicate content.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
  ];
}
