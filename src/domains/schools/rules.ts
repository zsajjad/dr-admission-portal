/**
 * Schools: small rules the pages share. Pure functions with no imports, so `node --test` runs them
 * without a build (see rules.test.ts).
 */

/** True for the generated client's school queries (`/school`, `/school/{id}`, `/school/unmatched-names`) */
export function isSchoolQueryKey(queryKey: readonly unknown[]): boolean {
  const first = queryKey[0];
  return typeof first === 'string' && (first === '/school' || first.startsWith('/school/'));
}

/** Trims and folds spaces, and drops blanks and repeats (case-insensitive), keeping the first spelling of each */
export function cleanSpellings(names: readonly string[], except: readonly string[] = []): string[] {
  const seen = new Set(except.map((n) => n.replace(/\s+/g, ' ').trim().toLowerCase()));
  const out: string[] = [];
  for (const raw of names) {
    const name = raw.replace(/\s+/g, ' ').trim();
    const key = name.toLowerCase();
    if (!name || seen.has(key)) continue;
    seen.add(key);
    out.push(name);
  }
  return out;
}

/** Every typed name in a group of unmatched names: each name and its other spellings */
export function namesOf(groups: readonly { name: string; spellings: readonly string[] }[]): string[] {
  return cleanSpellings(groups.flatMap((g) => [g.name, ...g.spellings]));
}

/** Runs `fn` on every item, a few at a time, and reports which items failed instead of stopping */
export async function runInBatches<T>(
  items: readonly T[],
  fn: (item: T) => Promise<unknown>,
  { size = 4, onProgress }: { size?: number; onProgress?: (done: number) => void } = {},
): Promise<{ done: number; failed: { item: T; error: unknown }[] }> {
  const failed: { item: T; error: unknown }[] = [];
  let done = 0;
  for (let i = 0; i < items.length; i += size) {
    const batch = items.slice(i, i + size);
    const results = await Promise.allSettled(batch.map((item) => fn(item)));
    results.forEach((r, j) => {
      if (r.status === 'rejected') failed.push({ item: batch[j], error: r.reason });
      else done++;
    });
    onProgress?.(done + failed.length);
  }
  return { done, failed };
}

/** The three details staff set once per school (core: type, feeBand, medium) */
export const ATTRIBUTES = ['type', 'feeBand', 'medium'] as const;
export type Attribute = (typeof ATTRIBUTES)[number];

export const ATTRIBUTE_VALUES = {
  type: ['GOVERNMENT', 'PRIVATE', 'TRUST', 'MADRASSA'],
  feeBand: ['LOW', 'MEDIUM', 'HIGH'],
  medium: ['ENGLISH', 'URDU'],
} as const satisfies Record<Attribute, readonly string[]>;

/** True when a school has no type, fee band or medium yet */
export function isMissingDetails(school: Partial<Record<Attribute, string | null>>): boolean {
  return ATTRIBUTES.some((a) => !school[a]);
}

/** The update for a bulk change: only the details the admin chose (an empty choice keeps each school's own) */
export function bulkChanges(choice: Partial<Record<Attribute, string>>): Partial<Record<Attribute, string>> {
  const dto: Partial<Record<Attribute, string>> = {};
  for (const a of ATTRIBUTES) {
    const value = choice[a];
    if (value && (ATTRIBUTE_VALUES[a] as readonly string[]).includes(value)) dto[a] = value;
  }
  return dto;
}
