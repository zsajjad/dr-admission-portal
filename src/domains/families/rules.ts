// cspell:ignore Haider Imran
/**
 * Families: small rules the pages share (knowledge-base/proposals/family-portal-ux.md, "Shared rules").
 * Pure functions with no imports, so `node --test` runs them without a build (see rules.test.ts).
 */

/** Digits only */
export const digitsOf = (value: string | null | undefined): string => (value ?? '').replace(/\D/g, '');

/** Core's `normalizePhone`: the last 10 digits, so 0300…, +92300… and 92300… are one number */
export function normalizePhone(value: string | null | undefined): string {
  const d = digitsOf(value);
  return d.length > 10 ? d.slice(-10) : d;
}

/** "03001234567" reads as "0300 1234567"; anything else is left as typed */
export function formatPhone(value: string | null | undefined): string {
  const d = digitsOf(value);
  const local = d.length === 12 && d.startsWith('92') ? `0${d.slice(2)}` : d;
  if (local.length === 11 && local.startsWith('0')) return `${local.slice(0, 4)} ${local.slice(4)}`;
  return (value ?? '').trim();
}

export type QueryKind = 'PHONE' | 'FATHER_NAME' | 'GR' | 'TOO_SHORT';

/** A GR as staff type it: digits in groups joined by dashes (9221-1-012-000101) */
const GR_PATTERN = /^\d{1,6}(-\d{1,6}){2,4}$/;

/**
 * What a search box query means, the same rule as core's search: a GR when it has a GR's dashes; no letters and
 * 7 or more digits is a phone; 3 letters or more is a name (a father's name, or a child's); else too short.
 */
export function queryKind(raw: string | null | undefined): QueryKind {
  const q = (raw ?? '').trim();
  if (GR_PATTERN.test(q)) return 'GR';
  const letters = q.replace(/[^\p{L}]/gu, '');
  if (!letters.length && digitsOf(q).length >= 7) return 'PHONE';
  if (letters.length >= 3) return 'FATHER_NAME';
  return 'TOO_SHORT';
}

/** Lower case, single spaces: what a name search is shown back as */
export const foldName = (value: string): string => value.replace(/\s+/g, ' ').trim().toLowerCase();

/** Eldest first (earliest birth date); children with no birth date go last, by name */
export function byBirthOrder<T extends { dateOfBirth?: string | null; name?: string | null }>(a: T, b: T): number {
  const da = a.dateOfBirth ?? '';
  const db = b.dateOfBirth ?? '';
  if (da && db && da !== db) return da < db ? -1 : 1;
  if (da && !db) return -1;
  if (!da && db) return 1;
  return (a.name ?? '').localeCompare(b.name ?? '');
}

/** Whole years from a birth date (stored at midnight UTC) to `now` */
export function ageOn(dateOfBirth: string | null | undefined, now: Date = new Date()): number | undefined {
  if (!dateOfBirth) return undefined;
  const [y, m, d] = dateOfBirth.slice(0, 10).split('-').map(Number);
  if (!y || !m || !d) return undefined;
  let age = now.getUTCFullYear() - y;
  if (now.getUTCMonth() + 1 < m || (now.getUTCMonth() + 1 === m && now.getUTCDate() < d)) age--;
  return age;
}

/** The first name of a full name ("Ali Imran" → "Ali") */
export const firstName = (name: string | null | undefined): string => (name ?? '').trim().split(/\s+/)[0] ?? '';

/** Distinct values, most common first (ties keep the first seen) */
export function mostCommonFirst(values: readonly (string | null | undefined)[], key = (v: string) => v): string[] {
  const counts = new Map<string, { value: string; count: number; first: number }>();
  values.forEach((v, i) => {
    if (!v || !v.trim()) return;
    const k = key(v.trim());
    const hit = counts.get(k);
    if (hit) hit.count++;
    else counts.set(k, { value: v.trim(), count: 1, first: i });
  });
  return [...counts.values()].sort((a, b) => b.count - a.count || a.first - b.first).map((c) => c.value);
}

export interface HouseholdChild {
  fatherName?: string | null;
  phone?: string | null;
  alternatePhone?: string | null;
  area?: { id: string; code: string; name: string } | null;
  address?: string | null;
}

export interface HouseholdHeader {
  fatherName?: string;
  otherFatherNames: string[];
  /** Every distinct number (as first typed), most shared first */
  phones: string[];
  area?: { id: string; code: string; name: string };
  moreAreas: number;
  address?: string;
  moreAddresses: number;
}

/** The household's header, deduced from its current children */
export function householdHeader(children: readonly HouseholdChild[]): HouseholdHeader {
  const fathers = mostCommonFirst(
    children.map((c) => c.fatherName),
    foldName,
  );
  const phones = mostCommonFirst(
    children.flatMap((c) => [c.phone, c.alternatePhone]),
    normalizePhone,
  );
  const areaById = new Map(children.filter((c) => c.area).map((c) => [c.area!.id, c.area!]));
  const areas = mostCommonFirst(children.map((c) => c.area?.id));
  const addresses = mostCommonFirst(
    children.map((c) => c.address),
    foldName,
  );
  return {
    fatherName: fathers[0],
    otherFatherNames: fathers.slice(1),
    phones,
    area: areas[0] ? areaById.get(areas[0]) : undefined,
    moreAreas: Math.max(areas.length - 1, 0),
    address: addresses[0],
    moreAddresses: Math.max(addresses.length - 1, 0),
  };
}

