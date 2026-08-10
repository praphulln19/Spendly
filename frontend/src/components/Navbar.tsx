'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '../context/ThemeProvider';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';
import {
  Wallet,
  LayoutDashboard,
  ReceiptText,
  Plus,
  Moon,
  Sun,
  LogOut,
  User as UserIcon,
} from 'lucide-react';

interface NavbarProps {
  session: Session | null;
  onOpenAddExpense?: () => void;
}

export function Navbar({ session, onOpenAddExpense }: NavbarProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSignOut = async () => {
    setDropdownOpen(false);
    await supabase.auth.signOut();
  };

  const userEmail = session?.user?.email || 'User';

  return (
    <header className="glass-card" style={{ borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0, position: 'sticky', top: 0, zIndex: 40 }}>
      <div className="app-container" style={{ padding: '0.85rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px var(--primary-blue-glow)'
            }}>
              <Wallet size={22} color="#ffffff" />
            </div>
            <span style={{ fontSize: '1.35rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              Spendly
            </span>
          </Link>

          {/* Navigation Links */}
          {session && (
            <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link
                href="/"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  color: pathname === '/' ? 'var(--primary-blue)' : 'var(--text-muted)',
                  backgroundColor: pathname === '/' ? 'var(--primary-blue-light)' : 'transparent',
                  transition: 'all 0.15s ease'
                }}
              >
                <LayoutDashboard size={17} />
                <span>Dashboard</span>
              </Link>

              <Link
                href="/expenses"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.5rem 0.85rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  textDecoration: 'none',
                  color: pathname === '/expenses' ? 'var(--primary-blue)' : 'var(--text-muted)',
                  backgroundColor: pathname === '/expenses' ? 'var(--primary-blue-light)' : 'transparent',
                  transition: 'all 0.15s ease'
                }}
              >
                <ReceiptText size={17} />
                <span>Expenses</span>
              </Link>
            </nav>
          )}
        </div>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {session && onOpenAddExpense && (
            <button className="btn-primary" onClick={onOpenAddExpense} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
              <Plus size={18} />
              <span>Add Expense</span>
            </button>
          )}

          {/* Theme Toggle */}
          <button
            className="btn-icon"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun size={19} color="#fbbf24" /> : <Moon size={19} color="var(--text-main)" />}
          </button>

          {/* Profile Dropdown */}
          {session && (
            <div style={{ position: 'relative' }}>
              <button
                className="btn-icon"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-label="User profile"
                style={{ borderRadius: 'var(--radius-full)' }}
              >
                <UserIcon size={19} color="var(--text-main)" />
              </button>

              {dropdownOpen && (
                <div
                  className="animate-fade-in"
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 'calc(100% + 8px)',
                    minWidth: '220px',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.5rem',
                    boxShadow: 'var(--modal-shadow)',
                    zIndex: 50
                  }}
                >
                  <div style={{ padding: '0.625rem 0.75rem', borderBottom: '1px solid var(--border-color)', marginBottom: '0.35rem' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Signed in as</p>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {userEmail}
                    </p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 0.75rem',
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: 'var(--accent-red)',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
