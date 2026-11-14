/**
 * The training catalog, settings and testing windows (contract v3, "Admin routes").
 */
import {
  CreateTestingWindowDto,
  CreateTrainingDto,
  PayoutBandEntity,
  TrainingEntity,
  TrainingEntityStepSkill,
  TrainingSettingsEntity,
  UpdateTrainingDto,
  TestingWindowEntity,
  TrainingsConfigControllerListWindowsParams,
  UpdateTestingWindowDto,
} from '@/providers/service/app.schemas';
import {
  trainingsConfigControllerActivate,
  trainingsConfigControllerCloseWindow,
  trainingsConfigControllerCreate,
  trainingsConfigControllerDeactivate,
  trainingsConfigControllerUpdate,
  trainingsConfigControllerUpdateSettings,
  useTrainingsConfigControllerGet,
  useTrainingsConfigControllerGetSettings,
  useTrainingsConfigControllerList,
  trainingsConfigControllerCreateWindow,
  trainingsConfigControllerUpdateWindow,
  useTrainingsConfigControllerListWindows,
} from '@/providers/service/trainings/trainings';

import { cleanParams, useQueryGate, useTrainingsMutation } from './common';

export type Band = PayoutBandEntity;
export type TestingWindow = TestingWindowEntity;

// ---------------------------------------------------------------------------
// The training catalog (contract v3)

export const STEP_SKILLS = Object.values(TrainingEntityStepSkill);
/** Graded step by step with the results step codes */
export type StepSkill = TrainingEntityStepSkill;
export type CatalogTraining = TrainingEntity;
export type CatalogBody = CreateTrainingDto;

export const useCatalog = () =>
  useTrainingsConfigControllerList({ includeInActive: true, take: 100, sortBy: 'sortOrder' }, useQueryGate());

export const useCatalogTraining = (id?: string) => useTrainingsConfigControllerGet(id ?? '', useQueryGate(!!id));

export const useCreateCatalogTraining = () =>
  useTrainingsMutation((data: CatalogBody) => trainingsConfigControllerCreate(data));

/** Edits only affect new enrollments */
export const useUpdateCatalogTraining = () =>
  useTrainingsMutation(({ id, data }: { id: string; data: UpdateTrainingDto }) =>
    trainingsConfigControllerUpdate(id, data),
  );

export const useActivateCatalogTraining = () =>
  useTrainingsMutation(({ id }: { id: string }) => trainingsConfigControllerActivate(id));

export const useDeactivateCatalogTraining = () =>
  useTrainingsMutation(({ id }: { id: string }) => trainingsConfigControllerDeactivate(id));

/** One row for every training: attempts per session, the retrain-below %, auto-close and reminder days */
export type TrainingSettings = Omit<TrainingSettingsEntity, 'updatedAt'>;

export const useTrainingSettings = () => useTrainingsConfigControllerGetSettings(useQueryGate());

export const useSaveTrainingSettings = () =>
  useTrainingsMutation((data: TrainingSettings) => trainingsConfigControllerUpdateSettings(data));

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
