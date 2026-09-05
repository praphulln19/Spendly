'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type ThemeContextType = {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
});

/*
 * The `dark` class is applied by the boot script in the root layout, before the
 * first paint. This provider only tracks the value so the toggle can render the
 * right icon.
 *
 * It used to hide the whole tree behind `visibility: hidden` until it mounted,
 * which meant every byte the server sent -- headline, copy, the lot -- arrived
 * invisible. That is a page with no readable content for anything that does not
 * execute JavaScript, and it delayed the largest paint for everything that does.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Read back whatever the boot script already resolved, so the two can never
    // disagree about the current theme.
    setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('spendly-theme', nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
