// Run with `pnpm test` (node --test; Node strips the types, so no build is needed).
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  bandFor,
  grade,
  payTable,
  TRAINING_DEFAULTS,
  type TrainingInput,
  validateSettings,
  validateTraining,
} from './rules.ts';

const wazu: TrainingInput = { code: 'WZ', name: 'Wazu', requiredFromAge: 6, ...TRAINING_DEFAULTS };

describe('pay per training (contract v3 example)', () => {
  it('pays the band when passed and the floor when failed', () => {
    assert.deepEqual(grade(wazu, 95), { scorePct: 95, passed: true, pay: 1000 });
    assert.deepEqual(grade(wazu, 80), { scorePct: 80, passed: true, pay: 750 });
    assert.deepEqual(grade(wazu, 60), { scorePct: 60, passed: true, pay: 500 });
    assert.deepEqual(grade(wazu, 45), { scorePct: 45, passed: false, pay: 350 });
  });
  it('adds up to 2600 for the four trainings', () => {
    assert.equal(
      [95, 80, 60, 45].reduce((sum, m) => sum + grade(wazu, m).pay, 0),
      2600,
    );
  });
  it('works on marks out of any maximum', () => {
    assert.deepEqual(grade({ ...wazu, maxMarks: 20, passMarks: 10 }, 18), { scorePct: 90, passed: true, pay: 1000 });
  });
});

describe('bandFor', () => {
  it('takes the highest band at or below the score', () => {
    assert.equal(bandFor(TRAINING_DEFAULTS.bands, 89.6), 750);
    assert.equal(bandFor([...TRAINING_DEFAULTS.bands].reverse(), 90), 1000);
  });
});

describe('payTable', () => {
  it('marks bands a pass can never reach', () => {
    const rows = payTable({ ...wazu, passMarks: 60 });
    assert.deepEqual(
      rows.map((r) => [r.minPct, r.belowPct, r.amount, r.reachable]),
      [
        [90, undefined, 1000, true],
        [75, 90, 750, true],
        [50, 75, 500, true],
        [0, 50, 350, false],
      ],
    );
  });
});

describe('validateTraining', () => {
  const codes = (t: TrainingInput) => validateTraining(t).map((i) => `${i.path}:${i.code}`);
  it('accepts the defaults', () => assert.deepEqual(codes(wazu), []));
  it('needs pass marks within max marks, and an age', () => {
    assert.deepEqual(codes({ ...wazu, passMarks: 120, requiredFromAge: Number.NaN }), [
      'requiredFromAge:AGE_RANGE',
      'passMarks:PASS_MARKS_RANGE',
    ]);
  });
  it('needs a 0 band, no duplicates, and amounts at least the floor', () => {
    const bands = [
      { minPct: 90, amount: 1000 },
      { minPct: 90, amount: 900 },
      { minPct: 50, amount: 300 },
    ];
    assert.deepEqual(codes({ ...wazu, bands }), [
      'bands:BANDS_NEED_ZERO',
      'bands.1:BAND_PCT_DUPLICATE',
      'bands.2:BAND_BELOW_FLOOR',
    ]);
  });
});

describe('validateSettings', () => {
  it('needs reminders before the auto-close day', () => {
    assert.deepEqual(
      validateSettings({ maxAttempts: 2, autoCloseDays: 30, reminderDays: [7, 30] }).map((i) => i.code),
      ['REMINDER_RANGE'],
    );
  });
  it('keeps attempts within the limit', () => {
    assert.deepEqual(
      validateSettings({ maxAttempts: 0, autoCloseDays: 30, reminderDays: [7] }).map((i) => i.code),
      ['MAX_ATTEMPTS_RANGE'],
    );
  });
});
