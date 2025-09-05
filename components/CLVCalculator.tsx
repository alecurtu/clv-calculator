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

  // ---- CLV indicators ----
  // Line-based signal: positive if the total moved in your favor (cents model).
  const isPositiveLine = results.edgeCentsModel > 0;

  // Price-based signal: your implied prob vs fair at your line (negative = you beat the close).
  // edgeProb = pEquiv - pOrig → edgeProb < 0 means your price is better than fair.
  const isPositivePrice = Number.isFinite(results.edgeProb) ? results.edgeProb < 0 : false;

  // Badge uses LINE-MOVE (as requested).
  const clvIsPositive = isPositiveLine;

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
            {' · '}
            <span className={`ml-2 ${isPositivePrice ? 'text-emerald-500' : 'text-fuchsia-400'}`}>
              {isPositivePrice ? 'Better price than fair' : 'Worse price than fair'}
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
          {clvIsPositive ? 'Line moved in your favor' : 'Line moved against you'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-2xl border p-6 bg-white/80 dark:bg-white/5">
        {/* Side */}
        <div className="flex flex-col gap-2">
          <label htmlFor="side" className="text-sm text-slate-600 dark:text-slate-300">Side</label>
          <select
            id="side"
            value={side}
            onChange={(e) => setSide(e.target.value as 'Over' | 'Under')}
            className="h-10 rounded-md border px-3 bg-white/70 dark:bg-white/5"
          >
            <option value="Under">Under</option>
            <option value="Over">Over</option>
          </select>
        </div>

        {/* Original Line (0.5 steps) */}
        <div className="flex flex-col gap-2">
          <label htmlFor="origLine" className="text-sm text-slate-600 dark:text-slate-300">Original Line (total)</label>
          <input
            id="origLine"
            type="number"
            step={0.5}
            inputMode="decimal"
            value={originalLine}
            onChange={(e) => setOriginalLine(parseFloat(e.target.value))}
            className="h-10 rounded-md border px-3 bg-white/70 dark:bg-white/5"
          />
        </div>

        {/* Original Odds (+/- allowed) */}
        <div className="flex flex-col gap-2">
          <label htmlFor="origOdds" className="text-sm text-slate-600 dark:text-slate-300">Original Odds (American)</label>
          <input
            id="origOdds"
            type="text"
            inputMode="text"               // full keyboard so + / - are available
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            placeholder="+120 or -110 (EV for +100)"
            value={originalOddsText}
            onChange={(e) => setOriginalOddsText(e.target.value)}
            className="h-10 rounded-md border px-3 bg-white/70 dark:bg-white/5"
          />
        </div>

        {/* Closing Line (0.5 steps) */}
        <div className="flex flex-col gap-2">
          <label htmlFor="closeLine" className="text-sm text-slate-600 dark:text-slate-300">Closing Line (total)</label>
          <input
            id="closeLine"
            type="number"
            step={0.5}
            inputMode="decimal"
            value={closingLine}
            onChange={(e) => setClosingLine(parseFloat(e.target.value))}
            className="h-10 rounded-md border px-3 bg-white/70 dark:bg-white/5"
          />
        </div>

        {/* Closing Odds (+/- allowed) */}
        <div className="flex flex-col gap-2">
          <label htmlFor="closeOdds" className="text-sm text-slate-600 dark:text-slate-300">Closing Odds (American)</label>
          <input
            id="closeOdds"
            type="text"
            inputMode="text"               // full keyboard so + / - are available
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

        {/* Rounding (responsive grid for clean stacking) */}
        <div className="flex flex-col gap-2 md:col-span-3">
          <label className="text-sm text-slate-600 dark:text-slate-300">Market Rounding</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              onClick={() => setRoundMode('exact')}
              className={`w-full h-10 rounded-md px-3 border bg-white/70 dark:bg-white/5 text-xs sm:text-sm leading-tight whitespace-nowrap ${
                roundMode === 'exact' ? 'ring-2 ring-cyan-300' : ''
              }`}
            >
              Exact (no-vig)
            </button>
            <button
              onClick={() => setRoundMode('tick5')}
              className={`w-full h-10 rounded-md px-3 border bg-white/70 dark:bg-white/5 text-xs sm:text-sm leading-tight whitespace-nowrap ${
                roundMode === 'tick5' ? 'ring-2 ring-cyan-300' : ''
              }`}
            >
              Nearest 5¢
            </button>
            <button
              onClick={() => setRoundMode('tick10')}
              className={`w-full h-10 rounded-md px-3 border bg-white/70 dark:bg-white/5 text-xs sm:text-sm leading-tight whitespace-nowrap ${
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
          <Stat label="Half-Points Moved" value={results.hpMoved.toFixed(1)} />
          <Stat label="Direction (model)" value={results.direction > 0 ? '+ toward plus' : '- toward minus'} />
          <Stat label="Equivalent Closing Odds @ Original Line (raw)" value={formatOdds(Math.round(results.equivRaw))} helper="Model shift from closing odds" />
          <Stat label="Equivalent Closing Odds (converted)" value={formatOdds(Math.round(results.equivConverted))} helper="Implied-prob normalized (e.g., -82 → +122)" />
          <Stat label="Equivalent Closing Odds (market-rounded)" value={formatOdds(Math.round(results.equivMarket))} helper={roundMode === 'exact' ? 'No rounding' : `Rounded to ${roundMode === 'tick5' ? '5' : '10'}¢ tick`} />
        </div>

        <div className="rounded-2xl border p-6 bg-white/80 dark:bg-white/5 flex flex-col gap-4">
          <Stat label="Implied Prob — Your Bet" value={Number.isFinite(results.pOrig) ? `${(results.pOrig * 100).toFixed(2)}%` : '–'} />
          <Stat label="Implied Prob — Equivalent @ Orig Line" value={Number.isFinite(results.pEquiv) ? `${(results.pEquiv * 100).toFixed(2)}%` : '–'} />
          <Stat label="Edge (Probability Points)" value={Number.isFinite(results.edgeProb) ? `${(results.edgeProb * 100).toFixed(2)}%` : '–'} helper="Negative = you beat the close" />
        </div>

        <div className="rounded-2xl border p-6 bg-white/80 dark:bg-white/5 flex flex-col gap-4">
          <Stat label="Edge (Cents vs Close)" value={`${results.edgeCentsModel > 0 ? '+' : ''}${results.edgeCentsModel.toFixed(1)}¢`} helper="hp moved × cents/0.5 × direction" />
          <div className="text-sm text-slate-600 dark:text-slate-400">
            <ul className="list-disc ml-5 mt-1">
              <li>Totals move in 0.5 increments.</li>
              <li>Odds accept +120 / -110 / EV; positive odds display with a plus sign.</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          className="h-9 rounded-md px-3 border bg-white/70 dark:bg-white/5"
          onClick={() => {
            setSide('Under');
            setOriginalLine(46);
            setOriginalOddsText('-102');
            setClosingLine(47);
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
            setOriginalLine(46);
            setOriginalOddsText('-107');
            setClosingLine(47);
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
            setOriginalLine(43);
            setOriginalOddsText('-107');
            setClosingLine(44);
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
