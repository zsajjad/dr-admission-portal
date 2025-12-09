/* cSpell:disable */

import { format, isEqual } from 'date-fns';

import { dateTime } from '@/constants/configs';
import { isoRegex } from '@/constants/regex';

export function getMapsUrl(destination: { latitude: number; longitude: number }): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${destination.latitude},${destination.longitude}&travelmode=driving`;
}

export const convertToUrlString = (raw: string): string => {
  if (!raw) return '';
  try {
    const st = raw
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/'|\.|\+|,|%|\/|\!|&/g, '');
    return st;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return '';
  }
};

export const getWindowElement = (): HTMLElement => {
  // if (checkBrowser() === 'safari') {
  //   return document.body || document.documentElement;
  // }
  return document.documentElement;
};

export const setWindowScroll = (x?: number, y?: number): void => {
  const el = getWindowElement();
  el.scroll(x || 0, y || 0);
};

export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /Mobi|Android/i.test(navigator.userAgent);
};

export const isBrowser = (): boolean => {
  return typeof window !== 'undefined';
};

function extractCSSVariable(str: string) {
  const match = str.match(/--[\w-]+/);
  return match ? match[0] : null;
}

export function extractCSSVariableValue(str: string) {
  if (typeof window === 'undefined') return '';
  const CSSVariable = extractCSSVariable(str);
  if (CSSVariable) {
    return getComputedStyle(document.documentElement).getPropertyValue(CSSVariable);
  }
  return '';
}

export const overrideArray = <T>(base: T[], overrides: Partial<T[]>): T[] => {
  return base.map((item, index) => (overrides[index] !== undefined ? overrides[index] : item));
};

export const formattedDate = (date: string) => {
  if (!date) return '--';
  return format(date, dateTime);
};

export const getCommaSeparatedValue = (price?: number | string) => {
  return Number(price).toLocaleString('en-IN');
};

export const getPercentage = (value: number, total: number) => {
  if (typeof value === 'number' && typeof total === 'number' && total !== 0) {
    return Math.floor((value / total) * 100);
  }
  return 0;
};

export const getStartDateFromWeekString = (weekString: string) => {
  const match = weekString.match(/Week\s+(\d{1,2}),\s*(\d{4})/i);
  if (!match) {
    throw new Error("Invalid format. Use 'Week XX, YYYY'.");
  }

  const week = parseInt(match[1], 10);
  const year = parseInt(match[2], 10);

  // Calculate ISO week start date (Monday)
  const simple = new Date(year, 0, 1 + (week - 1) * 7);
  const dayOfWeek = simple.getDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6
  const diff = dayOfWeek <= 4 ? dayOfWeek - 1 : dayOfWeek - 8;
  simple.setDate(simple.getDate() - diff);

  return simple;
};

export const toBoolean = (value: string | boolean | null | undefined): boolean => {
  if (value === undefined || value === null) return false; // keep undefined/null if needed
  if (typeof value === 'boolean') return value; // already boolean
  if (typeof value === 'string') return value.toLowerCase() === 'true'; // check string
  return false; // fallback
};

export const getDeltaChange = (curr: number, prev: number) => {
  if (!curr && !prev) return 0;
  return Number((((curr - prev) / prev) * 100).toFixed(2));
};
export const stopPropagation = (fn: () => void) => (e: React.MouseEvent) => {
  e.stopPropagation();
  fn();
};
/**
 * Compares two Date objects for exact time equality, ignoring milliseconds.
 *
 * @param date1 - First Date object
 * @param date2 - Second Date object
 * @returns boolean - true if time (up to seconds) is equal, false otherwise
 */
export const areDateTimeEqual = (date1: Date, date2: Date): boolean => {
  const stripMilliseconds = (date: Date) => {
    const stripDate = new Date(date);
    stripDate.setMilliseconds(0);
    return stripDate;
  };

  return isEqual(stripMilliseconds(date1), stripMilliseconds(date2));
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const truncateValue = (value: unknown, maxLength: number): any => {
  if (typeof value === 'string' && value.length > maxLength) {
    return value.slice(0, maxLength) + '...';
  }

  if (Array.isArray(value)) {
    return value.map((item) => truncateValue(item, maxLength));
  }

  if (typeof value === 'object' && value !== null) {
    const truncatedObj: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value)) {
      truncatedObj[key] = truncateValue(val, maxLength);
    }
    return truncatedObj;
  }

  return value;
};
export function getSafeValue<T>(value: T | null | undefined): string | T {
  if (value === null || value === undefined || value === '') {
    return '--';
  }
  return value;
}

export function shortAmount(value: number | string): string {
  const valueNumber = Number(value);
  if (valueNumber >= 1_000_000_000) return `${(valueNumber / 1_000_000_000).toFixed(2)}B`;
  if (valueNumber >= 1_000_000) return `${(valueNumber / 1_000_000).toFixed(2)}M`;
  if (valueNumber >= 1_000) return `${(valueNumber / 1_000).toFixed(2)}K`;
  return valueNumber.toLocaleString();
}

export const preventInvalidNumberKeys = (e: React.KeyboardEvent<HTMLInputElement>) => {
  const invalidKeys = ['e', 'E', '+', '-', '.'];
  if (invalidKeys.includes(e.key)) {
    e.preventDefault();
  }
};
export const isDateString = (value?: string) => {
  if (!value) return false;
  if (!isoRegex.test(value)) return false;

  return !isNaN(Date.parse(value));
};

export const formatLabel = (key: string) => {
  if (!key) return '';
  let result = key.replace(/([A-Z])/g, ' $1');
  result = result.replace(/_/g, ' ');
  result = result.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1));
  return result;
};
