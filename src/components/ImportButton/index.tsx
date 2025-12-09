'use client';

import { useRef, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import FileUpload from '@mui/icons-material/FileUpload';
import { Button, ButtonProps, CircularProgress } from '@mui/material';

import { FormattedMessage } from '@/theme/FormattedMessage';

import { useSnackbarContext } from '@/contexts/SnackbarContext';

import messages from './message';

export interface ImportButtonProps extends ButtonProps {
  onImport: (file: File) => Promise<{ message?: string }>;
  resetKeys: string[];
  accept?: string;
  loading?: boolean;
  onSuccessMessage?: string;
  onBeforePick?: () => void;
}

export function ImportButton({
  onImport,
  resetKeys,
  accept = '.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  loading,
  onSuccessMessage,
  onBeforePick,
  startIcon,
  disabled,
  variant = 'outlined',
  color = 'primary',
  ...props
}: ImportButtonProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const snackbar = useSnackbarContext();
  const [isBusy, setIsBusy] = useState(false);
  const busy = loading ?? isBusy;

  const handlePickFile = () => {
    onBeforePick?.();
    fileInputRef.current?.click();
  };

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0] || null;
    // allow picking the same file again next time
    e.currentTarget.value = '';
    if (!file) return;

    try {
      if (loading === undefined) setIsBusy(true);
      const result = await onImport(file);
      const message = result?.message || onSuccessMessage || 'Import successful';
      snackbar.show({ message, type: 'success' });
      if (resetKeys) {
        resetKeys.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: [key] });
        });
      }
    } catch (error) {
      snackbar.show({
        message: (error as Error)?.message || 'Import failed',
        type: 'error',
      });
    } finally {
      if (loading === undefined) setIsBusy(false);
    }
  };

  const effectiveStartIcon = busy ? <CircularProgress size={16} /> : (startIcon ?? <FileUpload />);

  return (
    <>
      <input ref={fileInputRef} type="file" accept={accept} style={{ display: 'none' }} onChange={handleFileChange} />
      <Button
        variant={variant}
        color={color}
        startIcon={effectiveStartIcon}
        onClick={handlePickFile}
        disabled={busy || disabled}
        {...props}
      >
        <FormattedMessage {...messages.label} />
      </Button>
    </>
  );
}
