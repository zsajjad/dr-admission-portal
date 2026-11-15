import { TRAININGS_READ } from '@/domains/trainings/permissions';

import { Permission } from '@/providers/service/app.schemas';

import { usePermissions } from '@/hooks/usePermissions';

/** Households, members, suggestions and the review queue */
export const FAMILIES_READ: Permission[] = [Permission.familiesread, Permission.familiesmanage];

/** The family report also opens with reports.view */
export const FAMILY_REPORT_READ: Permission[] = [...FAMILIES_READ, Permission.reportsview];

/** What the signed-in admin may see and do on the family pages. The API enforces the same rules. */
export function useFamiliesAccess() {
  const { has, isAdmin, isLoading } = usePermissions();
  return {
    isLoading,
    canRead: has(...FAMILIES_READ),
    canManage: has(Permission.familiesmanage),
    canReport: has(...FAMILY_REPORT_READ),
    canSeeResults: has(Permission.reportsview, Permission.resultsenter),
    canSeeTrainings: has(...TRAININGS_READ),
    canMerge: has(Permission.studentsmerge),
    /** Schools pages are for admins and super admins */
    canOpenSchools: isAdmin,
  };
}
