// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import ScoreTicker from '@/components/ScoreTicker';

export const metadata: Metadata = {
  title: 'NFL CLV Calculator',
  description: 'Compute Closing Line Value for NFL totals with exact conversions and market-style rounding.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900">
        <ScoreTicker />
        {children}
      </body>
    </html>
  );
}
