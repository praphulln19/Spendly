'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { clearAllScoped } from '../lib/userStorage';

/*
 * One place that knows about the session.
 *
 * The OAuth hash-token bootstrap used to be copy-pasted into every page and the
 * expense store opened a third `onAuthStateChange` subscription of its own.
 * Three listeners racing to set the same state is how a signed-out user ends up
 * looking at the previous user's numbers, so it happens exactly once here.
 */

type SessionState = {
  session: Session | null;
  userId: string | null;
  /** False until the initial session lookup settles */
  ready: boolean;
};

const SessionContext = createContext<SessionState>({ session: null, userId: null, ready: false });

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    const stripAuthHash = () => {
      if (typeof window === 'undefined') return;
      if (window.location.hash.includes('access_token')) {
        window.history.replaceState(null, '', window.location.pathname);
      }
    };

    const bootstrap = async () => {
      // Implicit-flow providers hand the tokens back in the URL fragment.
      if (typeof window !== 'undefined' && window.location.hash.includes('access_token=')) {
        try {
          const params = new URLSearchParams(window.location.hash.substring(1));
          const access_token = params.get('access_token');
          const refresh_token = params.get('refresh_token');

          if (access_token && refresh_token) {
            const { data } = await supabase.auth.setSession({ access_token, refresh_token });
            if (data.session && active) {
              setSession(data.session);
              setReady(true);
              stripAuthHash();
              return;
            }
          }
        } catch {
          // Fall through to getSession().
        }
      }

      const { data } = await supabase.auth.getSession();
      if (!active) return;
      setSession(data.session);
      setReady(true);
    };

    void bootstrap();

    const { data: subscription } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!active) return;
      // Drop every cached figure before the next account can read it.
      if (event === 'SIGNED_OUT') clearAllScoped();
      setSession(nextSession);
      setReady(true);
      if (nextSession) stripAuthHash();
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  return (
    <SessionContext.Provider value={{ session, userId: session?.user?.id ?? null, ready }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}
