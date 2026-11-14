/**
 * Enrollments, passes, assignments, closing, reopening, grade overrides and the grades to review
 * (contract v3, "Admin routes").
 */
import {
  AddTrainingPassDto,
  AdminAttemptEntity,
  AssignmentEntity,
  CreateTrainingEnrollmentDto,
  DecisionEntity,
  EnrollmentItemEntity,
  EnrollmentRulesEntity,
  MarkDto,
  RulesTrainingEntity,
  StudentTrainingsDto,
  TrainerLedgerEntryEntity,
  TrainerLedgerKind,
  TrainerLedgerStatus,
  TrainingAttemptRowEntity,
  TrainingClosureReason,
  TrainingEnrollmentDetailEntity,
  TrainingEnrollmentEntity,
  TrainingEnrollmentState,
  TrainingPassEntity,
  TrainingPayoutStatus,
  TrainingsAdminControllerAttemptsParams,
  TrainingsAdminControllerListParams,
} from '@/providers/service/app.schemas';
import {
  trainingsAdminControllerAddPass,
  trainingsAdminControllerClose,
  trainingsAdminControllerEnroll,
  trainingsAdminControllerOverride,
  trainingsAdminControllerReopen,
  trainingsAdminControllerRevokePass,
  trainingsAdminControllerRunClock,
  trainingsAdminControllerSetTester,
  trainingsAdminControllerSetTrainer,
  useTrainingsAdminControllerAttempts,
  useTrainingsAdminControllerDetail,
  useTrainingsAdminControllerList,
  useTrainingsAdminControllerStudent,
} from '@/providers/service/trainings/trainings';

import { cleanParams, useQueryGate, useTrainingsMutation } from './common';

export const ENROLLMENT_STATES = Object.values(TrainingEnrollmentState);
export type EnrollmentState = TrainingEnrollmentState;
export type ClosureReason = TrainingClosureReason;
export type PayoutStatus = TrainingPayoutStatus;

export type EnrollmentListItem = TrainingEnrollmentEntity;
export type Decision = DecisionEntity;
export type Assignment = AssignmentEntity;
export type Attempt = AdminAttemptEntity;
export type RulesSnapshot = EnrollmentRulesEntity;
export type RuleTraining = RulesTrainingEntity;
export type LedgerKind = TrainerLedgerKind;
export type LedgerStatus = TrainerLedgerStatus;
export type LedgerEntry = TrainerLedgerEntryEntity;
export type AttemptRow = TrainingAttemptRowEntity;

/**
 * A required training in the enrollment. Improving a pass from an earlier session (below 90%) is
 * typed here until core's export has it: it pays only if it reaches a higher band.
 */
export type EnrollmentItem = EnrollmentItemEntity & { improvingFromPct?: number | null };
export type EnrollmentDetail = Omit<TrainingEnrollmentDetailEntity, 'trainings'> & { trainings: EnrollmentItem[] };

/** A pass, with whether it can still be improved in a later session (typed until core's export has it) */
export type TrainingPass = TrainingPassEntity & { improvable?: boolean };
export type StudentTrainings = Omit<StudentTrainingsDto, 'passed'> & { passed: TrainingPass[] };

export type ItemProgress = 'DONE' | 'CAN_RETRAIN' | 'FAILED' | 'PENDING';

/** Where a training stands: done, passed but can be retrained (below the retrain %), failed, or not tested */
export function itemProgress(item: Pick<EnrollmentItem, 'status' | 'retrainable'>): ItemProgress {
  if (item.status === 'PENDING') return 'PENDING';
  if (item.status === 'FAILED') return 'FAILED';
  return item.retrainable ? 'CAN_RETRAIN' : 'DONE';
}

export type EnrollmentFilters = TrainingsAdminControllerListParams;

export const useEnrollments = (params: EnrollmentFilters) =>
  useTrainingsAdminControllerList(cleanParams(params), useQueryGate());

export const useEnrollment = (id?: string) =>
  useTrainingsAdminControllerDetail<{ data: EnrollmentDetail }>(id ?? '', useQueryGate(!!id));

/** The student's age now, what's required, what's passed (any year) and every enrollment */
export function useStudentTrainings(studentId?: string) {
  const query = useTrainingsAdminControllerStudent<{ data: StudentTrainings }>(
    studentId ?? '',
    useQueryGate(!!studentId),
  );
  return { ...query, student: query.data?.data };
}

/** A manual pass, e.g. from earlier records. It pays nobody. */
export const useAddPass = () =>
  useTrainingsMutation((data: AddTrainingPassDto) => trainingsAdminControllerAddPass(data));

/** The training becomes required again */
export const useRevokePass = () =>
  useTrainingsMutation(({ id, reason }: { id: string; reason: string }) =>
    trainingsAdminControllerRevokePass(id, { reason }),
  );

/**
 * Enroll in this session: core answers 400 NOTHING_REQUIRED or 409 ALREADY_ENROLLED.
 * `improveTrainingIds` adds passes below 90% from earlier sessions (typed until core's export has it).
 */
export const useEnroll = () =>
  useTrainingsMutation((data: CreateTrainingEnrollmentDto & { improveTrainingIds?: string[] }) =>
    trainingsAdminControllerEnroll(data),
  );

/** Full reassignment: progress and the payout move. Refused on a closed enrollment. */
export const useReassignTrainer = () =>
  useTrainingsMutation(({ id, ...data }: { id: string; trainerStaffUserId: string | null; reason: string }) =>
    trainingsAdminControllerSetTrainer(id, data),
  );

export const useAssignTester = () =>
  useTrainingsMutation(({ id, ...data }: { id: string; testerStaffUserId: string | null }) =>
    trainingsAdminControllerSetTester(id, data),
  );

export const useCloseEnrollment = () =>
  useTrainingsMutation(({ id, reason }: { id: string; reason: string }) =>
    trainingsAdminControllerClose(id, { reason }),
  );

export const useReopenEnrollment = () =>
  useTrainingsMutation(({ id, reason }: { id: string; reason: string }) =>
    trainingsAdminControllerReopen(id, { reason }),
  );

export const useOverrideMarks = () =>
  useTrainingsMutation(({ attemptId, ...data }: { attemptId: string; marks: MarkDto[]; reason: string }) =>
    trainingsAdminControllerOverride(attemptId, data),
  );

/** Runs the auto-close and reminder job now */
export const useRunAutoClose = () => useTrainingsMutation(() => trainingsAdminControllerRunClock());

export type AttemptFilters = TrainingsAdminControllerAttemptsParams;

/** Graded attempts to review: late grades, overridden marks, by window, tester and dates */
export const useAttemptsToReview = (params: AttemptFilters) =>
  useTrainingsAdminControllerAttempts(cleanParams(params), useQueryGate());
