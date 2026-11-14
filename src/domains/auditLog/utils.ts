/** A short, readable value for the before and after table. */
export function show(value: unknown): string {
  if (value === undefined) return '—';
  if (value === null) return 'null';
  if (typeof value === 'string') return value;
  return JSON.stringify(value);
}

/** Top-level fields whose value differs between before and after. */
export function changedFields(before: unknown, after: unknown): { field: string; before: unknown; after: unknown }[] {
  const b = (before && typeof before === 'object' ? before : {}) as Record<string, unknown>;
  const a = (after && typeof after === 'object' ? after : {}) as Record<string, unknown>;
  const fields = [...new Set([...Object.keys(b), ...Object.keys(a)])];
  return fields
    .filter((f) => JSON.stringify(b[f]) !== JSON.stringify(a[f]))
    .map((field) => ({ field, before: b[field], after: a[field] }));
}
