/**
 * Fiqh training rules the portal checks before saving (knowledge-base/trainings-contract.md, "Rules").
 * The API enforces the same rules; these give the admin instant feedback and the payout preview.
 *
 * Pure functions with no imports, so `node --test` runs them without a build (see rules.test.ts).
 */

export interface BandInput {
  minPct: number;
  amount: number;
}

export interface TrainingInput {
  code: string;
  name: string;
  weightPct: number;
  maxMarks: number;
  passMarks: number;
}

export interface CourseInput {
  code: string;
  name: string;
  retrainThresholdPct: number;
  maxAttempts: number;
  autoCloseDays: number;
  reminderDays: number[];
  payoutFloor: number;
  bands: BandInput[];
  trainings: TrainingInput[];
}

/** The requirements' defaults for a new course (same as core's COURSE_DEFAULTS) */
export const COURSE_DEFAULTS = {
  retrainThresholdPct: 90,
  maxAttempts: 2,
  autoCloseDays: 30,
  reminderDays: [7, 25],
  payoutFloor: 350,
  bands: [
    { minPct: 90, amount: 1000 },
    { minPct: 75, amount: 750 },
    { minPct: 50, amount: 500 },
    { minPct: 0, amount: 350 },
  ],
};

/** Upper limits that keep a course sane (same as core's COURSE_LIMITS) */
export const COURSE_LIMITS = {
  maxAttempts: 5,
  autoCloseDays: 365,
  trainings: 30,
  bands: 10,
};

export type CourseIssueCode =
  | 'CODE_REQUIRED'
  | 'NAME_REQUIRED'
  | 'THRESHOLD_RANGE'
  | 'MAX_ATTEMPTS_RANGE'
  | 'AUTO_CLOSE_RANGE'
  | 'REMINDER_RANGE'
  | 'REMINDER_DUPLICATE'
  | 'FLOOR_NEGATIVE'
  | 'BANDS_REQUIRED'
  | 'BANDS_TOO_MANY'
  | 'BANDS_NEED_ZERO'
  | 'BAND_PCT_RANGE'
  | 'BAND_PCT_DUPLICATE'
  | 'BAND_BELOW_FLOOR'
  | 'TRAININGS_REQUIRED'
  | 'TRAININGS_TOO_MANY'
  | 'WEIGHTS_NOT_100'
  | 'TRAINING_CODE_REQUIRED'
  | 'TRAINING_CODE_DUPLICATE'
  | 'TRAINING_NAME_REQUIRED'
  | 'WEIGHT_RANGE'
  | 'MAX_MARKS_POSITIVE'
  | 'PASS_MARKS_RANGE';

export interface CourseIssue {
  code: CourseIssueCode;
  /** Which part of the form: 'course', 'bands', 'trainings', or a row such as 'trainings.2' or 'bands.0' */
  path: string;
  values?: Record<string, string>;
  /** Warnings don't block saving */
  warning?: boolean;
}

const isNum = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n);

/** Rounds to 2 decimals, the precision the API keeps for percentages and marks */
export const round2 = (n: number): number => Math.round(n * 100) / 100;

export function totalWeight(trainings: Pick<TrainingInput, 'weightPct'>[]): number {
  return round2(trainings.reduce((sum, t) => sum + (isNum(t.weightPct) ? t.weightPct : 0), 0));
}

