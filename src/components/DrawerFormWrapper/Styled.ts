import { Box, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';

/* Root container */
export const Root = styled(Box)({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
});

/* Header */
export const Header = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 24,
});

/* Error message wrapper */
export const ErrorWrapper = styled(Box)({
  marginBottom: 24,
});

/* Form container */
export const Form = styled('form')({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
});

/* Form content */
export const FormContent = styled(Stack)({
  flex: 1,
});

/* Actions footer */
export const Actions = styled(Box)({
  marginTop: 32,
  display: 'flex',
  gap: 16,
  justifyContent: 'flex-end',
});
