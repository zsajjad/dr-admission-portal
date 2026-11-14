import { Permission } from '@/providers/service/app.schemas';

import { usePermissions } from '@/hooks/usePermissions';

/** The trainings permissions (contract v2) */
export const TrainingsPermission = {
  configure: Permission.trainingsconfigure,
  manage: Permission.trainingsmanage,
  override: Permission.trainingsoverride,
  payouts: Permission.trainingspayouts,
};

/** Reads need any trainings permission, or reports.view */
export const TRAININGS_READ: Permission[] = [
  Permission.trainingsconfigure,
  Permission.trainingsmanage,
  Permission.trainingsoverride,
  Permission.trainingspayouts,
  Permission.reportsview,
];

/** What the signed-in admin may see and do in the trainings pages. The API enforces the same rules. */
export function useTrainingsAccess() {
  const { has, isLoading } = usePermissions();
  return {
    isLoading,
    canRead: has(...TRAININGS_READ),
    canConfigure: has(Permission.trainingsconfigure),
    canManage: has(Permission.trainingsmanage),
    canOverride: has(Permission.trainingsoverride),
    canPayouts: has(Permission.trainingspayouts),
  };
}
