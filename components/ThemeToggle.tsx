'use client';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const ls = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
    const prefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = ls ? ls === 'dark' : prefersDark;
    document.documentElement.classList.toggle('dark', initial);
    setDark(initial);
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => {
      const ls = localStorage.getItem('theme');
      if (!ls) { // only react to system if user hasn't chosen
        document.documentElement.classList.toggle('dark', e.matches);
        setDark(e.matches);
      }
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  }

  return (
    <button
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="inline-flex items-center gap-2 rounded-xl border border-slate-300/60 dark:border-white/10 px-3 h-9 bg-white/70 dark:bg-white/5 hover:bg-white/90 dark:hover:bg-white/10 transition-colors neon-border"
    >
      {dark ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-neon-cyan">
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"></path>
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-500">
          <path d="M6.76 4.84l-1.8-1.79L3.17 4.84l1.79 1.79 1.8-1.79zM1 13h3v-2H1v2zm10 10h2v-3h-2v3zm9-10h3v-2h-3v2zM6.76 19.16l-1.8 1.79 1.79 1.79 1.8-1.79-1.79-1.79zM13 1h-2v3h2V1zm6.07 3.05l-1.79 1.79 1.8 1.79 1.79-1.79-1.8-1.79zM17.24 19.16l1.79 1.79 1.79-1.79-1.79-1.79-1.79 1.79z"></path>
        </svg>
      )}
      <span className="text-sm">{dark ? 'Dark' : 'Light'}</span>
    </button>
  );
}
