/**
 * The training catalog, settings and testing windows (contract v3, "Admin routes").
 */
import {
  CreateTestingWindowDto,
  Gender,
  PayoutBandEntity,
  TestingWindowEntity,
  TrainingsConfigControllerListWindowsParams,
  UpdateTestingWindowDto,
} from '@/providers/service/app.schemas';
import {
  trainingsConfigControllerCloseWindow,
  trainingsConfigControllerCreateWindow,
  trainingsConfigControllerUpdateWindow,
  useTrainingsConfigControllerListWindows,
} from '@/providers/service/trainings/trainings';

import { cleanParams, request, useQueryGate, useTrainingsMutation, useTrainingsQuery } from './common';

export type Band = PayoutBandEntity;
export type TestingWindow = TestingWindowEntity;

// ---------------------------------------------------------------------------
// The training catalog (contract v3). Typed by hand until core's v3 OpenAPI export lands.

export const STEP_SKILLS = ['WAZU', 'NAMAZ'] as const;
/** Graded step by step with the results step codes */
export type StepSkill = (typeof STEP_SKILLS)[number];

/** A standalone training, required from an age (and optionally for one gender) */
export interface CatalogTraining {
  id: string;
  code: string;
  name: string;
  nameUr?: string | null;
  requiredFromAge: number;
  /** null: both genders */
  gender?: Gender | null;
  maxMarks: number;
  passMarks: number;
  payoutFloor: number;
  /** On the training's score %, highest first */
  bands: Band[];
  stepSkill?: StepSkill | null;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string | null;
}

export interface CatalogBody {
  code: string;
  name: string;
  nameUr?: string;
  requiredFromAge: number;
  gender?: Gender | null;
  maxMarks: number;
  passMarks: number;
  payoutFloor?: number;
  bands?: Band[];
  stepSkill?: StepSkill | null;
  sortOrder?: number;
}

export const useCatalog = () =>
  useTrainingsQuery<{ count: number; data: CatalogTraining[] }>('/trainings/catalog', {
    includeInActive: true,
    take: 100,
  });

export const useCatalogTraining = (id?: string) =>
  useTrainingsQuery<{ data: CatalogTraining }>(`/trainings/catalog/${id}`, {}, !!id);

export const useCreateCatalogTraining = () =>
  useTrainingsMutation((data: CatalogBody) => request<{ data: CatalogTraining }>('POST', '/trainings/catalog', data));

/** Edits only affect new enrollments */
export const useUpdateCatalogTraining = () =>
  useTrainingsMutation(({ id, data }: { id: string; data: CatalogBody }) =>
    request<{ data: CatalogTraining }>('PATCH', `/trainings/catalog/${id}`, data),
  );

export const useActivateCatalogTraining = () =>
  useTrainingsMutation(({ id }: { id: string }) => request('PATCH', `/trainings/catalog/${id}/activate`));

export const useDeactivateCatalogTraining = () =>
  useTrainingsMutation(({ id }: { id: string }) => request('DELETE', `/trainings/catalog/${id}/deactivate`));

/** One row for every training: attempts per session, auto-close and reminder days */
export interface TrainingSettings {
  maxAttempts: number;
  autoCloseDays: number;
  reminderDays: number[];
}

export const useTrainingSettings = () =>
  useTrainingsQuery<{ data?: TrainingSettings } & Partial<TrainingSettings>>('/trainings/settings');

export const useSaveTrainingSettings = () =>
  useTrainingsMutation((data: TrainingSettings) => request('PUT', '/trainings/settings', data));

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
