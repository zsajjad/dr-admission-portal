/**
 * Extracts the error message from a network error.
 * @param error - The error to extract the message from.
 * @returns The error message.
 */
export function extractNetworkError(error: unknown): string {
  let errorMessage = '';
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else if (error && typeof error === 'object' && 'message' in error) {
    errorMessage = String(error.message);
  }
  return errorMessage;
}
