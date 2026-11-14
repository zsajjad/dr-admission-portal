/**
 * Fiqh training rules the portal checks before saving (knowledge-base/trainings-contract.md, v3 "Rules").
 * The API enforces the same rules; these give the admin instant feedback and the pay table preview.
 *
 * Pure functions with no imports, so `node --test` runs them without a build (see rules.test.ts).
 */

export interface BandInput {
  minPct: number;
  amount: number;
}

/** The requirements' defaults for a new training */
export const TRAINING_DEFAULTS = {
  maxMarks: 100,
  passMarks: 50,
  payoutFloor: 350,
  bands: [
    { minPct: 90, amount: 1000 },
    { minPct: 75, amount: 750 },
    { minPct: 50, amount: 500 },
    { minPct: 0, amount: 350 },
  ],
};

export const LIMITS = {
  maxAge: 30,
  bands: 10,
  maxAttempts: 5,
  autoCloseDays: 365,
};

export type IssueCode =
  | 'CODE_REQUIRED'
  | 'NAME_REQUIRED'
  | 'AGE_RANGE'
  | 'MAX_MARKS_POSITIVE'
  | 'PASS_MARKS_RANGE'
  | 'FLOOR_NEGATIVE'
  | 'BANDS_REQUIRED'
  | 'BANDS_TOO_MANY'
  | 'BANDS_NEED_ZERO'
  | 'BAND_PCT_RANGE'
  | 'BAND_PCT_DUPLICATE'
  | 'BAND_BELOW_FLOOR'
  | 'MAX_ATTEMPTS_RANGE'
  | 'RETRAIN_PCT_RANGE'
  | 'AUTO_CLOSE_RANGE'
  | 'REMINDER_RANGE'
  | 'REMINDER_DUPLICATE';

export interface Issue {
  code: IssueCode;
  /** The field, or a row such as 'bands.0' */
  path: string;
  values?: Record<string, string>;
}

const isNum = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n);

/** Rounds to 2 decimals, the precision the API keeps for percentages and marks */
export const round2 = (n: number): number => Math.round(n * 100) / 100;

export interface TrainingInput {
  code: string;
  name: string;
  requiredFromAge: number;
  maxMarks: number;
  passMarks: number;
  payoutFloor: number;
  bands: BandInput[];
}

/** Everything that would stop the API saving a catalog training */
export function validateTraining(t: TrainingInput): Issue[] {
  const issues: Issue[] = [];
  const add = (code: IssueCode, path: string, values?: Record<string, string>) =>
    issues.push({ code, path, ...(values && { values }) });

  if (!t.code.trim()) add('CODE_REQUIRED', 'code');
  if (!t.name.trim()) add('NAME_REQUIRED', 'name');
  if (!Number.isInteger(t.requiredFromAge) || t.requiredFromAge < 0 || t.requiredFromAge > LIMITS.maxAge) {
    add('AGE_RANGE', 'requiredFromAge', { max: String(LIMITS.maxAge) });
  }
  if (!isNum(t.maxMarks) || t.maxMarks <= 0) add('MAX_MARKS_POSITIVE', 'maxMarks');
  else if (!isNum(t.passMarks) || t.passMarks < 0 || t.passMarks > t.maxMarks) add('PASS_MARKS_RANGE', 'passMarks');

  const floorOk = Number.isInteger(t.payoutFloor) && t.payoutFloor >= 0;
  if (!floorOk) add('FLOOR_NEGATIVE', 'payoutFloor');

  const { bands } = t;
  if (!bands.length) add('BANDS_REQUIRED', 'bands');
  if (bands.length > LIMITS.bands) add('BANDS_TOO_MANY', 'bands', { max: String(LIMITS.bands) });
  if (bands.length && !bands.some((b) => b.minPct === 0)) add('BANDS_NEED_ZERO', 'bands');
  const seen = new Set<number>();
  bands.forEach((band, i) => {
    if (!isNum(band.minPct) || band.minPct < 0 || band.minPct > 100) add('BAND_PCT_RANGE', `bands.${i}`);
    else if (seen.has(band.minPct)) add('BAND_PCT_DUPLICATE', `bands.${i}`);
    seen.add(band.minPct);
    if (!Number.isInteger(band.amount) || (floorOk && band.amount < t.payoutFloor)) {
      add('BAND_BELOW_FLOOR', `bands.${i}`, { floor: String(floorOk ? t.payoutFloor : 0) });
    }
  });
  return issues;
}

