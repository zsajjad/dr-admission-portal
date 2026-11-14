// Run with `pnpm test` (node --test; Node strips the types, so no build is needed).
// cspell:words Bilal Nida
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  bandFor,
  COURSE_DEFAULTS,
  type CourseInput,
  payoutFor,
  payoutTable,
  rulesFor,
  uncoveredAges,
  validateAgeRules,
  validateCourse,
  weightedPct,
} from './rules.ts';

// The example course in the requirements: 4 trainings, weights 30/30/20/20, each with a 50% pass mark
const example: CourseInput = {
  code: 'EX',
  name: 'Example course',
  ...COURSE_DEFAULTS,
  trainings: [
    { code: 'A', name: 'A', weightPct: 30, maxMarks: 100, passMarks: 50 },
    { code: 'B', name: 'B', weightPct: 30, maxMarks: 100, passMarks: 50 },
    { code: 'C', name: 'C', weightPct: 20, maxMarks: 100, passMarks: 50 },
    { code: 'D', name: 'D', weightPct: 20, maxMarks: 100, passMarks: 50 },
  ],
};

/** weighted %, trainings passed and payout for one attempt of the example course */
function grade(marks: number[]) {
  const pct = weightedPct(example.trainings, marks);
  const passed = marks.filter((m, i) => m >= example.trainings[i].passMarks).length;
  const band = bandFor(example.bands, pct) ?? 0;
  return { pct, passed, payout: payoutFor(example.payoutFloor, band, passed, marks.length) };
}

describe('payout stories from the requirements', () => {
  it('Ali: 95/95/90/90 is 93%, 4 passed, 1000', () => {
    assert.deepEqual(grade([95, 95, 90, 90]), { pct: 93, passed: 4, payout: 1000 });
  });
  it('Sara: 76% then 91%', () => {
    assert.deepEqual(grade([80, 80, 70, 70]), { pct: 76, passed: 4, payout: 750 });
    assert.equal(grade([92, 92, 90, 88]).payout, 1000);
  });
  it('Bilal: fails C at 83%, then passes it', () => {
    assert.deepEqual(grade([95, 95, 40, 90]), { pct: 83, passed: 3, payout: 650 });
    assert.deepEqual(grade([90, 90, 60, 85]), { pct: 83, passed: 4, payout: 750 });
  });
  it('Hamza: 43% with 1 passed, then 54% with 3 passed', () => {
    assert.deepEqual(grade([40, 45, 30, 55]), { pct: 42.5, passed: 1, payout: 350 });
    assert.deepEqual(grade([55, 60, 45, 50]), { pct: 53.5, passed: 3, payout: 462 });
  });
  it('Zara: the retest goes worse', () => {
    assert.equal(grade([80, 80, 80, 80]).payout, 750);
    assert.equal(grade([70, 45, 80, 60]).payout, 462);
  });
  it('Nida: 70% with all passed pays 500', () => {
    assert.equal(grade([70, 70, 70, 70]).payout, 500);
  });
});

describe('bandFor', () => {
  it('takes the highest band at or below the score', () => {
    assert.equal(bandFor(COURSE_DEFAULTS.bands, 89.6), 750);
    assert.equal(bandFor(COURSE_DEFAULTS.bands, 90), 1000);
    assert.equal(bandFor(COURSE_DEFAULTS.bands, 0), 350);
  });
  it('ignores the order bands are listed in', () => {
    assert.equal(bandFor([...COURSE_DEFAULTS.bands].reverse(), 75), 750);
  });
});

describe('payoutTable', () => {
  it('matches the 4-training table in the requirements', () => {
    const table = payoutTable(350, COURSE_DEFAULTS.bands, 4);
    assert.deepEqual(
      table.map((row) => row.byPassed.map((c) => c.payout)),
      [
        [1000, 837, 675, 512, 350],
        [750, 650, 550, 450, 350],
        [500, 462, 425, 387, 350],
        [350, 350, 350, 350, 350],
      ],
    );
    assert.deepEqual(
      table.map((row) => [row.minPct, row.belowPct]),
      [
        [90, undefined],
        [75, 90],
        [50, 75],
        [0, 50],
      ],
    );
  });
});

