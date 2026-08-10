'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        if (typeof window !== 'undefined' && (window.location.hash || window.location.search)) {
          window.history.replaceState(null, '', '/');
        }
        router.replace('/');
      } else {
        router.replace('/');
      }
    };

    void handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-[#f5f5f7] dark:bg-black text-neutral-400">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      <p className="text-xs font-bold font-display tracking-tight">Completing sign in...</p>
    </div>
  );
}
