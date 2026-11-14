import { AdmissionResultEntity, ClassResultRow, FinalResultStatus, ResultPart } from '@/providers/service/app.schemas';

import messages from './messages';

/** Several sources can hold a row for a part; the one that counts is the most recently updated. */
export function latestPart(parts: AdmissionResultEntity[], part: ResultPart): AdmissionResultEntity | undefined {
  let latest: AdmissionResultEntity | undefined;
  for (const row of parts) {
    if (row.part === part && (!latest || row.updatedAt > latest.updatedAt)) latest = row;
  }
  return latest;
}

export const fmt = (n?: number | null) => (n === null || n === undefined ? '' : String(Math.round(n * 100) / 100));

export const resultColor: Record<FinalResultStatus, 'success' | 'error' | 'default'> = {
  PASS: 'success',
  FAIL: 'error',
  TERMINATED: 'default',
};

/** Why a student has no result yet, under the session result rules. */
export function pendingReason(row: ClassResultRow, theoryPassMark: number | null | undefined) {
  const theory = latestPart(row.parts, ResultPart.THEORY);
  if (!theory || theory.marks === null || theory.marks === undefined) return messages.pendingNoTheory;
  if (theoryPassMark === null || theoryPassMark === undefined) return messages.pendingNoPassMark;
  if (row.trainings && !row.trainings.complete && theory.marks >= theoryPassMark) return messages.pendingTrainings;
  return messages.pendingNotWorkedOut;
}

/** Positioned students first by position, the rest by name. */
export function byPosition(a: ClassResultRow, b: ClassResultRow) {
  const ra = a.final?.result === FinalResultStatus.PASS ? a.final.branchRank : null;
  const rb = b.final?.result === FinalResultStatus.PASS ? b.final.branchRank : null;
  if (ra && rb && ra !== rb) return ra - rb;
  if (ra && !rb) return -1;
  if (!ra && rb) return 1;
  return a.name.localeCompare(b.name);
}

/** "GR, marks" per line: commas, tabs (pasted from a sheet), semicolons or wide spaces. A header row is skipped. */
export function parseLines(text: string): { rows: { line: number; gr: string; marks: string }[]; errors: number[] } {
  const rows: { line: number; gr: string; marks: string }[] = [];
  const errors: number[] = [];
  text.split(/\r?\n/).forEach((raw, i) => {
    const line = raw.trim();
    if (!line) return;
    const [gr, marks] = line.split(/[\t,;]+|\s{2,}/).map((s) => s.trim());
    if (i === 0 && gr && !/\d/.test(gr)) return;
    if (!gr || marks === undefined || marks === '') errors.push(i + 1);
    else rows.push({ line: i + 1, gr, marks });
  });
  return { rows, errors };
}

/** Run `fn` over `items`, a few at a time. */
export async function inBatches<T, R>(
  items: T[],
  size: number,
  fn: (item: T) => Promise<R>,
): Promise<PromiseSettledResult<R>[]> {
  const out: PromiseSettledResult<R>[] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(...(await Promise.allSettled(items.slice(i, i + size).map(fn))));
  }
  return out;
}
