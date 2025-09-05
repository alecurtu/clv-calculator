import { NextResponse } from 'next/server';

export type Score = {
  id: string;
  home: string; away: string; hs: number; as: number; status: string;
};

const BASE = process.env.ESPN_SCOREBOARD_BASE || 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard';
const REVALIDATE = Number(process.env.SCORES_REVALIDATE || 30);

async function fetchJson(url: string) {
  const r = await fetch(url, { next: { revalidate: REVALIDATE } });
  if (!r.ok) throw new Error(`fetch failed ${r.status}`);
  return r.json();
}

function mapEventsToScores(events: any[]): Score[] {
  return events.map((ev) => {
    const comp = ev?.competitions?.[0];
    const comps = comp?.competitors || [];
    const home = comps.find((c: any) => c.homeAway === 'home');
    const away = comps.find((c: any) => c.homeAway === 'away');
    const status = comp?.status?.type?.shortDetail || ev?.status?.type?.shortDetail || '';
    return {
      id: String(ev?.id || comp?.id || ''),
      home: home?.team?.abbreviation || home?.team?.shortDisplayName || 'HOME',
      away: away?.team?.abbreviation || away?.team?.shortDisplayName || 'AWAY',
      hs: Number(home?.score || 0),
      as: Number(away?.score || 0),
      status
    } as Score;
  });
}

export async function GET() {
  try {
    const today = new Date();
    const y = today.getFullYear();
    const yyyy = y.toString();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');

    const todayUrl = `${BASE}?dates=${yyyy}${mm}${dd}`;
    const todayData = await fetchJson(todayUrl);

    const seasonType = todayData?.season?.type || 2;
    const seasonYear = todayData?.season?.year || y;
    const weekNum = todayData?.week?.number;

    let weekUrl = `${BASE}?seasontype=${seasonType}&week=${weekNum}&year=${seasonYear}&limit=1000`;
    weekUrl += `&dates=${seasonYear}`;
    const weekData = await fetchJson(weekUrl);

    const events = Array.isArray(weekData?.events) ? weekData.events : [];
    const scores = mapEventsToScores(events);

    return NextResponse.json(scores);
  } catch (e) {
    const mock: Score[] = [
      { id: '0', away: 'NYJ', as: 17, home: 'BUF', hs: 24, status: 'Q4 05:12' },
      { id: '1', away: 'KC', as: 13, home: 'BAL', hs: 20, status: 'Q3 10:21' },
      { id: '2', away: 'DAL', as: 7, home: 'PHI', hs: 10, status: 'Sun 1:25' }
    ];
    return NextResponse.json(mock);
  }
}
