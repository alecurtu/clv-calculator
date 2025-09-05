import './globals.css';
import type { Metadata } from 'next';
import ScoreTicker from '@/components/ScoreTicker';
import ThemeToggle from '@/components/ThemeToggle';

export const metadata: Metadata = {
  title: 'NFL CLV Calculator',
  description: 'Compute Closing Line Value for NFL totals with a neon UI and dark/light mode.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <ScoreTicker />
        <header className="sticky top-8 z-40">
          <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between glass rounded-2xl border border-slate-200/60 dark:border-white/10 neon-border">
            <h1 className="text-lg font-semibold tracking-tight">NFL CLV Calculator</h1>
            <ThemeToggle />
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
