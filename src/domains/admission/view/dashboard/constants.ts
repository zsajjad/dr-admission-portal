/** Chart colors. Blue and orange are a checked color-blind-safe pair; grey is the comparison session. */
export const SERIES_COLORS = {
  current: '#2a78d6',
  previous: '#8b9199',
  returning: '#2a78d6',
  newStudents: '#eb6834',
};

export type DashboardMetric = 'applied' | 'feePaid' | 'finalized';

export const DASHBOARD_METRICS: DashboardMetric[] = ['applied', 'feePaid', 'finalized'];

/** Digits of equal width, so numbers line up in columns. */
// cspell:disable-next-line
export const NUMERIC = { fontVariantNumeric: 'tabular-nums' } as const;
