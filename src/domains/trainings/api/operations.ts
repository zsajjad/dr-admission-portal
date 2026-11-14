/**
 * Enrollments, assignments, closing, reopening and grade overrides (contract v2, "Admin routes").
 */
import {
  AdminAttemptEntity,
  AssignmentEntity,
  AttemptMarkEntity,
  CreateTrainingEnrollmentDto,
  DecisionEntity,
  TrainerLedgerEntryEntity,
  TrainerLedgerKind,
  TrainerLedgerStatus,
  TrainingClosureReason,
  TrainingEnrollmentDetailEntity,
  TrainingEnrollmentEntity,
  TrainingEnrollmentState,
  TrainingPayoutStatus,
  TrainingsAdminControllerListParams,
} from '@/providers/service/app.schemas';
import {
  trainingsAdminControllerClose,
  trainingsAdminControllerEnroll,
  trainingsAdminControllerOverride,
  trainingsAdminControllerReopen,
  trainingsAdminControllerRunClock,
  trainingsAdminControllerSetTester,
  trainingsAdminControllerSetTrainer,
  useTrainingsAdminControllerDetail,
  useTrainingsAdminControllerList,
  useTrainingsAdminControllerStudent,
  useTrainingsLedgerControllerList,
} from '@/providers/service/trainings/trainings';

import { cleanParams, useQueryGate, useTrainingsMutation } from './common';
import { Band } from './setup';

export const ENROLLMENT_STATES = Object.values(TrainingEnrollmentState);
export type EnrollmentState = TrainingEnrollmentState;
export type ClosureReason = TrainingClosureReason;
export type PayoutStatus = TrainingPayoutStatus;

export type EnrollmentListItem = TrainingEnrollmentEntity;
export type Decision = DecisionEntity;
export type Assignment = AssignmentEntity;

/**
 * A wrong or right step in a practical training (core feat/trainings-results, in progress).
 * Typed here until it's in the generated client.
 */
export interface MarkStep {
  stepCode: string;
  correct: boolean;
}
export type AttemptMark = AttemptMarkEntity & { steps?: MarkStep[] | null };
export type Attempt = Omit<AdminAttemptEntity, 'marks'> & { marks: AttemptMark[] };

/** The course and its trainings as they were at enrollment (core's CourseRules; untyped in the spec) */
export interface RulesSnapshot {
  courseId: string;
  code: string;
  name: string;
  nameUr: string | null;
  retrainThresholdPct: number;
  maxAttempts: number;
  autoCloseDays: number;
  reminderDays: number[];
  payoutFloor: number;
  bands: Band[];
  trainings: {
    trainingId: string;
    code: string;
    name: string;
    nameUr: string | null;
    weightPct: number;
    maxMarks: number;
    passMarks: number;
    sortOrder: number;
  }[];
}

export type EnrollmentDetail = Omit<TrainingEnrollmentDetailEntity, 'rules' | 'attempts'> & {
  rules: RulesSnapshot;
  attempts: Attempt[];
};

export type LedgerKind = TrainerLedgerKind;
export type LedgerStatus = TrainerLedgerStatus;
export type LedgerEntry = TrainerLedgerEntryEntity;

/** The best attempt: the highest payout, a tie going to the later attempt */
export function bestAttempt<T extends { payout: number; attemptNo: number }>(attempts: T[]): T | undefined {
  return [...attempts].sort((a, b) => b.payout - a.payout || b.attemptNo - a.attemptNo)[0];
}

export type EnrollmentFilters = TrainingsAdminControllerListParams;

export const useEnrollments = (params: EnrollmentFilters) =>
  useTrainingsAdminControllerList(cleanParams(params), useQueryGate());

export const useEnrollment = (id?: string) =>
  useTrainingsAdminControllerDetail<{ data: EnrollmentDetail }>(id ?? '', useQueryGate(!!id));

/** The student's enrollments in every year, what the matrix gives now, and their completed courses */
export const useStudentTrainings = (studentId?: string) =>
  useTrainingsAdminControllerStudent(studentId ?? '', useQueryGate(!!studentId));

/** An enrollment's ledger entries */
export const useEnrollmentLedger = (enrollmentId: string) =>
  useTrainingsLedgerControllerList({ enrollmentId, take: 100 }, useQueryGate(!!enrollmentId));

export const useEnroll = () =>
  useTrainingsMutation((data: CreateTrainingEnrollmentDto) => trainingsAdminControllerEnroll(data));

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
  useTrainingsMutation(
    ({ attemptId, ...data }: { attemptId: string; marks: { trainingId: string; marks: number }[]; reason: string }) =>
      trainingsAdminControllerOverride(attemptId, data),
  );

/** Runs the auto-close and reminder job now */
export const useRunAutoClose = () => useTrainingsMutation(() => trainingsAdminControllerRunClock());
