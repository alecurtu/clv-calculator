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

// parse total line, round to nearest 0.5
function parseTotalLine(input: string): number {
  const s = (input || '').trim();
  const n = parseFloat(s);
  if (!Number.isFinite(n)) return NaN;
  return Math.round(n * 2) / 2; // force half-points
}

// format half-point number as string (avoids long decimals)
function fmtHalf(n: number): string {
  if (!Number.isFinite(n)) return '';
  const rounded = Math.round(n * 2) / 2;
  return Number.isInteger(rounded) ? `${rounded}.0` : `${rounded}`;
}

export default function CLVCalculator() {
  const [side, setSide] = useState<'Over' | 'Under'>('Under');

  // TEXT states so mobile shows full keyboard (+/- available everywhere)
  const [originalLineText, setOriginalLineText] = useState<string>('46.0');
  const [closingLineText, setClosingLineText] = useState<string>('47.0');
  const [originalOddsText, setOriginalOddsText] = useState<string>('-102');
  const [closingOddsText, setClosingOddsText] = useState<string>('-107');

  const [centsPerHalfPoint, setCentsPerHalfPoint] = useState<number>(10);
  const [roundMode, setRoundMode] = useState<'exact' | 'tick5' | 'tick10'>('exact');

  // parsed values (calc time)
  const originalLine = parseTotalLine(originalLineText);
  const closingLine = parseTotalLine(closingLineText);
  const originalOdds = parseAmericanOdds(originalOddsText);
  const closingOdds = parseAmericanOdds(closingOddsText);

  const results = useMemo(() => {
    const hpMoved =
      Number.isFinite(originalLine) && Number.isFinite(closingLine)
        ? Math.abs(closingLine - originalLine) / 0.5
        : NaN;

    const direction =
      Number.isFinite(originalLine) && Number.isFinite(closingLine)
        ? computeDirection(side, originalLine as number, closingLine as number)
        : 0;

    const equivRaw =
      Number.isFinite(closingOdds) && Number.isFinite(hpMoved)
        ? (closingOdds as number) + (hpMoved as number) * centsPerHalfPoint * direction
        : NaN;

    const equivConverted = Number.isFinite(equivRaw) ? normalizeAmerican(equivRaw as number) : NaN;

    const tick = roundMode === 'tick5' ? 5 : roundMode === 'tick10' ? 10 : 0;
    const equivMarket =
      Number.isFinite(equivConverted) && tick
        ? roundToTick(equivConverted as number, tick)
        : equivConverted;

    const pOrig = Number.isFinite(originalOdds) ? americanToProb(originalOdds as number) : NaN;
    const pEquiv = Number.isFinite(equivMarket) ? americanToProb(equivMarket as number) : NaN;

    const edgeCentsModel =
      Number.isFinite(hpMoved) ? (hpMoved as number) * centsPerHalfPoint * direction : NaN;
    const edgeProb =
      Number.isFinite(pOrig) && Number.isFinite(pEquiv) ? (pEquiv as number) - (pOrig as number) : NaN;

    return {
      hpMoved,
      direction,
      equivRaw,
      equivConverted,
      equivMarket,
      pOrig,
      pEquiv,
      edgeCentsModel,
      edgeProb
    };
  }, [side, originalLine, closingLine, originalOdds, closingOdds, centsPerHalfPoint, roundMode]);

  const Stat = ({ label, value, helper }: { label: string; value: React.ReactNode; helper?: string }) => (
    <div className="flex flex-col gap-1">
      <div className="text-sm text-slate-600 dark:text-slate-400">{label}</div>
      <div className="text-xl font-semibold tracking-tight">{value}</div>
      {helper && <div className="text-xs text-slate-500 dark:text-slate-400">{helper}</div>}
    </div>
  );

  const clvIsPositive = Number.isFinite(results.edgeCentsModel) && (results.edgeCentsModel as number) > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">NFL Closing Line Value (CLV)</h2>
        <span
          className={`px-2 py-0.5 rounded-full text-xs ${
            clvIsPositive
              ? 'bg-emerald-500/15 text-emerald-400'
              : 'bg-fuchsia-500/15 text-fuchsia-300'
          }`}
        >
          {clvIsPositive ? 'Positive CLV' : 'Negative CLV'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-2xl border p-6 bg-white/80 dark:bg-white/5">
        {/* Side */}
        <div className="flex flex-col gap-2">
          <label className="text-sm text-slate-600 dark:text-slate-300">Side</label>
          <select
            value={side}
            onChange={(e) => setSide(e.target.value as 'Over' | 'Under')}
            className="h-10 rounded-md border px-3 bg-white/70 dark:bg-white/5"
          >
            <option value="Under">Under</option>
            <option value="Over">Over</option>
          </select>
        </div>

        {/* Original Line (full keyboard; we enforce half-points on blur) */}
        <div className="flex flex-col gap-2">
          <label className="text-sm text-slate-600 dark:text-slate-300">Original Line (total)</label>
          <input
            type="text"
            inputMode="text"            // full keyboard on mobile
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            placeholder="e.g., 46.5"
            value={originalLineText}
            onChange={(e) => setOriginalLineText(e.target.value)}
            onBlur={() => {
              const n = parseTotalLine(originalLineText);
              if (Number.isFinite(n)) setOriginalLineText(fmtHalf(n));
            }}
            className="h-10 rounded-md border px-3 bg-white/70 dark:bg-white/5"
          />
        </div>

        {/* Original Odds (accept + / - / EV) */}
        <div className="flex flex-col gap-2">
          <label className="text-sm text-slate-600 dark:text-slate-300">Original Odds (American)</label>
          <input
            type="text"
            inputMode="text"            // full keyboard on mobile so + / - are easy
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            placeholder="+120 or -110 (EV for +100)"
            value={originalOddsText}
            onChange={(e) => setOriginalOddsText(e.target.value)}
            className="h-10 rounded-md border px-3 bg-white/70 dark:bg-white/5"
          />
        </div>

        {/* Closing Line */}
        <div className="flex flex-col gap-2">
          <label className="text-sm text-slate-600 dark:text-slate-300">Closing Line (total)</label>
          <input
            type="text"
            inputMode="text"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            placeholder="e.g., 47.0"
            value={closingLineText}
            onChange={(e) => setClosingLineText(e.target.value)}
            onBlur={() => {
              const n = parseTotalLine(closingLineText);
              if (Number.isFinite(n)) setClosingLineText(fmtHalf(n));
            }}
            className="h-10 rounded-md border px-3 bg-white/70 dark:bg-white/5"
          />
        </div>

        {/* Closing Odds */}
        <div className="flex flex-col gap-2">
          <label className="text-sm text-slate-600 dark:text-slate-300">Closing Odds (American)</label>
          <input
            type="text"
            inputMode="text"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            placeholder="+120 or -110 (EV for +100)"
            value={closingOddsText}
            onChange={(e) => setClosingOddsText(e.target.value)}
            className="h-10 rounded-md border px-3 bg-white/70 dark:bg-white/5"
          />
        </div>

        {/* Cents per 0.5 */}
        <div className="flex flex-col gap-2">
          <label className="text-sm text-slate-600 dark:text-slate-300">Cents per Half-Point</label>
          <input
            type="range"
            min={5}
            max={25}
            step={1}
            value={centsPerHalfPoint}
            onChange={(e) => setCentsPerHalfPoint(parseInt(e.target.value))}
          />
          <div className="text-xs text-slate-500">Current: {centsPerHalfPoint}¢ per 0.5</div>
        </div>

        {/* Rounding buttons — responsive grid (stack on mobile) */}
        <div className="flex flex-col gap-2 md:col-span-3">
          <label className="text-sm text-slate-600 dark:text-slate-300">Market Rounding</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              onClick={() => setRoundMode('exact')}
              className={`w-full h-10 rounded-md px-3 border bg-white/70 dark:bg-white/5 text-xs sm:text-sm leading-tight ${
                roundMode === 'exact' ? 'ring-2 ring-cyan-300' : ''
              }`}
            >
              Exact (no-vig)
            </button>
            <button
              onClick={() => setRoundMode('tick5')}
              className={`w-full h-10 rounded-md px-3 border bg-white/70 dark:bg-white/5 text-xs sm:text-sm leading-tight ${
                roundMode === 'tick5' ? 'ring-2 ring-cyan-300' : ''
              }`}
            >
              Nearest 5¢
            </button>
            <button
              onClick={() => setRoundMode('tick10')}
              className={`w-full h-10 rounded-md px-3 border bg-white/70 dark:bg-white/5 text-xs sm:text-sm leading-tight ${
                roundMode === 'tick10' ? 'ring-2 ring-cyan-300' : ''
              }`}
            >
              Nearest 10¢
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border p-6 bg-white/80 dark:bg-white/5 flex flex-col gap-4">
          <Stat label="Half-Points Moved" value={Number.isFinite(results.hpMoved) ? (results.hpMoved as number).toFixed(1) : '–'} />
          <Stat label="Direction (model)" value={results.direction > 0 ? '+ toward plus' : '- toward minus'} />
          <Stat label="Equivalent Closing Odds @ Original Line (raw)" value={formatOdds(Math.round(results.equivRaw as number))} helper="Model shift from closing odds" />
          <Stat label="Equivalent Closing Odds (converted)" value={formatOdds(Math.round(results.equivConverted as number))} helper="Implied-prob normalized" />
          <Stat label="Equivalent Closing Odds (market-rounded)" value={formatOdds(Math.round(results.equivMarket as number))} helper={roundMode === 'exact' ? 'No rounding' : `Rounded to ${roundMode === 'tick5' ? '5' : '10'}¢ tick`} />
        </div>

        <div className="rounded-2xl border p-6 bg-white/80 dark:bg-white/5 flex flex-col gap-4">
          <Stat label="Implied Prob — Your Bet" value={Number.isFinite(results.pOrig) ? `${((results.pOrig as number) * 100).toFixed(2)}%` : '–'} />
          <Stat label="Implied Prob — Equivalent @ Orig Line" value={Number.isFinite(results.pEquiv) ? `${((results.pEquiv as number) * 100).toFixed(2)}%` : '–'} />
          <Stat label="Edge (Probability Points)" value={Number.isFinite(results.edgeProb) ? `${((results.edgeProb as number) * 100).toFixed(2)} pp` : '–'} helper="Positive = you beat the close" />
        </div>

        <div className="rounded-2xl border p-6 bg-white/80 dark:bg-white/5 flex flex-col gap-4">
          <Stat label="Edge (Cents vs Close)" value={`${Number.isFinite(results.edgeCentsModel) && (results.edgeCentsModel as number) > 0 ? '+' : ''}${Number.isFinite(results.edgeCentsModel) ? (results.edgeCentsModel as number).toFixed(1) : '–'}¢`} helper="hp moved × cents/0.5 × direction" />
          <div className="text-sm text-slate-600 dark:text-slate-400">
            <ul className="list-disc ml-5 mt-1">
              <li>Totals accept any input; they’ll snap to the nearest 0.5 on blur.</li>
              <li>Odds accept +120 / -110 / EV and compute immediately.</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          className="h-9 rounded-md px-3 border bg-white/70 dark:bg-white/5"
          onClick={() => {
            setSide('Under');
            setOriginalLineText('46.0');
            setClosingLineText('47.0');
            setOriginalOddsText('-102');
            setClosingOddsText('-107');
            setCentsPerHalfPoint(10);
            setRoundMode('exact');
          }}
        >
          Load Under Demo
        </button>
        <button
          className="h-9 rounded-md px-3 border bg-white/70 dark:bg-white/5"
          onClick={() => {
            setSide('Over');
            setOriginalLineText('46.0');
            setClosingLineText('47.0');
            setOriginalOddsText('-107');
            setClosingOddsText('-106');
            setCentsPerHalfPoint(10);
            setRoundMode('tick5');
          }}
        >
          Load Over Demo
        </button>
        <button
          className="h-9 rounded-md px-3 border bg-white/70 dark:bg-white/5"
          onClick={() => {
            setSide('Under');
            setOriginalLineText('43.0');
            setClosingLineText('44.0');
            setOriginalOddsText('-107');
            setClosingOddsText('-110');
            setCentsPerHalfPoint(10);
            setRoundMode('tick5');
          }}
        >
          Load Example #3
        </button>
      </div>
    </div>
  );
}
