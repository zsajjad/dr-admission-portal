import messages from './messages';

type MessageKey = keyof typeof messages;

/** Permission codes the portal knows how to describe, grouped as admins think about them. */
export const PERMISSION_GROUPS: { key: string; title: MessageKey; codes: string[] }[] = [
  { key: 'students', title: 'groupStudents', codes: ['students.editIdentity', 'students.merge'] },
  { key: 'sections', title: 'groupSections', codes: ['sections.manage', 'staff.manage', 'staff.review'] },
  { key: 'results', title: 'groupResults', codes: ['results.enter', 'results.lock', 'results.override'] },
  {
    key: 'trainings',
    title: 'groupTrainings',
    codes: ['trainings.configure', 'trainings.manage', 'trainings.override', 'trainings.payouts'],
  },
  { key: 'reports', title: 'groupReports', codes: ['reports.view', 'reports.chat', 'audit.view'] },
];

const KNOWN = new Set(PERMISSION_GROUPS.flatMap((g) => g.codes));

/**
 * The groups to show for the permissions core offers (its catalogue). Codes core doesn't have yet
 * are left out; codes the portal doesn't know go under "Other" with core's own description.
 */
export function groupCatalogue(codes: string[]) {
  const offered = new Set(codes);
  const groups = PERMISSION_GROUPS.map((g) => ({ ...g, codes: g.codes.filter((c) => offered.has(c)) })).filter(
    (g) => g.codes.length > 0,
  );
  const other = codes.filter((c) => !KNOWN.has(c));
  if (other.length) groups.push({ key: 'other', title: 'groupOther', codes: other });
  return groups;
}

/** The short name and description messages for a code, when the portal knows it. */
export function permissionMessages(code: string) {
  const all = messages as Record<string, (typeof messages)[MessageKey]>;
  const key = `p_${code.replace('.', '_')}`;
  const name = all[key];
  const hint = all[`${key}_hint`];
  return name && hint ? { name, hint } : null;
}
