/**
 * Printing Service Utilities
 *
 * Utility functions for printing endpoints that return file downloads.
 * These complement the orval-generated hooks by handling blob responses.
 */
import { downloadBlob, downloadFromUrl, generateFilename } from '@/utils/downloadFile';

import service from './index';

export interface FileDownloadResponse {
  firebasePath?: string;
  count?: number;
  /** Verification slips only: how many card print requests were created. */
  cardRequestsCreated?: number;
}

/**
 * Generic function to fetch a file from a printing endpoint and trigger download.
 * Use this when an endpoint returns a file (PDF, Excel) instead of JSON.
 */
export async function fetchAndDownloadFile(
  url: string,
  method: 'GET' | 'POST',
  data?: unknown,
  filenamePrefix: string = 'download',
  extension: string = 'pdf',
): Promise<FileDownloadResponse> {
  const response = await service<Response>({
    url,
    method,
    data,
    responseType: 'blob',
  });

  // Extract metadata from headers
  const firebasePath = response.headers.get('X-Firebase-Path') || undefined;
  const countHeader =
    response.headers.get('X-Card-Count') ||
    response.headers.get('X-Slip-Count') ||
    response.headers.get('X-Student-Count');
  const count = countHeader ? parseInt(countHeader, 10) : undefined;

  // Download the file
  const blob = await response.blob();
  const filename = generateFilename(filenamePrefix, extension);
  downloadBlob(blob, filename);

  return { firebasePath, count };
}

// ========================================
// Background print jobs
// ========================================

export type PrintingJobKind = 'id-cards' | 'sitting-slips' | 'attendance-sheets' | 'verification-slips';

interface PrintingJobStatus {
  status: 'QUEUED' | 'RUNNING' | 'DONE' | 'FAILED';
  count?: number;
  url?: string;
  fileName?: string;
  cardRequestsCreated?: number;
  message?: string;
}

const POLL_INTERVAL_MS = 2000;
const MAX_WAIT_MS = 10 * 60 * 1000;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Builds a print file on the server in the background, waits for it, then downloads it.
 *
 * The API builds the file in a job (POST /printing/<kind>/jobs) and, when it's done, returns a
 * short-lived download link (GET /printing/jobs/:id). A large batch of ID cards can take longer
 * and be bigger than one request may be, especially once the portal calls the API through its
 * own server (a Netlify function). Errors are thrown as `{ statusCode, message }`, like the API's.
 */
export async function runPrintingJob(kind: PrintingJobKind, data: unknown): Promise<FileDownloadResponse> {
  const { jobId } = await service<{ jobId: string }>({ url: `/printing/${kind}/jobs`, method: 'POST', data });

  const deadline = Date.now() + MAX_WAIT_MS;
  while (Date.now() < deadline) {
    await wait(POLL_INTERVAL_MS);
    const job = await service<PrintingJobStatus>({ url: `/printing/jobs/${jobId}`, method: 'GET' });

    if (job.status === 'DONE') {
      if (job.url) downloadFromUrl(job.url, job.fileName);
      return { count: job.count ?? 0, cardRequestsCreated: job.cardRequestsCreated };
    }
    if (job.status === 'FAILED') {
      throw { statusCode: 500, message: job.message || 'Could not build the file. Please try again.' };
    }
  }
  throw { statusCode: 504, message: 'The file is taking too long to build. Please try again.' };
}
