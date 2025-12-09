'use client';

import { Button, ButtonProps } from '@mui/material';

import { FormattedMessage } from '@/theme/FormattedMessage';

interface CustomMessage {
  id: string;
  defaultMessage: string;
}

interface SubmitButtonProps extends ButtonProps {
  isSubmitting: boolean;
  isEdit?: boolean;
  messages: {
    create: CustomMessage;
    update: CustomMessage;
    saving: CustomMessage;
  };
}

export function SubmitButton({ isSubmitting, isEdit = false, messages, disabled, ...rest }: SubmitButtonProps) {
  const submitMessage = isSubmitting ? messages?.saving : isEdit ? messages?.update : messages?.create;

  return (
    <Button variant="contained" type="submit" disabled={isSubmitting || disabled} {...rest}>
      <FormattedMessage {...submitMessage} />
    </Button>
  );
}
