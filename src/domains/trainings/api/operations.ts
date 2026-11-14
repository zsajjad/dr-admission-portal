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
  useTrainingsLedgerControllerList,
} from '@/providers/service/trainings/trainings';

import { cleanParams, request, useQueryGate, useTrainingsMutation, useTrainingsQuery } from './common';
import { Band } from './setup';

export const ENROLLMENT_STATES = Object.values(TrainingEnrollmentState);
export type EnrollmentState = TrainingEnrollmentState;
export type ClosureReason = TrainingClosureReason;
export type PayoutStatus = TrainingPayoutStatus;

export type EnrollmentListItem = TrainingEnrollmentEntity;
/** v3: a RETRAIN decision names the trainings chosen for retraining */
export type Decision = DecisionEntity & { trainingIds?: string[] | null };

/** Within a session a training is done at 90% or more; below that it can be retrained, even if passed */
export const DONE_PCT = 90;

export type ItemProgress = 'DONE' | 'CAN_RETRAIN' | 'FAILED' | 'PENDING';

/** Where a training stands: done (90%+), passed but below 90%, failed, or not tested yet */
export function itemProgress(item: Pick<EnrollmentItem, 'status' | 'scorePct'>): ItemProgress {
  if (item.status === 'PENDING' || item.scorePct === null) return item.status === 'FAILED' ? 'FAILED' : 'PENDING';
  if (item.scorePct >= DONE_PCT) return 'DONE';
  return item.status === 'PASSED' ? 'CAN_RETRAIN' : 'FAILED';
}
export type Assignment = AssignmentEntity;

/**
 * A wrong or right step in a practical training (core feat/trainings-results, in progress).
 * Typed here until it's in the generated client.
 */
export interface MarkStep {
  stepCode: string;
  correct: boolean;
}
/** v3 moves score, band and pay onto each mark */
export type AttemptMark = AttemptMarkEntity & {
  steps?: MarkStep[] | null;
  scorePct?: number;
  band?: number;
  payout?: number;
};
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
  trainings: RuleTraining[];
}

/** A training in the snapshot; under v3 each carries its own floor and bands */
export interface RuleTraining {
  trainingId: string;
  code: string;
  name: string;
  nameUr: string | null;
  weightPct?: number;
  maxMarks: number;
  passMarks: number;
  payoutFloor?: number;
  bands?: Band[];
  stepSkill?: 'WAZU' | 'NAMAZ' | null;
  sortOrder: number;
}

/** v3: one row per required training in the enrollment */
export interface EnrollmentItem {
  trainingId: string;
  code?: string;
  name?: string;
  status: 'PENDING' | 'PASSED' | 'FAILED';
  attemptsUsed: number;
  bestAttemptNo: number | null;
  scorePct: number | null;
  payout: number | null;
}

export type EnrollmentDetail = Omit<TrainingEnrollmentDetailEntity, 'rules' | 'attempts' | 'decisions'> & {
  decisions: Decision[];
  rules: RulesSnapshot;
  attempts: Attempt[];
  /** v3 */
  items?: EnrollmentItem[];
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

/** A training the student must do now (v3) */
export interface RequiredTraining {
  trainingId?: string;
  id?: string;
  code: string;
  name: string;
}

/** A training passed for good, in any year (v3 student_training_pass) */
export interface TrainingPass {
  id: string;
  trainingId: string;
  code?: string;
  name?: string;
  passedAt: string;
  sessionId?: string | null;
  sessionName?: string | null;
  source: 'TRAINING' | 'ADMIN';
  enrollmentId?: string | null;
  reason?: string | null;
}

/** GET /trainings/students/:studentId and /trainings/required (v3) */
export interface StudentTrainings {
  age: number | null;
  required: RequiredTraining[];
  passed: TrainingPass[];
  enrollments: EnrollmentListItem[];
}

const unwrap = <T>(res: { data?: T } | T | undefined): T | undefined =>
  res && typeof res === 'object' && 'data' in res ? (res as { data?: T }).data : (res as T | undefined);

/** The student's age now, what's required, what's passed (any year) and every enrollment */
export function useStudentTrainings(studentId?: string) {
  const query = useTrainingsQuery<{ data?: StudentTrainings } | StudentTrainings>(
    `/trainings/students/${studentId}`,
    {},
    !!studentId,
  );
  return { ...query, student: unwrap<StudentTrainings>(query.data) };
}

/** POST /trainings/passes: a manual pass, e.g. from earlier records. It pays nobody. */
export const useAddPass = () =>
  useTrainingsMutation((data: { studentId: string; trainingId: string; reason: string }) =>
    request('POST', '/trainings/passes', data),
  );

/** POST /trainings/passes/:id/revoke: the training becomes required again */
export const useRevokePass = () =>
  useTrainingsMutation(({ id, reason }: { id: string; reason: string }) =>
    request('POST', `/trainings/passes/${id}/revoke`, { reason }),
  );

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
    ({
      attemptId,
      ...data
    }: {
      attemptId: string;
      marks: { trainingId: string; marks: number; steps?: MarkStep[] }[];
      reason: string;
    }) => trainingsAdminControllerOverride(attemptId, data),
  );

/** Runs the auto-close and reminder job now */
export const useRunAutoClose = () => useTrainingsMutation(() => trainingsAdminControllerRunClock());
