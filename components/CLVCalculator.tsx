'use client';
import React, { useMemo, useState } from 'react';
import {
  americanToProb,
  normalizeAmerican,
  formatOdds,
  roundToTick,
  computeDirection
} from '@/lib/odds';

// parse "+120" / "-110" / "EV" / "even" into a number
function parseAmericanOdds(input: string): number {
  const s = (input || '').trim().toUpperCase();
  if (s === 'EVEN' || s === 'EV') return 100; // +100
  const m = s.match(/^[+-]?\d{1,4}$/);
  if (!m) return NaN;
  return parseInt(s, 10);
}

export default function CLVCalculator() {
  const [side, setSide] = useState<'Over' | 'Under'>('Under');

  // totals in half-points
  const [originalLine, setOriginalLine] = useState<number>(46);
  const [closingLine, setClosingLine] = useState<number>(47);

  // odds as TEXT so users can type +120 / -110 / EV
  const [originalOddsText, setOriginalOddsText] = useState<string>('-102');
  const [closingOddsText, setClosingOddsText] = useState<string>('-107');

  const [centsPerHalfPoint, setCentsPerHalfPoint] = useState<number>(10);
  const [roundMode, setRoundMode] = useState<'exact' | 'tick5' | 'tick10'>('exact');

  const results = useMemo(() => {
    const hpMoved = Math.abs(closingLine - originalLine) / 0.5;
    const direction = computeDirection(side, originalLine, closingLine);

    const closingOdds = parseAmericanOdds(closingOddsText);
    const originalOdds = parseAmericanOdds(originalOddsText);

    const equivRaw = Number.isFinite(closingOdds)
      ? closingOdds + hpMoved * centsPerHalfPoint * direction
      : NaN;

    const equivConverted = Number.isFinite(equivRaw) ? normalizeAmerican(equivRaw) : NaN;

    const tick = roundMode === 'tick5' ? 5 : roundMode === 'tick10' ? 10 : 0;
    const equivMarket = Number.isFinite(equivConverted)
      ? (tick ? roundToTick(equivConverted, tick) : equivConverted)
      : NaN;

    const pOrig = Number.isFinite(originalOdds) ? americanToProb(originalOdds) : NaN;
    const pEquiv = Number.isFinite(equivMarket) ? americanToProb(equivMarket) : NaN;

    const edgeCentsModel = hpMoved * centsPerHalfPoint * direction;
    const edgeProb = Number.isFinite(pOrig) && Number.isFinite(pEquiv) ? pEquiv - pOrig : NaN;

    return {
      hpMoved,
      direction,
      originalOdds,
      closingOdds,
      equivRaw,
      equivConverted,
      equivMarket,
      pOrig,
      pEquiv,
      edgeCentsModel,
      edgeProb
    };
  }, [side, originalLine, closingLine, originalOddsText, closingOddsText, centsPerHalfPoint, roundMode]);

  const Stat = ({ label, value, helper }: { label: string; value: React.ReactNode; helper?: string }) => (
    <div className="flex flex-col gap-1">
      <div className="text-sm text-slate-600 dark:text-slate-400">{label}</div>
      <div className="text-xl font-semibold tracking-tight">{value}</div>
      {helper && <div className="text-xs text-slate-500 dark:text-slate-400">{helper}</div>}
    </div>
  );

  // Positive CLV if your implied prob is LOWER than fair (you got a better price).
  // edgeProb = pEquiv - pOrig → beat the close iff edgeProb < 0.
  const clvIsPositive =
    Number.isFinite(results.edgeProb) ? results.edgeProb < 0 : results.edgeCentsModel > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">NFL Closing Line Value (CLV)</h2>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            You: <span className="font-medium">
              {formatOdds(Number.isFinite(results.originalOdds) ? results.originalOdds! : NaN)}
            </span>
            {' · '}
            Fair @ your line: <span className="font-medium">
              {formatOdds(Math.round(results.equivMarket))}
            </span>
          </div>
        </div>
        <span
          className={`px-2 py-0.5 rounded-full text-xs ${
            clvIsPositive
              ? 'bg-emerald-500/15 text-emerald-400'
              : 'bg-fuchsia-500/15 text-fuchsia-300'
          }`}
        >
          {clvIsPositive ? 'You beat the close' : 'Worse than close'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-2xl border p-6 bg-white/80 dark:bg-white/5">
        {/* Side */}
        <div className="flex flex-col gap-2">
          <label htmlFor="side" className="text-sm text-slate-600 dark:text-slate-300">Side</la
