import { Permission } from '@/providers/service/app.schemas';

import { usePermissions } from '@/hooks/usePermissions';

/**
 * The trainings permissions (contract v2). They aren't in the generated client until core ships
 * them, so they're typed here; swap for `Permission.trainings…` after the next orval run.
 */
export const TrainingsPermission = {
  configure: 'trainings.configure' as Permission,
  manage: 'trainings.manage' as Permission,
  override: 'trainings.override' as Permission,
  payouts: 'trainings.payouts' as Permission,
};

/** Reads need any trainings permission, or reports.view */
export const TRAININGS_READ: Permission[] = [
  TrainingsPermission.configure,
  TrainingsPermission.manage,
  TrainingsPermission.override,
  TrainingsPermission.payouts,
  Permission.reportsview,
];

/** What the signed-in admin may see and do in the trainings pages. The API enforces the same rules. */
export function useTrainingsAccess() {
  const { has, isLoading } = usePermissions();
  return {
    isLoading,
    canRead: has(...TRAININGS_READ),
    canConfigure: has(TrainingsPermission.configure),
    canManage: has(TrainingsPermission.manage),
    canOverride: has(TrainingsPermission.override),
    canPayouts: has(TrainingsPermission.payouts),
  };
}
