/**
 * Triggers a file download in the browser from a Blob
 * @param blob - The blob data to download
 * @param filename - The filename for the downloaded file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generates a timestamp-based filename for downloads
 * @param prefix - The prefix for the filename (e.g., 'id-cards', 'sitting-slips')
 * @param extension - The file extension (e.g., 'pdf', 'xlsx')
 * @returns A formatted filename with timestamp
 */
export function generateFilename(prefix: string, extension: string): string {
  const now = new Date();
  const timestamp = now.toISOString().slice(0, 19).replace(/[T:]/g, '-');
  return `${prefix}-${timestamp}.${extension}`;
}

/**
 * Downloads a file from a Response object
 * @param response - The Response object from fetch
 * @param filename - The filename for the downloaded file
 */
export async function downloadFromResponse(response: Response, filename: string): Promise<void> {
  const blob = await response.blob();
  downloadBlob(blob, filename);
}
