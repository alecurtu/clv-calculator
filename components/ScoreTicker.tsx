'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
type Score = { id: string; home: string; away: string; hs: number; as: number; status: string };

export default function ScoreTicker() {
  const [scores, setScores] = useState<Score[]>([]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const r = await fetch('/api/scores', { next: { revalidate: 30 } as any });
        if (!r.ok) return;
        const data = (await r.json()) as Score[];
        if (active) setScores(data);
      } catch {}
    };
    load();
    const t = setInterval(load, 30000);
    return () => { active = false; clearInterval(t); };
  }, []);

  if (!scores.length) {
    return (
      <div className="ticker w-full sticky top-0 z-50 bg-slate-900 text-slate-50 border-b border-slate-800">
        <div className="mx-auto max-w-6xl px-4 py-2 text-sm">NFL Scores: loading…</div>
      </div>
    );
  }

  const row = (i:number) => (
    <div className="inline-flex items-center gap-6 pr-10" key={i}>
      {scores.map((g, idx) => (
        <Link key={idx} href={`https://www.espn.com/nfl/game/_/gameId/${g.id}`} target="_blank" className="inline-flex items-center gap-2 hover:underline">
          <span className="font-semibold">{g.away}</span>
          <span>{g.as}</span>
          <span className="opacity-70">@</span>
          <span className="font-semibold">{g.home}</span>
          <span>{g.hs}</span>
          <span className="text-xs opacity-80">{g.status}</span>
        </Link>
      ))}
    </div>
  );

  return (
    <div className="ticker w-full sticky top-0 z-50 bg-slate-900 text-slate-50 border-b border-slate-800 overflow-hidden">
      <div className="mx-auto max-w-[2000px] py-2 text-sm">
        <div className="ticker-track">{row(0)}{row(1)}</div>
      </div>
    </div>
  );
}
