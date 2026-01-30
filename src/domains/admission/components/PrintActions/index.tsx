'use client';

import PrintIcon from '@mui/icons-material/Print';
import { Button, Stack, Tooltip } from '@mui/material';

import { Admission } from '@/providers/service/app.schemas';

import FormattedMessage, { useFormattedMessage } from '@/theme/FormattedMessage';

import { useGenerateIdCards, useGenerateVerificationSlips } from '@/hooks/usePrintingMutations';

import messages from './messages';

interface PrintActionsProps {
  admission: Admission;
}

export function PrintActions({ admission }: PrintActionsProps) {
  const generateIdCardMutation = useGenerateIdCards();
  const generateVerificationSlipMutation = useGenerateVerificationSlips();

  const formattedMessages = {
    printing: useFormattedMessage(messages.printing),
    printError: useFormattedMessage(messages.printError),
  };

  const handlePrintIdCard = () => {
    generateIdCardMutation.mutate({
      data: {
        admissionIds: [admission.id],
        sessionId: admission.session.id, // Required by TypeScript but ignored when admissionIds is provided
      },
    });
  };

  const handlePrintVerificationSlip = () => {
    generateVerificationSlipMutation.mutate({
      data: {
        admissionIds: [admission.id],
        sessionId: admission.session.id,
      },
    });
  };

  const isGenerating = generateIdCardMutation.isPending || generateVerificationSlipMutation.isPending;

  return (
    <Stack direction="row" spacing={1}>
      <Tooltip title={generateIdCardMutation.isError ? formattedMessages.printError : ''}>
        <span>
          <Button
            variant="outlined"
            size="small"
            startIcon={<PrintIcon />}
            onClick={handlePrintIdCard}
            disabled={isGenerating}
          >
            {generateIdCardMutation.isPending ? (
              formattedMessages.printing
            ) : (
              <FormattedMessage {...messages.printIdCard} />
            )}
          </Button>
        </span>
      </Tooltip>

      <Tooltip title={generateVerificationSlipMutation.isError ? formattedMessages.printError : ''}>
        <span>
          <Button
            variant="outlined"
            size="small"
            startIcon={<PrintIcon />}
            onClick={handlePrintVerificationSlip}
            disabled={isGenerating}
          >
            {generateVerificationSlipMutation.isPending ? (
              formattedMessages.printing
            ) : (
              <FormattedMessage {...messages.printVerificationSlip} />
            )}
          </Button>
        </span>
      </Tooltip>
    </Stack>
  );
}
