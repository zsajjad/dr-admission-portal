/**
 * Enrollments, assignments, closing, reopening and grade overrides (contract v2, "Admin routes").
 */
import {
  ActorRef,
  DetailResponse,
  Gender,
  ListResponse,
  QueryParams,
  StaffRef,
  trainingsKeys,
  useTrainingsMutation,
  useTrainingsQuery,
} from './common';
import { Band } from './setup';

export const ENROLLMENT_STATES = ['REGISTERED', 'IN_TRAINING', 'READY_FOR_TEST', 'TESTED', 'CLOSED'] as const;
export type EnrollmentState = (typeof ENROLLMENT_STATES)[number];

export const CLOSURE_REASONS = ['PASSED', 'TRAINER_CLOSED', 'ATTEMPTS_USED', 'AUTO_CLOSED', 'ADMIN_CLOSED'] as const;
export type ClosureReason = (typeof CLOSURE_REASONS)[number];

export interface EnrollmentStudent {
  id: string;
  grNumber: string;
  name: string;
  fatherName: string;
  gender: Gender;
  classLevelCode?: string | null;
  branch?: { id: string; code: string; name: string } | null;
  area?: { id: string; name: string } | null;
}

/** A row of GET /trainings/enrollments (assumed shape) */
export interface EnrollmentListItem {
  id: string;
  student: EnrollmentStudent;
  course: { id: string; code: string; name: string };
  /** History only: the session, admission and age when enrolled */
  session: { id: string; name: string };
  ageAtEnrollment: number | null;
  trainer: StaffRef | null;
  /** The tester assigned for the next attempt, if any */
  tester: StaffRef | null;
  state: EnrollmentState;
  round: number;
  attemptsUsed: number;
  maxAttempts: number;
  bestPct: number | null;
  /** While open: the payout from the best attempt so far (pending, not a ledger entry) */
  projectedPayout: number | null;
  /** Once closed: the payout fixed at closure */
  payoutAmount: number | null;
  autoCloseAt: string | null;
  /** The last change of state, progress or decision; "stuck" counts from here */
  lastActivityAt: string;
  closedAt: string | null;
  closureReason: ClosureReason | null;
  passed: boolean | null;
  createdAt: string;
}

/** The course and its trainings as they were at enrollment */
export interface RulesSnapshot {
  courseId: string;
  code: string;
  name: string;
  retrainThresholdPct: number;
  maxAttempts: number;
  autoCloseDays: number;
  reminderDays: number[];
  payoutFloor: number;
  bands: Band[];
  trainings: {
    id: string;
    code: string;
    name: string;
    nameUr?: string | null;
    weightPct: number;
    maxMarks: number;
    passMarks: number;
    sortOrder: number;
  }[];
}

export interface ProgressItem {
  round: number;
  trainingId: string;
  completed: boolean;
  completedAt: string | null;
}

export interface AttemptMark {
  trainingId: string;
  marks: number;
  passed: boolean;
  /** The tester's mark, when an admin changed it */
  originalMarks?: number | null;
}

export interface Attempt {
  id: string;
  attemptNo: number;
  tester: StaffRef | null;
  window: { id: string; name: string } | null;
  /** When the tester graded, by the phone's clock */
  clientTime: string;
  /** When the grade reached the server */
  receivedAt: string;
  weightedPct: number;
  passedCount: number;
  totalCount: number;
  allPassed: boolean;
  band: number;
  payout: number;
  /** A sync reasonCode when the grade was flagged, e.g. LATE_GRADE or SENT_AFTER_LOGOUT */
  flag: string | null;
  marks: AttemptMark[];
  override: { by: ActorRef; at: string; reason: string } | null;
}

export type DecisionKind = 'RETRAIN' | 'CLOSE' | 'AUTO_CLOSE' | 'ADMIN_CLOSE' | 'REOPEN';

export interface Decision {
  id: string;
  kind: DecisionKind;
  attemptNo: number | null;
  by: ActorRef;
  clientTime: string | null;
  createdAt: string;
  reason: string | null;
}

export interface Assignment {
  id: string;
  from: StaffRef | null;
  to: StaffRef | null;
  by: ActorRef;
  reason: string | null;
  createdAt: string;
}

export type LedgerKind = 'PAYOUT' | 'ADJUSTMENT' | 'PAYMENT';
/** CANCELLED: an unapproved entry cancelled by a reopen or override; VOID: voided by an admin (assumed names) */
export type LedgerStatus = 'PAYABLE' | 'APPROVED' | 'PART_PAID' | 'PAID' | 'CANCELLED' | 'VOID';

