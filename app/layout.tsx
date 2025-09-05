- import BannerBar from '@/components/BannerBar';
  import ScoreTicker from '@/components/ScoreTicker';

  export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
      <html lang="en">
        <body className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900">
          <ScoreTicker />
-         <BannerBar />
          {children}
        </body>
      </html>
    );
  }
