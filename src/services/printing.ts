/**
 * Printing Service Utilities
 *
 * Utility functions for printing endpoints that return file downloads.
 * These complement the orval-generated hooks by handling blob responses.
 */
import { downloadBlob, generateFilename } from '@/utils/downloadFile';

import service from './index';

export interface FileDownloadResponse {
  firebasePath?: string;
  count?: number;
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
