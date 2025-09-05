'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BANNERS } from '@/lib/banners';

export default function BannerBar() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % BANNERS.length), 15000);
    return () => clearInterval(t);
  }, []);

  const b = BANNERS[idx];
  if (!b) return null;
  return (
    <div className="w-full bg-white/80 backdrop-blur sticky top-8 z-40 border-b">
      <div className="mx-auto max-w-6xl px-4 py-2 flex justify-center">
        <Link href={b.href} target="_blank" rel="noopener noreferrer" className="shadow-sm rounded-lg overflow-hidden">
          {b.creative.lg && (
            <div className="hidden lg:block">
              <Image src={b.creative.lg} alt={b.alt || 'Banner'} width={970} height={90} priority />
            </div>
          )}
          {b.creative.md && (
            <div className="hidden sm:block lg:hidden">
              <Image src={b.creative.md} alt={b.alt || 'Banner'} width={728} height={90} priority />
            </div>
          )}
          {b.creative.sm && (
            <div className="block sm:hidden">
              <Image src={b.creative.sm} alt={b.alt || 'Banner'} width={320} height={50} priority />
            </div>
          )}
        </Link>
      </div>
    </div>
  );
}
