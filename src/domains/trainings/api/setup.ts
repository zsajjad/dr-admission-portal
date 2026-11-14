/**
 * Courses, the age matrix and testing windows (contract v2, "Admin routes").
 */
import {
  DetailResponse,
  Gender,
  ListResponse,
  QueryParams,
  StaffRef,
  trainingsKeys,
  useTrainingsMutation,
  useTrainingsQuery,
} from './common';

// ---------------------------------------------------------------------------
// Courses

export interface Band {
  minPct: number;
  amount: number;
}

export interface Training {
  id: string;
  code: string;
  name: string;
  nameUr?: string | null;
  weightPct: number;
  maxMarks: number;
  passMarks: number;
  sortOrder: number;
  isActive: boolean;
}

export interface TrainingCourse {
  id: string;
  code: string;
  name: string;
  nameUr?: string | null;
  retrainThresholdPct: number;
  maxAttempts: number;
  autoCloseDays: number;
  reminderDays: number[];
  payoutFloor: number;
  bands: Band[];
  isActive: boolean;
  /** Active trainings first, in sortOrder; deactivated ones are kept for history */
  trainings: Training[];
  createdAt?: string;
  updatedAt?: string | null;
}

export interface CourseTrainingBody {
  id?: string;
  code: string;
  name: string;
  nameUr?: string;
  weightPct: number;
  maxMarks: number;
  passMarks: number;
  sortOrder?: number;
}

export interface CourseBody {
  code: string;
  name: string;
  nameUr?: string;
  retrainThresholdPct?: number;
  maxAttempts?: number;
  autoCloseDays?: number;
  reminderDays?: number[];
  payoutFloor?: number;
  bands?: Band[];
  /** A training left out of the list is deactivated */
  trainings: CourseTrainingBody[];
}

/** GET /trainings/courses (assumed `{ count, data }`; inactive courses included) */
export const useCourses = () =>
  useTrainingsQuery<ListResponse<TrainingCourse>>(trainingsKeys.courses(), '/trainings/courses', {
    includeInActive: true,
  });

export const useCourse = (id?: string) =>
  useTrainingsQuery<DetailResponse<TrainingCourse>>(
    trainingsKeys.course(id ?? ''),
    `/trainings/courses/${id}`,
    {},
    {
      enabled: !!id,
    },
  );

export const useCreateCourse = () =>
  useTrainingsMutation<CourseBody, DetailResponse<TrainingCourse>>((data) => ({
    url: '/trainings/courses',
    method: 'POST',
    data,
  }));

export const useUpdateCourse = () =>
  useTrainingsMutation<{ id: string; data: CourseBody }, DetailResponse<TrainingCourse>>(({ id, data }) => ({
    url: `/trainings/courses/${id}`,
    method: 'PATCH',
    data,
  }));

export const useActivateCourse = () =>
  useTrainingsMutation<{ id: string }>(({ id }) => ({ url: `/trainings/courses/${id}/activate`, method: 'PATCH' }));

export const useDeactivateCourse = () =>
  useTrainingsMutation<{ id: string }>(({ id }) => ({ url: `/trainings/courses/${id}/deactivate`, method: 'DELETE' }));

// ---------------------------------------------------------------------------
// The age matrix

export interface AgeRule {
  id?: string;
  minAge: number;
  maxAge: number;
  /** null: both genders */
  gender: Gender | null;
  courseId: string;
  course?: Pick<TrainingCourse, 'id' | 'code' | 'name' | 'isActive'>;
}

export interface AgeRulesBody {
  rules: { minAge: number; maxAge: number; gender?: Gender | null; courseId: string }[];
}

/** GET /trainings/age-rules (assumed `{ data: AgeRule[] }`) */
export const useAgeRules = () =>
  useTrainingsQuery<{ data: AgeRule[] }>(trainingsKeys.ageRules(), '/trainings/age-rules');

/** PUT /trainings/age-rules replaces the matrix; overlaps are refused */
export const useReplaceAgeRules = () =>
  useTrainingsMutation<AgeRulesBody, { data: AgeRule[] }>((data) => ({
    url: '/trainings/age-rules',
    method: 'PUT',
    data,
  }));

/** GET /trainings/age-rules/resolve?studentId= (assumed shape) */
export interface ResolvedCourse {
  studentId: string;
  /** Age by the age-at-admission rule, from the current session's admission */
  age: number | null;
  gender: Gender;
  course: Pick<TrainingCourse, 'id' | 'code' | 'name'> | null;
  completedCourses: {
    enrollmentId: string;
    courseId: string;
    courseName: string;
    sessionName: string;
    closedAt: string;
    closureReason: string;
    passed: boolean;
    bestPct: number | null;
  }[];
}

export const useResolveCourse = (studentId?: string) =>
  useTrainingsQuery<DetailResponse<ResolvedCourse>>(
    trainingsKeys.resolve(studentId ?? ''),
    '/trainings/age-rules/resolve',
    { studentId },
    { enabled: !!studentId },
  );

// ---------------------------------------------------------------------------
// Testing windows

export interface TestingWindow {
  id: string;
  sessionId: string;
  session?: { id: string; name: string };
  name: string;
  /** null: every branch */
  branchId: string | null;
  branch?: { id: string; code: string; name: string } | null;
  opensAt: string;
  closesAt: string;
  /** Closed early by an admin */
  closedAt: string | null;
  /** Empty: every tester */
  testers: StaffRef[];
  /** Grades submitted in this window (assumed) */
  gradedCount?: number;
}

export interface WindowBody {
  sessionId: string;
  name: string;
  branchId?: string | null;
  opensAt?: string;
  closesAt: string;
  testerStaffUserIds?: string[];
}

export const useWindows = (params: QueryParams) =>
  useTrainingsQuery<ListResponse<TestingWindow>>(trainingsKeys.windows(params), '/trainings/windows', params, {
    enabled: !!params.sessionId,
  });

export const useCreateWindow = () =>
  useTrainingsMutation<WindowBody, DetailResponse<TestingWindow>>((data) => ({
    url: '/trainings/windows',
    method: 'POST',
    data,
  }));

export const useUpdateWindow = () =>
  useTrainingsMutation<{ id: string; data: Partial<WindowBody> }, DetailResponse<TestingWindow>>(({ id, data }) => ({
    url: `/trainings/windows/${id}`,
    method: 'PATCH',
    data,
  }));

export const useCloseWindow = () =>
  useTrainingsMutation<{ id: string }, DetailResponse<TestingWindow>>(({ id }) => ({
    url: `/trainings/windows/${id}/close`,
    method: 'POST',
  }));

/** A window's state at a moment: scheduled, open, closed, or closed early */
export function windowStatus(
  window: TestingWindow,
  now = new Date(),
): 'SCHEDULED' | 'OPEN' | 'CLOSED' | 'CLOSED_EARLY' {
  const closesAt = new Date(window.closesAt);
  const closedEarly = !!window.closedAt && new Date(window.closedAt) < closesAt;
  const end = closedEarly ? new Date(window.closedAt as string) : closesAt;
  if (end <= now) return closedEarly ? 'CLOSED_EARLY' : 'CLOSED';
  if (new Date(window.opensAt) > now) return 'SCHEDULED';
  return 'OPEN';
}
