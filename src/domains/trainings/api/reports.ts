/**
 * The six trainings reports (contract v2, with v3's per-training rows and `trainingId` filter).
 * Every report takes the same filters and an optional groupBy (gender, area or branch).
 */
import {
  PayoutReportDto,
  PipelineReportDto,
  ResultsGroupDto,
  TesterReportDto,
  TrainerRowDto,
  TrainingLevelReportDto,
  TrainingsAdminControllerPipelineParams,
} from '@/providers/service/app.schemas';
import {
  useTrainingsAdminControllerPipeline,
  useTrainingsAdminControllerResults,
  useTrainingsAdminControllerTesters,
  useTrainingsAdminControllerTrainers,
  useTrainingsAdminControllerTrainings,
  useTrainingsLedgerControllerPayouts,
} from '@/providers/service/trainings/trainings';

import { cleanParams, useQueryGate } from './common';

export const REPORTS = ['pipeline', 'results', 'trainings', 'trainers', 'testers', 'payouts'] as const;
export type ReportName = (typeof REPORTS)[number];

/** v3 adds trainingId (and drops courseId) */
export type ReportFilters = TrainingsAdminControllerPipelineParams & { trainingId?: string };

/** A training a v3 row is about */
export interface TrainingRef {
  trainingId?: string;
  code?: string;
  name?: string;
}

/** Results per group; under v3 also per training */
export type ResultsRow = Omit<ResultsGroupDto, 'group' | 'label'> & TrainingRef;
export interface ResultsReport {
  groups: (ResultsGroupDto & { trainings?: ResultsRow[] })[];
}

/** Trainers per group; under v3 rows may name a training */
export type TrainerRow = TrainerRowDto & TrainingRef;
export interface TrainersReport {
  groups: { group: string; label?: string; trainers: TrainerRow[] }[];
}

export type { PayoutReportDto, PipelineReportDto, TesterReportDto, TrainingLevelReportDto };

// Each hook runs only while its report is shown
export const usePipelineReport = (p: ReportFilters, on: boolean) =>
  useTrainingsAdminControllerPipeline(cleanParams(p), useQueryGate(on));
export const useResultsReport = (p: ReportFilters, on: boolean) =>
  useTrainingsAdminControllerResults<ResultsReport>(cleanParams(p), useQueryGate(on));
export const useTrainingsReport = (p: ReportFilters, on: boolean) =>
  useTrainingsAdminControllerTrainings(cleanParams(p), useQueryGate(on));
export const useTrainersReport = (p: ReportFilters, on: boolean) =>
  useTrainingsAdminControllerTrainers<TrainersReport>(cleanParams(p), useQueryGate(on));
export const useTestersReport = (p: ReportFilters, on: boolean) =>
  useTrainingsAdminControllerTesters(cleanParams(p), useQueryGate(on));
export const usePayoutsReport = (p: ReportFilters, on: boolean) =>
  useTrainingsLedgerControllerPayouts(cleanParams(p), useQueryGate(on));