export interface LedgerEntry {
  id: string;
  kind: LedgerKind;
  trainer: StaffRef;
  /** Whole rupees; adjustments can be negative */
  amount: number;
  status: LedgerStatus;
  /** How much of a credit payments cover so far */
  paidAmount: number;
  enrollmentId: string | null;
  student: { id?: string; grNumber: string; name: string } | null;
  reason: string | null;
  /** Payments only */
  reference?: string | null;
  paidAt?: string | null;
  note?: string | null;
  createdAt: string;
  createdBy?: ActorRef | null;
  approvedAt: string | null;
  approvedBy?: ActorRef | null;
  voidedAt?: string | null;
  voidReason?: string | null;
}

/** GET /trainings/enrollments/:id: everything about one enrollment */
export interface EnrollmentDetail extends EnrollmentListItem {
  admissionId: string | null;
  rules: RulesSnapshot;
  progress: ProgressItem[];
  attempts: Attempt[];
  bestAttemptId: string | null;
  decisions: Decision[];
  assignments: Assignment[];
  ledgerEntries: LedgerEntry[];
}

export interface EnrollmentFilters extends QueryParams {
  sessionId?: string;
  state?: EnrollmentState;
  courseId?: string;
  /** Staff user IDs */
  trainer?: string;
  tester?: string;
  branchId?: string;
  areaId?: string;
  gender?: Gender;
  /** GR or name */
  q?: string;
  /** Open enrollments with no activity for this many days */
  stuckDays?: number;
  skip?: number;
  take?: number;
}

export const useEnrollments = (params: EnrollmentFilters) =>
  useTrainingsQuery<ListResponse<EnrollmentListItem>>(
    trainingsKeys.enrollments(params),
    '/trainings/enrollments',
    params,
  );

export const useEnrollment = (id?: string) =>
  useTrainingsQuery<DetailResponse<EnrollmentDetail>>(
    trainingsKeys.enrollment(id ?? ''),
    `/trainings/enrollments/${id}`,
    {},
    {
      enabled: !!id,
    },
  );

/** GET /trainings/students/:studentId: the student's enrollments in every year, newest first */
export const useStudentTrainings = (studentId?: string) =>
  useTrainingsQuery<{ data: EnrollmentDetail[] }>(
    trainingsKeys.student(studentId ?? ''),
    `/trainings/students/${studentId}`,
    {},
    {
      enabled: !!studentId,
    },
  );

export interface EnrollBody {
  grNumber?: string;
  studentId?: string;
  /** From the age matrix unless given */
  courseId?: string;
  trainerStaffUserId?: string;
  /** Needed to enroll again in a course the student has closed */
  reason?: string;
}

export const useEnroll = () =>
  useTrainingsMutation<EnrollBody, DetailResponse<EnrollmentListItem>>((data) => ({
    url: '/trainings/enrollments',
    method: 'POST',
    data,
  }));

export const useReassignTrainer = () =>
  useTrainingsMutation<{ id: string; trainerStaffUserId: string | null; reason: string }>(({ id, ...data }) => ({
    url: `/trainings/enrollments/${id}/trainer`,
    method: 'PUT',
    data,
  }));

export const useAssignTester = () =>
  useTrainingsMutation<{ id: string; testerStaffUserId: string | null }>(({ id, ...data }) => ({
    url: `/trainings/enrollments/${id}/tester`,
    method: 'PUT',
    data,
  }));

export const useCloseEnrollment = () =>
  useTrainingsMutation<{ id: string; reason: string }>(({ id, ...data }) => ({
    url: `/trainings/enrollments/${id}/close`,
    method: 'POST',
    data,
  }));

export const useReopenEnrollment = () =>
  useTrainingsMutation<{ id: string; reason: string }>(({ id, ...data }) => ({
    url: `/trainings/enrollments/${id}/reopen`,
    method: 'POST',
    data,
  }));

export const useOverrideMarks = () =>
  useTrainingsMutation<{ attemptId: string; marks: { trainingId: string; marks: number }[]; reason: string }>(
    ({ attemptId, ...data }) => ({ url: `/trainings/attempts/${attemptId}/marks`, method: 'PUT', data }),
  );

/** POST /trainings/jobs/auto-close: runs the auto-close and reminder job now */
export const useRunAutoClose = () =>
  useTrainingsMutation<void, { closed: number; reminded: number }>(() => ({
    url: '/trainings/jobs/auto-close',
    method: 'POST',
  }));
