import type { Metadata } from 'next';
import { JsonLd } from '../components/JsonLd';
import { TodayScreen } from '../components/TodayScreen';
import { siteDescription, siteTitle } from '../lib/site';

/*
 * A server component wrapper around the client screen. It exists so the one
 * indexable route can declare its own canonical and carry the structured data,
 * neither of which a `'use client'` file is allowed to export.
 */
export const metadata: Metadata = {
  title: {
    absolute: siteTitle,
  },
  description: siteDescription,
  alternates: {
    canonical: '/',
  },
};

export default function Page() {
  return (
    <>
      <JsonLd />
      <TodayScreen />
    </>
  );
}
