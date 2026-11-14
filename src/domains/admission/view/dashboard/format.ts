export const formatNumber = (n: number | undefined | null): string =>
  n === undefined || n === null ? '—' : n.toLocaleString('en-US');

export const formatPercent = (n: number | undefined | null): string =>
  n === undefined || n === null ? '—' : `${n.toLocaleString('en-US', { maximumFractionDigits: 1 })}%`;

/** n as a share of total, in percent with one decimal. Undefined when there is no total. */
export const share = (n: number, total: number): number | undefined =>
  total > 0 ? Math.round((n / total) * 1000) / 10 : undefined;

/** A date-only string (YYYY-MM-DD) or an ISO time, as "4 Feb 2027". */
export const formatDate = (value: string | undefined): string => {
  if (!value) return '—';
  const d = new Date(value.length === 10 ? `${value}T00:00:00Z` : value);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Karachi' });
};

/**
 * A short label for a session in sentences and table headings: its name when that is short (DR1448),
 * otherwise its ID when that is the short code, otherwise the name.
 */
export const sessionLabel = (session: { id: string; name: string } | undefined): string => {
  if (!session) return '';
  if (session.name.length <= 12 || session.id.length > 12) return session.name;
  return session.id;
};
