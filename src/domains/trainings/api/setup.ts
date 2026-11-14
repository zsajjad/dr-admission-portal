/**
 * Courses, the age matrix and testing windows (contract v2, "Admin routes").
 */
import {
  CreateTestingWindowDto,
  CreateTrainingCourseDto,
  PayoutBandEntity,
  ReplaceAgeRulesDto,
  StudentTrainingsDto,
  TestingWindowEntity,
  TrainingAgeRuleEntity,
  TrainingCourseEntity,
  TrainingEntity,
  TrainingsConfigControllerListWindowsParams,
  UpdateTestingWindowDto,
} from '@/providers/service/app.schemas';
import {
  trainingsConfigControllerActivateCourse,
  trainingsConfigControllerCloseWindow,
  trainingsConfigControllerCreateCourse,
  trainingsConfigControllerCreateWindow,
  trainingsConfigControllerDeactivateCourse,
  trainingsConfigControllerReplaceAgeRules,
  trainingsConfigControllerUpdateCourse,
  trainingsConfigControllerUpdateWindow,
  useTrainingsAdminControllerResolve,
  useTrainingsConfigControllerGetCourse,
  useTrainingsConfigControllerListAgeRules,
  useTrainingsConfigControllerListCourses,
  useTrainingsConfigControllerListWindows,
} from '@/providers/service/trainings/trainings';

import { cleanParams, useQueryGate, useTrainingsMutation } from './common';

export type Band = PayoutBandEntity;
export type Training = TrainingEntity;
export type TrainingCourse = TrainingCourseEntity;
export type CourseBody = CreateTrainingCourseDto;
export type AgeRule = TrainingAgeRuleEntity;
export type TestingWindow = TestingWindowEntity;
export type ResolvedCourse = StudentTrainingsDto;

// ---------------------------------------------------------------------------
// Courses

/** Every course, inactive ones included */
export const useCourses = () =>
  useTrainingsConfigControllerListCourses<{ count: number; data: TrainingCourse[] }>(
    { includeInActive: true, take: 100 },
    useQueryGate(),
  );

export const useCourse = (id?: string) =>
  useTrainingsConfigControllerGetCourse<{ data: TrainingCourse }>(id ?? '', useQueryGate(!!id));

export const useCreateCourse = () =>
  useTrainingsMutation((data: CourseBody) => trainingsConfigControllerCreateCourse(data));

export const useUpdateCourse = () =>
  useTrainingsMutation(({ id, data }: { id: string; data: CourseBody }) =>
    trainingsConfigControllerUpdateCourse(id, data),
  );

export const useActivateCourse = () =>
  useTrainingsMutation(({ id }: { id: string }) => trainingsConfigControllerActivateCourse(id));

export const useDeactivateCourse = () =>
  useTrainingsMutation(({ id }: { id: string }) => trainingsConfigControllerDeactivateCourse(id));

// ---------------------------------------------------------------------------
// The age matrix

export const useAgeRules = () => useTrainingsConfigControllerListAgeRules(useQueryGate());

/** PUT replaces the matrix; overlaps are refused */
export const useReplaceAgeRules = () =>
  useTrainingsMutation((data: ReplaceAgeRulesDto) => trainingsConfigControllerReplaceAgeRules(data));

/** The course the matrix gives a student now, their completed courses and enrollments */
export const useResolveCourse = (studentId?: string) =>
  useTrainingsAdminControllerResolve({ studentId: studentId ?? '' }, useQueryGate(!!studentId));

// ---------------------------------------------------------------------------
// Testing windows

export const useWindows = (params: TrainingsConfigControllerListWindowsParams) =>
  useTrainingsConfigControllerListWindows(cleanParams(params), useQueryGate(!!params.sessionId));

export const useCreateWindow = () =>
  useTrainingsMutation((data: CreateTestingWindowDto) => trainingsConfigControllerCreateWindow(data));

/** PATCH replaces the tester list */
export const useUpdateWindow = () =>
  useTrainingsMutation(({ id, data }: { id: string; data: UpdateTestingWindowDto }) =>
    trainingsConfigControllerUpdateWindow(id, data),
  );

export const useCloseWindow = () =>
  useTrainingsMutation(({ id }: { id: string }) => trainingsConfigControllerCloseWindow(id, {}));

/** A window's state at a moment: scheduled, open, closed, or closed early */
export function windowStatus(
  window: Pick<TestingWindow, 'opensAt' | 'closesAt' | 'closedAt'>,
  now = new Date(),
): 'SCHEDULED' | 'OPEN' | 'CLOSED' | 'CLOSED_EARLY' {
  const closesAt = new Date(window.closesAt);
  const closedEarly = !!window.closedAt && new Date(window.closedAt) < closesAt;
  const end = closedEarly ? new Date(window.closedAt as string) : closesAt;
  if (end <= now) return closedEarly ? 'CLOSED_EARLY' : 'CLOSED';
  if (new Date(window.opensAt) > now) return 'SCHEDULED';
  return 'OPEN';
}