describe('validateCourse', () => {
  const codes = (course: CourseInput) => validateCourse(course).map((i) => `${i.path}:${i.code}`);

  it('accepts the example course', () => {
    assert.deepEqual(codes(example), []);
  });
  it('needs weights adding up to 100', () => {
    const course = { ...example, trainings: example.trainings.map((t) => ({ ...t, weightPct: 20 })) };
    const issue = validateCourse(course).find((i) => i.code === 'WEIGHTS_NOT_100');
    assert.deepEqual(issue?.values, { total: '80' });
  });
  it('accepts weights with 2 decimals', () => {
    const trainings = [33.33, 33.33, 33.34].map((w, i) => ({ ...example.trainings[0], code: `T${i}`, weightPct: w }));
    assert.deepEqual(codes({ ...example, trainings }), []);
  });
  it('needs a 0 band, and every amount at least the floor', () => {
    const bands = [
      { minPct: 90, amount: 1000 },
      { minPct: 50, amount: 300 },
    ];
    assert.deepEqual(codes({ ...example, bands }), ['bands:BANDS_NEED_ZERO', 'bands.1:BAND_BELOW_FLOOR']);
  });
  it('refuses duplicate band percentages and training codes', () => {
    const bands = [...COURSE_DEFAULTS.bands, { minPct: 50, amount: 600 }];
    const trainings = example.trainings.map((t) => (t.code === 'B' ? { ...t, code: 'a' } : t));
    assert.deepEqual(codes({ ...example, bands, trainings }), [
      'bands.4:BAND_PCT_DUPLICATE',
      'trainings.1:TRAINING_CODE_DUPLICATE',
    ]);
  });
  it('needs pass marks within max marks', () => {
    const trainings = example.trainings.map((t, i) => (i === 2 ? { ...t, passMarks: 120 } : t));
    assert.deepEqual(codes({ ...example, trainings }), ['trainings.2:PASS_MARKS_RANGE']);
  });
  it('needs reminders before the auto-close day', () => {
    assert.deepEqual(codes({ ...example, reminderDays: [7, 30] }), ['course.reminderDays:REMINDER_RANGE']);
  });
  it('keeps attempts within the limit', () => {
    assert.deepEqual(codes({ ...example, maxAttempts: 0 }), ['course.maxAttempts:MAX_ATTEMPTS_RANGE']);
  });
});

describe('the age matrix', () => {
  const rules = [
    { minAge: 6, maxAge: 9, gender: null, courseId: 'tiflan' },
    { minAge: 10, maxAge: 14, gender: 'MALE' as const, courseId: 'boys' },
    { minAge: 10, maxAge: 14, gender: 'FEMALE' as const, courseId: 'girls' },
  ];

  it('allows the same ages for different genders', () => {
    assert.deepEqual(validateAgeRules(rules), []);
  });
  it('refuses overlaps, also against a both-genders row', () => {
    const issues = validateAgeRules([...rules, { minAge: 9, maxAge: 10, gender: 'FEMALE', courseId: 'x' }]);
    assert.deepEqual(
      issues.map((i) => [i.index, i.otherIndex]),
      [
        [0, 3],
        [3, 0],
        [2, 3],
        [3, 2],
      ],
    );
  });
  it('refuses a minimum above the maximum and a missing course', () => {
    const issues = validateAgeRules([{ minAge: 12, maxAge: 10, gender: null, courseId: '' }]);
    assert.deepEqual(
      issues.map((i) => i.code),
      ['AGE_ORDER', 'COURSE_REQUIRED'],
    );
  });
  it('finds the rows for an age, and the ages with no course', () => {
    assert.deepEqual(rulesFor(rules, 12, 'FEMALE'), [2]);
    assert.deepEqual(uncoveredAges(rules, 'MALE', 5, 16), [5, 15, 16]);
  });
});
