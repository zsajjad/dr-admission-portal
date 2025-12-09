import { Chip } from '@mui/material';

interface VisibilityCellProps {
  publishesAt: string;
  expiresAt: string;
  isActive: boolean;
}

export function VisibilityCell({ publishesAt, expiresAt, isActive }: VisibilityCellProps) {
  if (!isActive) {
    return <Chip label={'Invisible'} color="default" />;
  }
  if (new Date(publishesAt) > new Date()) {
    return <Chip label="Pending" color="warning" />;
  }
  if (new Date(expiresAt) < new Date()) {
    return <Chip label="Expired" color="default" />;
  }
  return <Chip label="Visible" color="error" />;
}
