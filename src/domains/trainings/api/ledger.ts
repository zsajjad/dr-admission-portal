/**
 * The trainers' earnings ledger (contract v2 "Ledger"; v3 adds the training to each entry).
 *
 * - Pending is the projected payout of an open enrollment: shown, but not an entry.
 * - Closing an enrollment adds a PAYOUT entry per training, PAYABLE until an admin approves it.
 * - Payments are their own entries, applied to approved credits oldest first (PART_PAID, PAID).
 * - Balance due = approved credits − payments. A payment above what's due is refused.
 * - Only payments and adjustments can be voided; a payout is corrected with an adjustment.
 */
import {
  RecordAdhocDto,
  RecordAdjustmentDto,
  RecordPaymentDto,
  TrainerLedgerEntryEntity,
  TrainerLedgerKind,
  TrainerLedgerStatus,
  TrainerLedgerSummaryEntity,
  TrainingsLedgerControllerListParams,
} from '@/providers/service/app.schemas';
import {
  trainingsLedgerControllerAdhoc,
  trainingsLedgerControllerAdjustment,
  trainingsLedgerControllerApprove,
  trainingsLedgerControllerList,
  trainingsLedgerControllerPayment,
  trainingsLedgerControllerVoid,
  useTrainingsLedgerControllerList,
  useTrainingsLedgerControllerTrainers,
} from '@/providers/service/trainings/trainings';

import service from '@/services';

import { cleanParams, useQueryGate, useTrainingsMutation } from './common';

/** An entry; PAYOUTs name their training and whether it was REQUIRED or an IMPROVEMENT */
export type LedgerEntry = TrainerLedgerEntryEntity;
/** ADHOC: an ad hoc credit, such as an allowance or a bonus */
export type LedgerKind = TrainerLedgerKind;
export type LedgerStatus = TrainerLedgerStatus;
export type TrainerTotals = TrainerLedgerSummaryEntity;
export type LedgerFilters = TrainingsLedgerControllerListParams;

export const LEDGER_KINDS = Object.values(TrainerLedgerKind);
export const LEDGER_STATUSES = Object.values(TrainerLedgerStatus);

export const useLedger = (params: LedgerFilters) =>
  useTrainingsLedgerControllerList<{ count: number; data: LedgerEntry[] }>(cleanParams(params), useQueryGate());

export const useLedgerTrainers = (params: { from?: string; to?: string }) =>
  useTrainingsLedgerControllerTrainers(cleanParams(params), useQueryGate());

/** GET /trainings/ledger/export: the entries as CSV, with the same filters (the generated client expects JSON) */
export const exportLedger = (params: LedgerFilters) =>
  service<Response>({
    url: '/trainings/ledger/export',
    method: 'GET',
    params: cleanParams({ ...params, skip: undefined, take: undefined }),
    responseType: 'blob',
  });

/** Every PAYABLE entry's ID for a trainer, to approve them all at once (pages of 100, the API's limit) */
export async function payableEntryIds(trainerStaffUserId: string): Promise<string[]> {
  const ids: string[] = [];
  for (let skip = 0; ; skip += 100) {
    const res = await trainingsLedgerControllerList({ trainerStaffUserId, status: 'PAYABLE', skip, take: 100 });
    ids.push(...res.data.map((e) => e.id));
    if (res.data.length < 100) return ids;
  }
}

export const useApproveEntries = () =>
  useTrainingsMutation(({ entryIds }: { entryIds: string[] }) => trainingsLedgerControllerApprove({ entryIds }));

export const useRecordPayment = () =>
  useTrainingsMutation((data: RecordPaymentDto) => trainingsLedgerControllerPayment(data));

export const useAddAdjustment = () =>
  useTrainingsMutation((data: RecordAdjustmentDto) => trainingsLedgerControllerAdjustment(data));

export type AdhocBody = RecordAdhocDto;

/** POST /trainings/ledger/adhoc: approved when made, adds to the balance due */
export const useAddAdhoc = () => useTrainingsMutation((data: AdhocBody) => trainingsLedgerControllerAdhoc(data));

export const useVoidEntry = () =>
  useTrainingsMutation(({ id, reason }: { id: string; reason: string }) =>
    trainingsLedgerControllerVoid(id, { reason }),
  );