/** Everything that would stop the API saving the course, plus warnings */
export function validateCourse(course: CourseInput): CourseIssue[] {
  const issues: CourseIssue[] = [];
  const add = (code: CourseIssueCode, path: string, values?: Record<string, string>, warning?: boolean) =>
    issues.push({ code, path, ...(values && { values }), ...(warning && { warning }) });

  if (!course.code.trim()) add('CODE_REQUIRED', 'course.code');
  if (!course.name.trim()) add('NAME_REQUIRED', 'course.name');

  const threshold = course.retrainThresholdPct;
  if (!isNum(threshold) || threshold < 0 || threshold > 100) add('THRESHOLD_RANGE', 'course.retrainThresholdPct');

  const attempts = course.maxAttempts;
  if (!Number.isInteger(attempts) || attempts < 1 || attempts > COURSE_LIMITS.maxAttempts) {
    add('MAX_ATTEMPTS_RANGE', 'course.maxAttempts', { max: String(COURSE_LIMITS.maxAttempts) });
  }

  const autoClose = course.autoCloseDays;
  const autoCloseOk = Number.isInteger(autoClose) && autoClose >= 1 && autoClose <= COURSE_LIMITS.autoCloseDays;
  if (!autoCloseOk) add('AUTO_CLOSE_RANGE', 'course.autoCloseDays', { max: String(COURSE_LIMITS.autoCloseDays) });

  const reminders = course.reminderDays;
  if (reminders.some((d) => !Number.isInteger(d) || d < 1 || (autoCloseOk && d >= autoClose))) {
    add('REMINDER_RANGE', 'course.reminderDays', { autoCloseDays: String(autoCloseOk ? autoClose : '') });
  }
  if (new Set(reminders).size !== reminders.length) add('REMINDER_DUPLICATE', 'course.reminderDays');

  const floor = course.payoutFloor;
  const floorOk = Number.isInteger(floor) && floor >= 0;
  if (!floorOk) add('FLOOR_NEGATIVE', 'course.payoutFloor');

  // Bands
  const { bands } = course;
  if (!bands.length) add('BANDS_REQUIRED', 'bands');
  if (bands.length > COURSE_LIMITS.bands) add('BANDS_TOO_MANY', 'bands', { max: String(COURSE_LIMITS.bands) });
  if (bands.length && !bands.some((b) => b.minPct === 0)) add('BANDS_NEED_ZERO', 'bands');
  const seenPct = new Set<number>();
  bands.forEach((band, i) => {
    if (!isNum(band.minPct) || band.minPct < 0 || band.minPct > 100) add('BAND_PCT_RANGE', `bands.${i}`);
    else if (seenPct.has(band.minPct)) add('BAND_PCT_DUPLICATE', `bands.${i}`);
    seenPct.add(band.minPct);
    if (!Number.isInteger(band.amount) || (floorOk && band.amount < floor)) {
      add('BAND_BELOW_FLOOR', `bands.${i}`, { floor: String(floorOk ? floor : 0) });
    }
  });

  // Trainings
  const { trainings } = course;
  if (!trainings.length) add('TRAININGS_REQUIRED', 'trainings');
  if (trainings.length > COURSE_LIMITS.trainings) {
    add('TRAININGS_TOO_MANY', 'trainings', { max: String(COURSE_LIMITS.trainings) });
  }
  const total = totalWeight(trainings);
  if (trainings.length && total !== 100) add('WEIGHTS_NOT_100', 'trainings', { total: String(total) });

  const seenCodes = new Set<string>();
  trainings.forEach((t, i) => {
    const path = `trainings.${i}`;
    const code = t.code.trim().toUpperCase();
    if (!code) add('TRAINING_CODE_REQUIRED', path);
    else if (seenCodes.has(code)) add('TRAINING_CODE_DUPLICATE', path, { code: t.code.trim() });
    seenCodes.add(code);
    if (!t.name.trim()) add('TRAINING_NAME_REQUIRED', path);
    if (!isNum(t.weightPct) || t.weightPct <= 0 || t.weightPct > 100) add('WEIGHT_RANGE', path);
    if (!isNum(t.maxMarks) || t.maxMarks <= 0) add('MAX_MARKS_POSITIVE', path);
    else if (!isNum(t.passMarks) || t.passMarks < 0 || t.passMarks > t.maxMarks) add('PASS_MARKS_RANGE', path);
  });

  return issues;
}

/** Bands from the highest minPct down, the order they're shown and matched in */
export function sortBands<T extends BandInput>(bands: T[]): T[] {
  return [...bands].sort((a, b) => b.minPct - a.minPct);
}

/** The band amount for a weighted %: the highest band whose minPct ≤ pct (89.6 is in the 75 band) */
export function bandFor(bands: BandInput[], weightedPct: number): number | undefined {
  return sortBands(bands).find((b) => b.minPct <= weightedPct)?.amount;
}

/** payout = floor + ⌊(band − floor) × passed / total⌋ */
export function payoutFor(floor: number, band: number, passed: number, total: number): number {
  if (total <= 0) return floor;
  return floor + Math.floor(((band - floor) * passed) / total);
}

