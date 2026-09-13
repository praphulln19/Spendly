import type { Metadata } from 'next';
import { WelcomeHero } from '../../components/welcome/WelcomeHero';
import { siteDescription, siteTitle } from '../../lib/site';

export const metadata: Metadata = {
  title: { absolute: siteTitle },
  description: siteDescription,
  alternates: {
    canonical: '/welcome',
  },
};

export default function WelcomePage() {
  return <WelcomeHero />;
}
