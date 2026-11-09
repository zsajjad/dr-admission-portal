'use client';

import { useCallback, useState } from 'react';

import {
  AdmissionSlipData,
  buildAdmissionSlip,
  printAdmissionSlipInBrowser,
  PrinterError,
  thermalPrinter,
} from '@/utils/thermalPrinter';

import { PrintErrorDialog } from './PrintErrorDialog';

interface FailedSlip {
  key: string;
  data: AdmissionSlipData;
  error: PrinterError;
}

/**
 * Prints admission slips on the receipt printer. When a print fails, it shows
 * a dialog with the reason and Retry, instead of falling back silently.
 *
 * Render `errorDialog` once on the page.
 */
export function useSlipPrinter() {
  const [printingKey, setPrintingKey] = useState<string | null>(null);
  const [failed, setFailed] = useState<FailedSlip | null>(null);

  const printSlip = useCallback(async (key: string, data: AdmissionSlipData) => {
    setFailed(null);
    setPrintingKey(key);
    try {
      await thermalPrinter.print(buildAdmissionSlip(data));
    } catch (error) {
      const printerError =
        error instanceof PrinterError
          ? error
          : new PrinterError('unknown', error instanceof Error ? error.message : '');
      console.error('Slip printing failed:', printerError);
      setFailed({ key, data, error: printerError });
    } finally {
      setPrintingKey(null);
    }
  }, []);

  const handleRetry = useCallback(() => {
    if (failed) void printSlip(failed.key, failed.data);
  }, [failed, printSlip]);

  const handlePrintInBrowser = useCallback(() => {
    if (!failed) return;
    setFailed(null);
    printAdmissionSlipInBrowser(failed.data).catch((error) => {
      console.error('Browser printing failed:', error);
      alert(error instanceof Error ? error.message : String(error));
    });
  }, [failed]);

  const errorDialog = (
    <PrintErrorDialog
      error={failed?.error ?? null}
      grNumber={failed?.data.grNumber}
      onRetry={handleRetry}
      onPrintInBrowser={handlePrintInBrowser}
      onClose={() => setFailed(null)}
    />
  );

  return { printSlip, printingKey, errorDialog };
}