/** weightedPct = Σ marks / max × weight, rounded to 2 decimals */
export function weightedPct(trainings: Pick<TrainingInput, 'weightPct' | 'maxMarks'>[], marks: number[]): number {
  return round2(trainings.reduce((sum, t, i) => sum + ((marks[i] ?? 0) / t.maxMarks) * t.weightPct, 0));
}

export interface PayoutRow {
  minPct: number;
  /** The band's upper edge, for the label (undefined for the top band) */
  belowPct?: number;
  amount: number;
  /** Payout by trainings passed, from all passed down to none */
  byPassed: { passed: number; payout: number }[];
}

/** The payout table for a course: one row per band, one column per number of trainings passed */
export function payoutTable(floor: number, bands: BandInput[], totalTrainings: number): PayoutRow[] {
  const sorted = sortBands(bands);
  return sorted.map((band, i) => ({
    minPct: band.minPct,
    belowPct: i === 0 ? undefined : sorted[i - 1].minPct,
    amount: band.amount,
    byPassed: Array.from({ length: totalTrainings + 1 }, (_, k) => {
      const passed = totalTrainings - k;
      return { passed, payout: payoutFor(floor, band.amount, passed, totalTrainings) };
    }),
  }));
}

// ---------------------------------------------------------------------------
// The age matrix

export type MatrixGender = 'MALE' | 'FEMALE';

export interface AgeRuleInput {
  minAge: number;
  maxAge: number;
  /** null: both genders */
  gender: MatrixGender | null;
  courseId: string;
}

export type AgeRuleIssueCode = 'AGE_INVALID' | 'AGE_ORDER' | 'COURSE_REQUIRED' | 'OVERLAP';

export interface AgeRuleIssue {
  index: number;
  code: AgeRuleIssueCode;
  /** For OVERLAP: the other row */
  otherIndex?: number;
}

const gendersOverlap = (a: MatrixGender | null, b: MatrixGender | null) => a === null || b === null || a === b;

/** Rows the API would refuse; an overlap is reported on both rows */
export function validateAgeRules(rules: AgeRuleInput[]): AgeRuleIssue[] {
  const issues: AgeRuleIssue[] = [];
  const valid: boolean[] = rules.map((rule, index) => {
    if (!Number.isInteger(rule.minAge) || !Number.isInteger(rule.maxAge) || rule.minAge < 0 || rule.maxAge < 0) {
      issues.push({ index, code: 'AGE_INVALID' });
      return false;
    }
    if (rule.minAge > rule.maxAge) {
      issues.push({ index, code: 'AGE_ORDER' });
      return false;
    }
    return true;
  });
  rules.forEach((rule, index) => {
    if (!rule.courseId) issues.push({ index, code: 'COURSE_REQUIRED' });
  });
  for (let i = 0; i < rules.length; i += 1) {
    for (let j = i + 1; j < rules.length; j += 1) {
      if (!valid[i] || !valid[j]) continue;
      const a = rules[i];
      const b = rules[j];
      if (gendersOverlap(a.gender, b.gender) && a.minAge <= b.maxAge && b.minAge <= a.maxAge) {
        issues.push({ index: i, code: 'OVERLAP', otherIndex: j });
        issues.push({ index: j, code: 'OVERLAP', otherIndex: i });
      }
    }
  }
  return issues;
}

/** The rows that give a course for this age and gender (more than one means an overlap) */
export function rulesFor(rules: AgeRuleInput[], age: number, gender: MatrixGender): number[] {
  return rules.reduce<number[]>((acc, rule, index) => {
    if (age >= rule.minAge && age <= rule.maxAge && (rule.gender === null || rule.gender === gender)) acc.push(index);
    return acc;
  }, []);
}

/** Ages in [from, to] with no course for a gender: allowed, but shown as a warning */
export function uncoveredAges(rules: AgeRuleInput[], gender: MatrixGender, from: number, to: number): number[] {
  const ages: number[] = [];
  for (let age = from; age <= to; age += 1) if (!rulesFor(rules, age, gender).length) ages.push(age);
  return ages;
}
