/**
 * Custom hooks for printing mutations
 *
 * These hooks handle file download for printing endpoints.
 * The orval-generated hooks return void since the endpoints return files, not JSON.
 * These wrappers handle the actual blob download.
 */
import { useMutation } from '@tanstack/react-query';
import type { UseMutationOptions, UseMutationResult } from '@tanstack/react-query';

import {
  AttendanceSheetFilterDto,
  IdCardFilterDto,
  SittingSlipFilterDto,
  VerificationSlipFilterDto,
} from '@/providers/service/app.schemas';

import { fetchAndDownloadFile, FileDownloadResponse } from '@/services/printing';

// ========================================
// ID Cards
// ========================================

export function useGenerateIdCards(options?: {
  mutation?: Omit<
    UseMutationOptions<FileDownloadResponse, unknown, { data: IdCardFilterDto }, unknown>,
    'mutationFn' | 'mutationKey'
  >;
}): UseMutationResult<FileDownloadResponse, unknown, { data: IdCardFilterDto }, unknown> {
  return useMutation({
    mutationKey: ['printingControllerGenerateIdCards'],
    mutationFn: async ({ data }) => {
      return fetchAndDownloadFile('/printing/id-cards/generate', 'POST', data, 'id-cards', 'pdf');
    },
    ...options?.mutation,
  });
}

export function usePreviewIdCardDesign(options?: {
  mutation?: Omit<UseMutationOptions<FileDownloadResponse, unknown, void, unknown>, 'mutationFn' | 'mutationKey'>;
}): UseMutationResult<FileDownloadResponse, unknown, void, unknown> {
  return useMutation({
    mutationKey: ['printingControllerPreviewIdCardDesign'],
    mutationFn: async () => {
      return fetchAndDownloadFile('/printing/id-cards/preview-design', 'GET', undefined, 'id-card-preview', 'pdf');
    },
    ...options?.mutation,
  });
}

// ========================================
// Sitting Slips
// ========================================

export function useGenerateSittingSlips(options?: {
  mutation?: Omit<
    UseMutationOptions<FileDownloadResponse, unknown, { data: SittingSlipFilterDto }, unknown>,
    'mutationFn' | 'mutationKey'
  >;
}): UseMutationResult<FileDownloadResponse, unknown, { data: SittingSlipFilterDto }, unknown> {
  return useMutation({
    mutationKey: ['printingControllerGenerateSittingSlips'],
    mutationFn: async ({ data }) => {
      return fetchAndDownloadFile('/printing/sitting-slips/generate', 'POST', data, 'sitting-slips', 'pdf');
    },
    ...options?.mutation,
  });
}

export function usePreviewSittingSlipDesign(options?: {
  mutation?: Omit<UseMutationOptions<FileDownloadResponse, unknown, void, unknown>, 'mutationFn' | 'mutationKey'>;
}): UseMutationResult<FileDownloadResponse, unknown, void, unknown> {
  return useMutation({
    mutationKey: ['printingControllerPreviewSittingSlipDesign'],
    mutationFn: async () => {
      return fetchAndDownloadFile(
        '/printing/sitting-slips/preview-design',
        'GET',
        undefined,
        'sitting-slip-preview',
        'pdf',
      );
    },
    ...options?.mutation,
  });
}

// ========================================
// Attendance Sheets
// ========================================

export function useGenerateAttendanceSheets(options?: {
  mutation?: Omit<
    UseMutationOptions<FileDownloadResponse, unknown, { data: AttendanceSheetFilterDto }, unknown>,
    'mutationFn' | 'mutationKey'
  >;
}): UseMutationResult<FileDownloadResponse, unknown, { data: AttendanceSheetFilterDto }, unknown> {
  return useMutation({
    mutationKey: ['printingControllerGenerateAttendanceSheets'],
    mutationFn: async ({ data }) => {
      return fetchAndDownloadFile('/printing/attendance-sheets/generate', 'POST', data, 'attendance-sheets', 'xlsx');
    },
    ...options?.mutation,
  });
}

// ========================================
// Verification Slips
// ========================================

export function useGenerateVerificationSlips(options?: {
  mutation?: Omit<
    UseMutationOptions<FileDownloadResponse, unknown, { data: VerificationSlipFilterDto }, unknown>,
    'mutationFn' | 'mutationKey'
  >;
}): UseMutationResult<FileDownloadResponse, unknown, { data: VerificationSlipFilterDto }, unknown> {
  return useMutation({
    mutationKey: ['printingControllerGenerateVerificationSlips'],
    mutationFn: async ({ data }) => {
      return fetchAndDownloadFile('/printing/verification-slips/generate', 'POST', data, 'verification-slips', 'pdf');
    },
    ...options?.mutation,
  });
}

export function usePreviewVerificationSlipDesign(options?: {
  mutation?: Omit<UseMutationOptions<FileDownloadResponse, unknown, void, unknown>, 'mutationFn' | 'mutationKey'>;
}): UseMutationResult<FileDownloadResponse, unknown, void, unknown> {
  return useMutation({
    mutationKey: ['printingControllerPreviewVerificationSlipDesign'],
    mutationFn: async () => {
      return fetchAndDownloadFile(
        '/printing/verification-slips/preview-design',
        'GET',
        undefined,
        'verification-slip-preview',
        'pdf',
      );
    },
    ...options?.mutation,
  });
}
