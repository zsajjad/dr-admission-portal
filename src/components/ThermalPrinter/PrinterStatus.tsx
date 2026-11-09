'use client';

import PrintIcon from '@mui/icons-material/Print';
import { Button, Chip, CircularProgress, Stack } from '@mui/material';

import FormattedMessage, { useFormattedMessage } from '@/theme/FormattedMessage';

import { useThermalPrinter } from '@/hooks/useThermalPrinter';

import { thermalPrinter } from '@/utils/thermalPrinter';

import messages from './messages';

interface PrinterStatusProps {
  onTestPrint: () => void;
  isTestPrinting: boolean;
}

/** Shows whether the receipt printer is connected, with connect, change and test buttons. */
export function PrinterStatus({ onTestPrint, isTestPrinting }: PrinterStatusProps) {
  const { status, deviceName } = useThermalPrinter();

  const readyLabel = useFormattedMessage({ ...messages.statusReady, values: { name: deviceName ?? '' } });
  const labels = {
    ready: readyLabel,
    printing: useFormattedMessage(messages.statusPrinting),
    connecting: useFormattedMessage(messages.statusConnecting),
    disconnected: useFormattedMessage(messages.statusDisconnected),
    error: useFormattedMessage(messages.statusError),
    unsupported: useFormattedMessage(messages.statusUnsupported),
  };
  const color = {
    ready: 'success',
    printing: 'info',
    connecting: 'default',
    disconnected: 'warning',
    error: 'error',
    unsupported: 'error',
  } as const;

  const isBusy = status === 'connecting' || status === 'printing';
  const canConnect = status === 'disconnected' || status === 'error';

  const handleConnect = () => {
    // Errors are shown through the status chip; nothing else to do here
    thermalPrinter.connect({ prompt: true }).catch(() => undefined);
  };

  const handleChange = () => {
    thermalPrinter.changePrinter().catch(() => undefined);
  };

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Chip
        size="small"
        color={color[status]}
        variant={status === 'ready' ? 'filled' : 'outlined'}
        icon={isBusy ? <CircularProgress size={14} color="inherit" /> : <PrintIcon fontSize="small" />}
        label={labels[status]}
      />
      {canConnect && (
        <Button size="small" variant="contained" onClick={handleConnect}>
          {status === 'error' ? (
            <FormattedMessage {...messages.reconnect} />
          ) : (
            <FormattedMessage {...messages.connect} />
          )}
        </Button>
      )}
      {status !== 'unsupported' && (
        <>
          <Button size="small" variant="text" onClick={handleChange} disabled={isBusy}>
            <FormattedMessage {...messages.changePrinter} />
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={onTestPrint}
            disabled={isBusy || isTestPrinting}
            startIcon={isTestPrinting ? <CircularProgress size={16} /> : <PrintIcon />}
          >
            <FormattedMessage {...messages.testPrint} />
          </Button>
        </>
      )}
    </Stack>
  );
}
