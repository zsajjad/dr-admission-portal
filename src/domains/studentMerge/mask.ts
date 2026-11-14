/** Show only the end of a value: enough to compare two records, not to copy it. */
export function maskTail(value: string | null | undefined, keep: number): string {
  if (!value) return '';
  const chars = value.replace(/\s+/g, '');
  if (chars.length <= keep) return '•'.repeat(chars.length);
  return `${'•'.repeat(Math.min(chars.length - keep, 8))}${chars.slice(-keep)}`;
}

/** Phones keep their last 3 digits, B-forms their last 4; addresses are hidden. */
export function maskField(field: string, value: string | null | undefined): string {
  if (!value) return '';
  if (field === 'phone' || field === 'alternatePhone') return maskTail(value.replace(/\D/g, ''), 3);
  if (field === 'identityNumber') return maskTail(value.replace(/\D/g, ''), 4);
  if (field === 'address') return '••••••';
  return value;
}

export const MASKED_FIELDS = new Set(['phone', 'alternatePhone', 'identityNumber', 'address']);
