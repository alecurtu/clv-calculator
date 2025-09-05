'use client';
import React from 'react';
import { americanToProb, probToAmerican, normalizeAmerican, formatOdds, roundToTick } from '@/lib/odds';

const cases = [
  { name: '-82 → +122 (normalized)', input: -82, expected: 122, fn: normalizeAmerican },
  { name: '+120 → 45.45% → +120 (round-trip)', input: 120, expected: 120, fn: (x:number)=> probToAmerican(americanToProb(x)) },
  { name: '-107 prob ≈ 51.69%', input: -107, expectedProbPct: 51.69, fn: americanToProb },

  { name: '-102 prob ≈ 50.50%', input: -102, expectedProbPct: 50.50, fn: americanToProb },
  { name: 'normalize -100 → +100', input: -100, expected: 100, fn: normalizeAmerican },
  { name: 'tick5: 122 → 120', input: 122, expected: 120, fn: (x:number)=> roundToTick(x, 5) },
  { name: 'tick10: 121 → 120', input: 121, expected: 120, fn: (x:number)=> roundToTick(x, 10) },
  { name: '-107 → p → -107 (round-trip)', input: -107, expected: -107, fn: (x:number)=> probToAmerican(americanToProb(x)) }
];

function approxEqual(a: number, b: number, tol = 1): boolean {
  return Math.abs(a - b) <= tol;
}

export default function TestsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 space-y-4">
      <h1 className="text-2xl font-bold">CLV Calculator — Built-in Tests</h1>
      <p className="text-sm text-slate-600">These are smoke tests to validate odds conversions in the browser.</p>

      <div className="space-y-3">
        {cases.map((c, i) => {
          let result: number;
          let pass: boolean;
          if (c.name.includes('prob')) {
            const prob = (c.fn as (x:number)=>number)(c.input as number);
            result = Math.round(prob * 10000) / 100;
            pass = approxEqual(result, (c as any).expectedProbPct, 0.3);
            return (
              <div key={i} className={`rounded-lg border p-3 ${pass ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
                <div className="font-medium">{c.name}</div>
                <div>Expected ≈ {(c as any).expectedProbPct.toFixed(2)}% &nbsp;|&nbsp; Actual = {result.toFixed(2)}%</div>
              </div>
            );
          } else {
            result = Math.round((c.fn as (x:number)=>number)(c.input as number));
            pass = approxEqual(result, (c as any).expected, 2);
            return (
              <div key={i} className={`rounded-lg border p-3 ${pass ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'}`}>
                <div className="font-medium">{c.name}</div>
                <div>Expected ≈ {formatOdds((c as any).expected)} &nbsp;|&nbsp; Actual = {formatOdds(result)}</div>
              </div>
            );
          }
        })}
      </div>

      <p className="text-xs text-slate-500">If any test shows red, tell me the expected behavior you want and I’ll adjust the formulas.</p>
    </main>
  );
}
