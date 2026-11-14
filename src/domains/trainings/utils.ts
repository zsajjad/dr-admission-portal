import { format } from 'date-fns';

/** Keeps numbers and dates left-to-right inside Urdu (RTL) text */
const ltr = (text: string) => `\u2066${text}\u2069`;

export function formatDate(value?: string | Date | null): string {
  if (!value) return '--';
  return ltr(format(new Date(value), 'd MMM yyyy'));
}

export function formatDateTime(value?: string | Date | null): string {
  if (!value) return '--';
  return ltr(format(new Date(value), 'd MMM yyyy, h:mm a'));
}

/** Money is in whole rupees */
export function formatAmount(amount?: number | null): string {
  if (amount === undefined || amount === null) return '--';
  return ltr(`Rs ${amount.toLocaleString('en-PK', { maximumFractionDigits: 0 })}`);
}

/** Percentages have 2 decimals; trailing zeros are dropped */
export function formatPct(pct?: number | null): string {
  if (pct === undefined || pct === null) return '--';
  return ltr(`${Number(pct.toFixed(2))}%`);
}

/** `<input type="datetime-local">` value for an ISO time, in the browser's time zone */
export function toLocalInput(value?: string | null): string {
  if (!value) return '';
  return format(new Date(value), "yyyy-MM-dd'T'HH:mm");
}

/** ISO time from an `<input type="datetime-local">` value */
export function fromLocalInput(value: string): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

export const cardStyle = {
  borderRadius: 3,
  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
};

/** Parses a number field; empty or invalid input becomes NaN so validation flags it */
export const toNumber = (value: string): number => (value.trim() === '' ? Number.NaN : Number(value));
