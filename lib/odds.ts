export function americanToProb(odds: number): number {
  if (!Number.isFinite(odds)) return NaN;
  if (odds < 0) return Math.abs(odds) / (Math.abs(odds) + 100);
  return 100 / (odds + 100);
}

export function probToAmerican(p: number): number {
  if (!Number.isFinite(p) || p <= 0 || p >= 1) return NaN;
  if (p > 0.5) return -Math.round((100 * p) / (1 - p));
  return Math.round((100 * (1 - p)) / p);
}

export function normalizeAmerican(odds: number): number {
  const p = americanToProb(odds);
  return probToAmerican(p);
}

export function formatOdds(odds: number): string {
  if (!Number.isFinite(odds)) return '–';
  return odds > 0 ? `+${odds}` : `${odds}`;
}

export function roundToTick(value: number, tick: number): number {
  if (!Number.isFinite(value) || tick <= 0) return value;
  return Math.round(value / tick) * tick;
}

export function computeDirection(side: 'Over' | 'Under', originalLine: number, closingLine: number): number {
  if (side === 'Under') {
    return closingLine > originalLine ? +1 : -1;
  } else {
    return closingLine > originalLine ? -1 : +1;
  }
}
