// regex.ts

// Only digits (integer)
export const numberRegex = /^\d+$/;

// Email with required TLD (.com, .edu, etc.)
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Integer or decimal (e.g., 123, 123.45)
export const decimalRegex = /^\d+(\.\d+)?$/;

// Regex for negative decimals
export const negativeDecimalRegex = /^-?\d*\.?\d*$/;

export const excludeSpecial = /^[a-z0-9_-]+$/;

export const maxLength100 = /^.{1,100}$/;

export const isoRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d+)?(Z)?)?$/;
