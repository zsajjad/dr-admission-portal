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
  RecordAdjustmentDto,
  RecordPaymentDto,
  TrainerLedgerEntryEntity,
  TrainerLedgerKind,
  TrainerLedgerStatus,
  TrainerLedgerSummaryEntity,
  TrainingsLedgerControllerListParams,
} from '@/providers/service/app.schemas';
import {
  trainingsLedgerControllerAdjustment,
  trainingsLedgerControllerApprove,
  trainingsLedgerControllerList,
  trainingsLedgerControllerPayment,
  trainingsLedgerControllerVoid,
  useTrainingsLedgerControllerList,
  useTrainingsLedgerControllerTrainers,
} from '@/providers/service/trainings/trainings';

import service from '@/services';

import { cleanParams, request, useQueryGate, useTrainingsMutation } from './common';

/** v3 adds the training to each entry; typed here until the client is regenerated */
export type LedgerEntry = Omit<TrainerLedgerEntryEntity, 'kind'> & {
  kind: LedgerKind;
  trainingId?: string | null;
  training?: { id: string; code: string; name: string } | null;
  /** ADHOC entries */
  title?: string | null;
};
/** ADHOC: an ad hoc credit (an allowance, a bonus), typed here until the client is regenerated */
export type LedgerKind = TrainerLedgerKind | 'ADHOC';
export type LedgerStatus = TrainerLedgerStatus;
export type TrainerTotals = TrainerLedgerSummaryEntity;
export type LedgerFilters = TrainingsLedgerControllerListParams;

export const LEDGER_KINDS: LedgerKind[] = [...Object.values(TrainerLedgerKind), 'ADHOC'];
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

export interface AdhocBody {
  trainerStaffUserId: string;
  /** Whole rupees, above 0 */
  amount: number;
  title: string;
  /** ISO date */
  date: string;
  reference?: string;
  note?: string;
}

/** POST /trainings/ledger/adhoc: approved when made, adds to the balance due */
export const useAddAdhoc = () =>
  useTrainingsMutation((data: AdhocBody) => request('POST', '/trainings/ledger/adhoc', data));

export const useVoidEntry = () =>
  useTrainingsMutation(({ id, reason }: { id: string; reason: string }) =>
    trainingsLedgerControllerVoid(id, { reason }),
  );
