/**
 * The trainers' earnings ledger (contract v2, "Ledger").
 *
 * - Pending is the projected payout of an open enrollment: shown, but not an entry.
 * - Closing an enrollment adds a PAYOUT entry, PAYABLE until an admin approves it.
 * - Payments are their own entries, applied to approved credits oldest first (PART_PAID, PAID).
 * - Balance due = approved credits − payments.
 */
import service from '@/services';

import {
  cleanParams,
  ListResponse,
  QueryParams,
  StaffRef,
  trainingsKeys,
  useTrainingsMutation,
  useTrainingsQuery,
} from './common';
import { LedgerEntry, LedgerKind, LedgerStatus } from './operations';

export type { LedgerEntry, LedgerKind, LedgerStatus };

export const LEDGER_KINDS: LedgerKind[] = ['PAYOUT', 'ADJUSTMENT', 'PAYMENT'];
export const LEDGER_STATUSES: LedgerStatus[] = ['PAYABLE', 'APPROVED', 'PART_PAID', 'PAID', 'CANCELLED', 'VOID'];

export interface LedgerFilters extends QueryParams {
  /** Staff user ID */
  trainer?: string;
  kind?: LedgerKind;
  status?: LedgerStatus;
  /** Dates, yyyy-mm-dd */
  from?: string;
  to?: string;
  skip?: number;
  take?: number;
}

/** A row of GET /trainings/ledger/trainers (assumed: the staff app's ledger totals, per trainer) */
export interface TrainerTotals {
  trainer: StaffRef;
  /** Open enrollments' projected payouts; not entries */
  projected: number;
  /** PAYABLE entries */
  awaitingApproval: number;
  /** Approved credits (payouts and adjustments) */
  approved: number;
  /** Payments */
  paid: number;
  /** approved − paid */
  due: number;
}

export const useLedger = (params: LedgerFilters) =>
  useTrainingsQuery<ListResponse<LedgerEntry>>(trainingsKeys.ledger(params), '/trainings/ledger', params);

export const useLedgerTrainers = (params: Pick<LedgerFilters, 'trainer' | 'from' | 'to'>) =>
  useTrainingsQuery<{ data: TrainerTotals[] }>(
    trainingsKeys.ledgerTrainers(params),
    '/trainings/ledger/trainers',
    params,
  );

/** GET /trainings/ledger/export: the entries as CSV, with the same filters */
export const exportLedger = (params: LedgerFilters) =>
  service<Response>({
    url: '/trainings/ledger/export',
    method: 'GET',
    params: cleanParams({ ...params, skip: undefined, take: undefined }),
    responseType: 'blob',
  });

/** Every PAYABLE entry's ID for a trainer, to approve them all at once */
export async function payableEntryIds(trainer: string): Promise<string[]> {
  const res = await service<ListResponse<LedgerEntry>>({
    url: '/trainings/ledger',
    method: 'GET',
    params: { trainer, status: 'PAYABLE', take: 1000 },
  });
  return res.data.map((e) => e.id);
}

export const useApproveEntries = () =>
  useTrainingsMutation<{ entryIds: string[] }>((data) => ({ url: '/trainings/ledger/approve', method: 'POST', data }));

export interface PaymentBody {
  trainerStaffUserId: string;
  amount: number;
  /** ISO date */
  paidAt: string;
  reference?: string;
  note?: string;
}

export const useRecordPayment = () =>
  useTrainingsMutation<PaymentBody>((data) => ({ url: '/trainings/ledger/payments', method: 'POST', data }));

export interface AdjustmentBody {
  trainerStaffUserId: string;
  /** ± whole rupees */
  amount: number;
  reason: string;
  enrollmentId?: string;
}

export const useAddAdjustment = () =>
  useTrainingsMutation<AdjustmentBody>((data) => ({ url: '/trainings/ledger/adjustments', method: 'POST', data }));

/** Payments and adjustments only */
export const useVoidEntry = () =>
  useTrainingsMutation<{ id: string; reason: string }>(({ id, reason }) => ({
    url: `/trainings/ledger/entries/${id}/void`,
    method: 'POST',
    data: { reason },
  }));
