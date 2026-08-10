'use client';

import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Wallet, AlertCircle, Sparkles } from 'lucide-react';

export function AuthScreen() {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    setLoading(provider);
    setError(null);
    try {
      const redirectTo = `${window.location.origin}/auth/callback`;
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
        },
      });

      if (authError) throw authError;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Social sign-in failed. Please try again.');
      setLoading(null);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        backgroundColor: 'var(--bg-page)',
      }}
    >
      <div
        className="bento-card animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '3rem 2.25rem',
          textAlign: 'center',
        }}
      >
        <div className="bento-glow-spot" />

        {/* Brand Icon */}
        <div
          style={{
            width: '68px',
            height: '68px',
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto',
            boxShadow: '0 8px 30px var(--primary-blue-glow)',
          }}
        >
          <Wallet size={36} color="#ffffff" />
        </div>

        <div style={{ display: 'inline-flex', marginBottom: '0.75rem' }}>
          <span className="bento-pill">
            <Sparkles size={13} />
            <span>STUDENT EXPENSE TRACKER</span>
          </span>
        </div>

        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.65rem' }}>
          Welcome to Spendly
        </h1>
        <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', marginBottom: '2.25rem', lineHeight: 1.6 }}>
          Smart, effortless expense tracking. Categorize needs & wants, analyze spending habits, and master your budget.
        </p>

        {error && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              padding: '0.85rem 1rem',
              backgroundColor: 'var(--accent-red-bg)',
              border: '1px solid var(--accent-red)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--accent-red-text)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              marginBottom: '1.5rem',
              textAlign: 'left',
            }}
          >
            <AlertCircle size={17} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Google OAuth Button */}
          <button
            className="btn-secondary"
            onClick={() => handleOAuthSignIn('google')}
            disabled={loading !== null}
            style={{
              width: '100%',
              padding: '0.85rem 1.25rem',
              fontSize: '0.9375rem',
              fontWeight: 700,
              justifyContent: 'center',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{loading === 'google' ? 'Redirecting to Google...' : 'Continue with Google'}</span>
          </button>

          {/* GitHub OAuth Button */}
          <button
            className="btn-secondary"
            onClick={() => handleOAuthSignIn('github')}
            disabled={loading !== null}
            style={{
              width: '100%',
              padding: '0.85rem 1.25rem',
              fontSize: '0.9375rem',
              fontWeight: 700,
              justifyContent: 'center',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
            <span>{loading === 'github' ? 'Redirecting to GitHub...' : 'Continue with GitHub'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
