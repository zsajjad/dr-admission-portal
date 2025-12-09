'use client';

import { useState } from 'react';

import FileExportIcon from '@mui/icons-material/FileDownload';
import { Button, ButtonProps, CircularProgress } from '@mui/material';

import { FormattedMessage } from '@/theme/FormattedMessage';

import { useSnackbarContext } from '@/contexts/SnackbarContext';

import messages from './message';

type ExportResult = Response | Blob;

export interface ExportButtonProps extends ButtonProps {
  onExport: () => Promise<ExportResult>;
  fileName?: string;
  deriveFileName?: (response: Response) => string | undefined;
  loading?: boolean;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

const defaultDeriveFileName = (headers: Headers): string | undefined => {
  const contentDisposition = headers.get('content-disposition') || headers.get('Content-Disposition');
  if (!contentDisposition) return undefined;
  const filenameStarMatch = /filename\*=UTF-8''([^;\n]+)/i.exec(contentDisposition);
  if (filenameStarMatch?.[1]) {
    try {
      return decodeURIComponent(filenameStarMatch[1]);
    } catch {
      // ignore and try basic filename
    }
  }
  const filenameMatch = /filename="?([^";\n]+)"?/i.exec(contentDisposition);
  return filenameMatch?.[1];
};

export function ExportButton({
  onExport,
  fileName,
  deriveFileName,
  loading,
  onSuccess,
  onError,
  startIcon,
  disabled,
  variant = 'outlined',
  color = 'primary',
  ...props
}: ExportButtonProps) {
  const snackbar = useSnackbarContext();
  const [isBusy, setIsBusy] = useState(false);
  const busy = loading ?? isBusy;

  const handleClick = async () => {
    try {
      if (loading === undefined) setIsBusy(true);
      const result = await onExport();

      let blob: Blob;
      let resolvedFileName = fileName;
      if (result instanceof Response) {
        if (!result.ok) {
          const message = await result.text().catch(() => 'Export failed');
          throw new Error(message || 'Export failed');
        }
        blob = await result.blob();
        resolvedFileName =
          resolvedFileName ||
          (deriveFileName ? deriveFileName(result) : defaultDeriveFileName(result.headers)) ||
          'export.xlsx';
      } else {
        blob = result;
        resolvedFileName = resolvedFileName || 'export.xlsx';
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = resolvedFileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      onSuccess?.();
    } catch (error) {
      if (onError) onError(error);
      snackbar.show({
        message: error instanceof Error ? error.message : 'Export failed',
        type: 'error',
      });
    } finally {
      if (loading === undefined) setIsBusy(false);
    }
  };

  const effectiveStartIcon = busy ? <CircularProgress size={16} /> : (startIcon ?? <FileExportIcon />);

  return (
    <Button
      variant={variant}
      color={color}
      startIcon={effectiveStartIcon}
      onClick={handleClick}
      disabled={busy || disabled}
      {...props}
    >
      <FormattedMessage {...messages.label} />
    </Button>
  );
}
