/**
 * The six trainings reports (contract v3: results, trainings and trainers per training).
 * Every report takes the same filters and an optional groupBy (gender, area or branch).
 */
import {
  PayoutReportDto,
  PipelineReportDto,
  TrainingResultRowDto,
  TesterReportDto,
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

export type ReportFilters = TrainingsAdminControllerPipelineParams;

export type ResultsRow = TrainingResultRowDto & { group: string; label?: string };

export type { PayoutReportDto, PipelineReportDto, TesterReportDto, TrainingLevelReportDto };

// Each hook runs only while its report is shown
export const usePipelineReport = (p: ReportFilters, on: boolean) =>
  useTrainingsAdminControllerPipeline(cleanParams(p), useQueryGate(on));
export const useResultsReport = (p: ReportFilters, on: boolean) =>
  useTrainingsAdminControllerResults(cleanParams(p), useQueryGate(on));
export const useTrainingsReport = (p: ReportFilters, on: boolean) =>
  useTrainingsAdminControllerTrainings(cleanParams(p), useQueryGate(on));
export const useTrainersReport = (p: ReportFilters, on: boolean) =>
  useTrainingsAdminControllerTrainers(cleanParams(p), useQueryGate(on));
export const useTestersReport = (p: ReportFilters, on: boolean) =>
  useTrainingsAdminControllerTesters(cleanParams(p), useQueryGate(on));
export const usePayoutsReport = (p: ReportFilters, on: boolean) =>
  useTrainingsLedgerControllerPayouts(cleanParams(p), useQueryGate(on));
