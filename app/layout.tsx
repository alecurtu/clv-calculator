import './globals.css';  // 👈 required for Tailwind + global styles
import BannerBar from '@/components/BannerBar';
import ScoreTicker from '@/components/ScoreTicker';

export const metadata = {
  title: 'NFL CLV Calculator',
  description: 'Compute Closing Line Value for NFL totals with exact conversions and market-style rounding.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900">
        <ScoreTicker />
        <BannerBar />
        {children}
      </body>
    </html>
  );
}
