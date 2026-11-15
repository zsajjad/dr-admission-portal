// Run with `pnpm test` (node --test; Node strips the types, so no build is needed).
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { cleanSpellings, isSchoolQueryKey, namesOf, runInBatches } from './rules.ts';

describe('school query keys', () => {
  it('matches the list, a school and the unmatched names', () => {
    assert.equal(isSchoolQueryKey(['/school', { take: 20 }]), true);
    assert.equal(isSchoolQueryKey(['/school/abc']), true);
    assert.equal(isSchoolQueryKey(['/school/unmatched-names', {}]), true);
  });

  it('leaves other queries alone', () => {
    assert.equal(isSchoolQueryKey(['/schools']), false);
    assert.equal(isSchoolQueryKey(['/session']), false);
    assert.equal(isSchoolQueryKey(['VAN_LISTING']), false);
    assert.equal(isSchoolQueryKey([]), false);
  });
});

describe('spellings', () => {
  it('trims, folds spaces and drops blanks and repeats', () => {
    assert.deepEqual(cleanSpellings(['  Green  Valley ', 'green valley', '', 'Green Field']), [
      'Green Valley',
      'Green Field',
    ]);
  });

  it('leaves out the ones the school already has', () => {
    assert.deepEqual(cleanSpellings(['Green Valley', 'GV School'], ['green valley']), ['GV School']);
  });

  it('takes every name and spelling from unmatched groups', () => {
    assert.deepEqual(
      namesOf([
        { name: 'Sunrise School', spellings: ['sunrise school '] },
        { name: 'Sun Rise', spellings: [] },
      ]),
      ['Sunrise School', 'Sun Rise'],
    );
  });
});

describe('batches', () => {
  it('runs every item and reports the failures', async () => {
    const seen: number[] = [];
    const progress: number[] = [];
    const result = await runInBatches(
      [1, 2, 3, 4, 5],
      async (n) => {
        seen.push(n);
        if (n === 3) throw new Error('no');
      },
      { size: 2, onProgress: (d) => progress.push(d) },
    );
    assert.deepEqual(seen.sort(), [1, 2, 3, 4, 5]);
    assert.equal(result.done, 4);
    assert.deepEqual(
      result.failed.map((f) => f.item),
      [3],
    );
    assert.deepEqual(progress, [2, 4, 5]);
  });

  it('does nothing for no items', async () => {
    assert.deepEqual(await runInBatches([], async () => undefined), { done: 0, failed: [] });
  });
});