export interface SettingsInput {
  maxAttempts: number;
  /** A training scored below this can be retrained in the same session, even if passed */
  retrainBelowPct: number;
  autoCloseDays: number;
  reminderDays: number[];
}

/** Attempts per training per session, auto-close and reminder days */
export function validateSettings(s: SettingsInput): Issue[] {
  const issues: Issue[] = [];
  if (!Number.isInteger(s.maxAttempts) || s.maxAttempts < 1 || s.maxAttempts > LIMITS.maxAttempts) {
    issues.push({ code: 'MAX_ATTEMPTS_RANGE', path: 'maxAttempts', values: { max: String(LIMITS.maxAttempts) } });
  }
  if (!isNum(s.retrainBelowPct) || s.retrainBelowPct < 0 || s.retrainBelowPct > 100) {
    issues.push({ code: 'RETRAIN_PCT_RANGE', path: 'retrainBelowPct' });
  }
  const autoCloseOk =
    Number.isInteger(s.autoCloseDays) && s.autoCloseDays >= 1 && s.autoCloseDays <= LIMITS.autoCloseDays;
  if (!autoCloseOk) {
    issues.push({ code: 'AUTO_CLOSE_RANGE', path: 'autoCloseDays', values: { max: String(LIMITS.autoCloseDays) } });
  }
  if (s.reminderDays.some((d) => !Number.isInteger(d) || d < 1 || (autoCloseOk && d >= s.autoCloseDays))) {
    issues.push({
      code: 'REMINDER_RANGE',
      path: 'reminderDays',
      values: { autoCloseDays: String(autoCloseOk ? s.autoCloseDays : '') },
    });
  }
  if (new Set(s.reminderDays).size !== s.reminderDays.length)
    issues.push({ code: 'REMINDER_DUPLICATE', path: 'reminderDays' });
  return issues;
}

/** Bands from the highest minPct down, the order they're shown and matched in */
export function sortBands<T extends BandInput>(bands: T[]): T[] {
  return [...bands].sort((a, b) => b.minPct - a.minPct);
}

/** The band amount for a score %: the highest band whose minPct ≤ pct (89.6 is in the 75 band) */
export function bandFor(bands: BandInput[], pct: number): number | undefined {
  return sortBands(bands).find((b) => b.minPct <= pct)?.amount;
}

export interface Graded {
  scorePct: number;
  passed: boolean;
  pay: number;
}

/**
 * One training's result: the score %, passed when marks ≥ pass marks, and the pay: the band for
 * the score when passed, the floor when tested and failed.
 */
export function grade(
  t: Pick<TrainingInput, 'maxMarks' | 'passMarks' | 'payoutFloor' | 'bands'>,
  marks: number,
): Graded {
  const scorePct = round2((marks / t.maxMarks) * 100);
  const passed = marks >= t.passMarks;
  return { scorePct, passed, pay: passed ? (bandFor(t.bands, scorePct) ?? t.payoutFloor) : t.payoutFloor };
}

export interface PayRow {
  minPct: number;
  /** The band's upper edge, for the label (undefined for the top band) */
  belowPct?: number;
  amount: number;
  /** False when every score in the band is below the pass mark, so a pass can't earn it */
  reachable: boolean;
}

/** A training's pay table: what each band pays when passed; a failed test pays the floor */
export function payTable(t: Pick<TrainingInput, 'maxMarks' | 'passMarks' | 'bands'>): PayRow[] {
  const passPct = t.maxMarks > 0 ? (t.passMarks / t.maxMarks) * 100 : 0;
  const sorted = sortBands(t.bands);
  return sorted.map((band, i) => {
    const belowPct = i === 0 ? undefined : sorted[i - 1].minPct;
    return {
      minPct: band.minPct,
      belowPct,
      amount: band.amount,
      reachable: belowPct === undefined || belowPct > passPct,
    };
  });
}