/** Initials for the header's mark ("Imran Haider" → "IH") */
export function initials(name: string | null | undefined): string {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  return parts
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('');
}

/** The order the reasons are said in */
export const REASON_ORDER = [
  'SHARED_PHONE',
  'SAME_FATHER_NAME',
  'SIMILAR_FATHER_NAME',
  'SAME_IDENTITY_NUMBER',
  'SAME_AREA',
  'SIMILAR_ADDRESS',
  'SAME_BIRTH_DATE',
  'COMMON_PHONE',
] as const;

/** Reasons in the order they're said, repeats dropped; SIMILAR_FATHER_NAME is left out next to SAME_FATHER_NAME */
export function orderReasons(reasons: readonly string[]): string[] {
  const set = new Set(reasons);
  if (set.has('SAME_FATHER_NAME')) set.delete('SIMILAR_FATHER_NAME');
  const known = REASON_ORDER.filter((r) => set.has(r));
  const rest = [...set].filter((r) => !(REASON_ORDER as readonly string[]).includes(r));
  return [...known, ...rest];
}

export type ResultBand = 'HIGH' | 'GOOD' | 'LOW' | 'FAIL' | 'TERMINATED' | 'NO_RESULT' | 'NOT_ADMITTED';

/**
 * The tint of a result cell: 85% or more passed, 70–84 passed, below 70 passed, failed, terminated,
 * admitted with no result, not admitted. The number and the word are always printed beside it.
 */
export function resultBand(
  cell: { admitted: boolean; status?: string | null; pct?: number | null } | null | undefined,
): ResultBand {
  if (!cell || !cell.admitted) return 'NOT_ADMITTED';
  if (cell.status === 'TERMINATED') return 'TERMINATED';
  if (cell.status === 'FAIL') return 'FAIL';
  if (cell.pct === null || cell.pct === undefined) return 'NO_RESULT';
  if (cell.pct >= 85) return 'HIGH';
  if (cell.pct >= 70) return 'GOOD';
  return 'LOW';
}

/** A part's percentage band (no pass or fail of its own): the same tints, by score */
export function partBand(pct: number | null | undefined): ResultBand {
  if (pct === null || pct === undefined) return 'NO_RESULT';
  if (pct >= 85) return 'HIGH';
  if (pct >= 70) return 'GOOD';
  return 'LOW';
}

/** Rounded percentage, or undefined */
export function pctOf(value: number | null | undefined, max: number | null | undefined): number | undefined {
  if (value === null || value === undefined || !max) return undefined;
  return Math.round((value / max) * 100);
}

export interface SchoolStint {
  name: string;
  first: string;
  last: string;
}

/**
 * Earlier schools that differ from the latest one, newest first, each with the first and last session it was named
 * in. `admissions` are oldest first, each with its session name and school name (or none).
 */
export function earlierSchools(
  admissions: readonly { sessionName: string; schoolName?: string | null }[],
): SchoolStint[] {
  const named = admissions.filter((a) => a.schoolName && a.schoolName.trim());
  if (named.length < 2) return [];
  const latestKey = foldName(named[named.length - 1]!.schoolName!);
  const stints: SchoolStint[] = [];
  for (const a of named.slice(0, -1)) {
    const key = foldName(a.schoolName!);
    if (key === latestKey) continue;
    const prev = stints[stints.length - 1];
    if (prev && foldName(prev.name) === key) prev.last = a.sessionName;
    else stints.push({ name: a.schoolName!.trim(), first: a.sessionName, last: a.sessionName });
  }
  return stints.reverse();
}

/** "DR1443–DR1445", or one name when it's one session */
export const sessionSpan = (s: { first: string; last: string }): string =>
  s.first === s.last ? s.first : `${s.first}–${s.last}`;

/** The pair's key, smaller ID first (as core stores "not siblings"), to skip repeats */
export const pairKey = (a: string, b: string): string => (a < b ? `${a}|${b}` : `${b}|${a}`);

/** Children shown in a list: the first `max`, and how many more */
export function firstFew<T>(items: readonly T[], max: number): { shown: T[]; more: number } {
  return { shown: items.slice(0, max), more: Math.max(items.length - max, 0) };
}

/**
 * True for every families query: the generated client's (keyed on the URL, `/admin/families…`) and this domain's
 * own (`['families', …]`). Every family write refreshes all of them, so both students' cards update.
 */
export function isFamilyQueryKey(queryKey: readonly unknown[]): boolean {
  const first = queryKey[0];
  return typeof first === 'string' && (first === 'families' || first.startsWith('/admin/families'));
}

/** Core's error code (`POSSIBLE_DUPLICATE`, `SAME_FAMILY`, …) from a thrown API error body */
export function errorCode(error: unknown): string | undefined {
  if (!error || typeof error !== 'object') return undefined;
  const e = error as { code?: unknown; error?: { code?: unknown }; response?: { code?: unknown } };
  const code = e.code ?? e.error?.code ?? e.response?.code;
  return typeof code === 'string' ? code : undefined;
}
