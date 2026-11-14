/**
 * Rechecks (core #41, trainings contract "Retest every session"). Each session every training the
 * student's age requires is due again. One passed in an earlier session is a recheck: a tester grades
 * it directly. A failed recheck is trained this session, so the office registers the student with a
 * trainer when they aren't in an open enrollment (`awaitingTraining`).
 */
import {
  OverrideRecheckDto,
  RecheckEntity,
  RecheckGroupDto,
  RecheckReportDto,
  SessionTrainingEntity,
  TrainingRecheckRowEntity,
  TrainingRoute,
  TrainingsAdminControllerRechecksParams,
} from '@/providers/service/app.schemas';
import {
  trainingsAdminControllerOverrideRecheck,
  useTrainingsAdminControllerRechecks,
} from '@/providers/service/trainings/trainings';

import { cleanParams, useQueryGate, useTrainingsMutation } from './common';

export type { RecheckGroupDto, RecheckReportDto };

/** TRAIN: never passed, trained first. RECHECK: passed in an earlier session, graded by a tester directly. */
export type Route = TrainingRoute;
export type Recheck = RecheckEntity;
export type RecheckRow = TrainingRecheckRowEntity;
/** A training due this session, with its route and where it stands */
export type SessionTraining = SessionTrainingEntity;

export type RecheckFilters = TrainingsAdminControllerRechecksParams;

/** The API pages rechecks at most 100 at a time */
export const RECHECKS_PAGE_SIZES = [20, 50, 100];

export const useRechecks = (params: RecheckFilters, enabled = true) =>
  useTrainingsAdminControllerRechecks(cleanParams(params), useQueryGate(enabled));

/**
 * Change a recheck's marks, with a reason. The session's pass follows; a recheck that now fails is
 * trained this session (it joins the student's open enrollment, or waits for a trainer).
 */
export const useOverrideRecheck = () =>
  useTrainingsMutation(({ id, ...data }: OverrideRecheckDto & { id: string }) =>
    trainingsAdminControllerOverrideRecheck(id, data),
  );
