import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Typography, IconButton, Alert, Button } from '@mui/material';

import { FormattedMessage } from '@/theme/FormattedMessage';

import { SubmitButton } from '../SubmitButton';

import { Root, Header, ErrorWrapper, Form, FormContent, Actions } from './Styled';

interface CustomMessage {
  id: string;
  defaultMessage: string;
}

interface DrawerFormLayoutProps {
  title: React.ReactNode;
  onBack?: () => void;
  errorMessage?: string | null;

  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  children: React.ReactNode;

  onCancel?: () => void;
  isSubmitting: boolean;
  isEdit?: boolean;
  isSubmitDisabled?: boolean;
  submitMessages: {
    create: CustomMessage;
    update: CustomMessage;
    saving: CustomMessage;
  };
}

export default function DrawerFormLayout({
  title,
  onBack,
  errorMessage,
  onSubmit,
  children,
  onCancel,
  isSubmitting,
  isEdit,
  isSubmitDisabled,
  submitMessages,
}: DrawerFormLayoutProps) {
  return (
    <Root>
      {/* Header */}
      <Header>
        <Typography variant="h6">{title}</Typography>

        <IconButton onClick={onBack} size="small">
          <ArrowBackIcon />
        </IconButton>
      </Header>

      {/* Error */}
      {errorMessage && (
        <ErrorWrapper>
          <Alert severity="error">{errorMessage}</Alert>
        </ErrorWrapper>
      )}

      {/* Form */}
      <Form onSubmit={onSubmit}>
        <FormContent spacing={3}>{children}</FormContent>

        {/* Actions */}
        <Actions>
          <Button variant="outlined" onClick={onCancel} disabled={isSubmitting}>
            <FormattedMessage id="cancel" defaultMessage="Cancel" />
          </Button>

          <SubmitButton
            isSubmitting={isSubmitting}
            isEdit={isEdit}
            disabled={isSubmitDisabled}
            messages={submitMessages}
          />
        </Actions>
      </Form>
    </Root>
  );
}
