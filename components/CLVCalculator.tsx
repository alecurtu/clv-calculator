'use client';
import React, { useMemo, useState } from 'react';
import { americanToProb, normalizeAmerican, formatOdds, roundToTick, computeDirection } from '@/lib/odds';
export default function CLVCalculator() {
  const [side, setSide] = useState<'Over' | 'Under'>('Under');
  const [originalLine, setOriginalLine] = useState<number>(46);
  const [originalOdds, setOriginalOdds] = useState<number>(-102);
  const [closingLine, setClosingLine] = useState<number>(47);
  const [closingOdds, setClosingOdds] = useState<number>(-107);
  const [centsPerHalfPoint, setCentsPerHalfPoint] = useState<number>(10);
  const [roundMode, setRoundMode] = useState<'exact' | 'tick5' | 'tick10'>('exact');
  const results = useMemo(() => {
    const hpMoved = Math.abs(closingLine - originalLine) / 0.5;
    const direction = computeDirection(side, originalLine, closingLine);
    const equivRaw = closingOdds + hpMoved * centsPerHalfPoint * direction;
    const equivConverted = normalizeAmerican(equivRaw);
    const tick = roundMode === 'tick5' ? 5 : roundMode === 'tick10' ? 10 : 0;
    const equivMarket = tick ? roundToTick(equivConverted, tick) : equivConverted;
    const pOrig = americanToProb(originalOdds);
    const pEquiv = americanToProb(equivMarket);
    const edgeCentsModel = hpMoved * centsPerHalfPoint * direction;
    const edgeProb = pEquiv - pOrig;
    return { hpMoved, direction, equivRaw, equivConverted, equivMarket, pOrig, pEquiv, edgeCentsModel, edgeProb };
  }, [side, originalLine, originalOdds, closingLine, closingOdds, centsPerHalfPoint, roundMode]);
  const Stat = ({ label, value, helper }: { label: string; value: React.ReactNode; helper?: string }) => (
    <div className="flex flex-col gap-1"><div className="text-sm text-slate-500">{label}</div><div className="text-xl font-semibold tracking-tight">{value}</div>{helper && <div className="text-xs text-slate-500">{helper}</div>}</div>);
  const clvIsPositive = results.edgeCentsModel > 0;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between"><h1 className="text-2xl md:text-3xl font-bold tracking-tight">NFL Closing Line Value (CLV) Calculator</h1>
        <span className={`px-2 py-0.5 rounded-full text-xs ${clvIsPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{clvIsPositive ? 'Positive CLV' : 'Negative CLV'}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white rounded-2xl shadow p-6">
        <div className="flex flex-col gap-2"><label className="text-sm text-slate-600">Side</label>
          <select value={side} onChange={(e) => setSide(e.target.value as 'Over' | 'Under')} className="h-10 rounded-md border px-3"><option value="Under">Under</option><option value="Over">Over</option></select></div>
        <div className="flex flex-col gap-2"><label className="text-sm text-slate-600">Original Line (total)</label>
          <input type="number" value={originalLine} onChange={(e) => setOriginalLine(parseFloat(e.target.value))} className="h-10 rounded-md border px-3" /></div>
        <div className="flex flex-col gap-2"><label className="text-sm text-slate-600">Original Odds (American)</label>
          <input type="number" value={originalOdds} onChange={(e) => setOriginalOdds(parseInt(e.target.value))} className="h-10 rounded-md border px-3" /></div>
        <div className="flex flex-col gap-2"><label className="text-sm text-slate-600">Closing Line (total)</label>
          <input type="number" value={closingLine} onChange={(e) => setClosingLine(parseFloat(e.target.value))} className="h-10 rounded-md border px-3" /></div>
        <div className="flex flex-col gap-2"><label className="text-sm text-slate-600">Closing Odds (American)</label>
          <input type="number" value={closingOdds} onChange={(e) => setClosingOdds(parseInt(e.target.value))} className="h-10 rounded-md border px-3" /></div>
        <div className="flex flex-col gap-2"><label className="text-sm text-slate-600">Cents per Half-Point</label>
          <input type="range" min={5} max={25} step={1} value={centsPerHalfPoint} onChange={(e) => setCentsPerHalfPoint(parseInt(e.target.value))} />
          <div className="text-xs text-slate-500">Current: {centsPerHalfPoint}¢ per 0.5</div></div>
        <div className="flex flex-col gap-2 md:col-span-3"><label className="text-sm text-slate-600">Market Rounding</label>
          <div className="flex gap-2">
            <button onClick={() => setRoundMode('exact')} className={`h-9 rounded-md px-3 border ${roundMode==='exact' ? 'bg-slate-900 text-white' : 'bg-white'}`}>Exact (no-vig)</button>
            <button onClick={() => setRoundMode('tick5')} className={`h-9 rounded-md px-3 border ${roundMode==='tick5' ? 'bg-slate-900 text-white' : 'bg-white'}`}>Nearest 5¢</button>
            <button onClick={() => setRoundMode('tick10')} className={`h-9 rounded-md px-3 border ${roundMode==='tick10' ? 'bg-slate-900 text-white' : 'bg-white'}`}>Nearest 10¢</button>
          </div></div></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow p-6 flex flex-col gap-4">
          <Stat label="Half-Points Moved" value={results.hpMoved.toFixed(1)} />
          <Stat label="Direction (model)" value={results.direction > 0 ? '+ toward plus' : '- toward minus'} />
          <Stat label="Equivalent Closing Odds @ Original Line (raw)" value={formatOdds(Math.round(results.equivRaw))} helper="Model shift from closing odds" />
          <Stat label="Equivalent Closing Odds (converted)" value={formatOdds(Math.round(results.equivConverted))} helper="Implied-prob normalized (e.g., -82 → +122)" />
          <Stat label="Equivalent Closing Odds (market-rounded)" value={formatOdds(Math.round(results.equivMarket))} helper={roundMode==='exact' ? 'No rounding' : `Rounded to ${roundMode==='tick5' ? '5' : '10'}¢ tick`} />
        </div>
        <div className="bg-white rounded-2xl shadow p-6 flex flex-col gap-4">
          <Stat label="Implied Prob — Your Bet" value={`${(results.pOrig * 100).toFixed(2)}%`} />
          <Stat label="Implied Prob — Equivalent @ Orig Line" value={`${(results.pEquiv * 100).toFixed(2)}%`} />
          <Stat label="Edge (Probability Points)" value={`${(results.edgeProb * 100).toFixed(2)}%`} />
        </div>
        <div className="bg-white rounded-2xl shadow p-6 flex flex-col gap-4">
          <Stat label="Edge (Cents vs Close)" value={`${results.edgeCentsModel > 0 ? '+' : ''}${results.edgeCentsModel.toFixed(1)}¢`} />
          <div className="text-sm text-slate-600"><ul className="list-disc ml-5 mt-1"><li>Adjust cents/half-point for key totals.</li><li>Use market rounding to mimic prints.</li></ul></div>
        </div></div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button className="h-9 rounded-md px-3 border" onClick={() => { setSide('Under'); setOriginalLine(46); setOriginalOdds(-102); setClosingLine(47); setClosingOdds(-107); setCentsPerHalfPoint(10); setRoundMode('exact'); }}>Load Under Demo</button>
        <button className="h-9 rounded-md px-3 border" onClick={() => { setSide('Over'); setOriginalLine(46); setOriginalOdds(-107); setClosingLine(47); setClosingOdds(-106); setCentsPerHalfPoint(10); setRoundMode('tick5'); }}>Load Over Demo</button>
        <button className="h-9 rounded-md px-3 border" onClick={() => { setSide('Under'); setOriginalLine(43); setOriginalOdds(-107); setClosingLine(44); setClosingOdds(-110); setCentsPerHalfPoint(10); setRoundMode('tick5'); }}>Load Example #3</button>
      </div>
    </div>
  );
}
