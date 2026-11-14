'use client';

import { ReactNode } from 'react';

import { Alert, Skeleton } from '@mui/material';

import { Permission } from '@/providers/service/app.schemas';

import { FormattedMessage } from '@/theme/FormattedMessage';

import { usePermissions } from '@/hooks/usePermissions';

import messages from './messages';

interface RequirePermissionProps {
  /** Any one of these is enough */
  anyOf: Permission[];
  children: ReactNode;
}

/** Shows the page only to admins with one of the permissions; the API enforces the same rule. */
export function RequirePermission({ anyOf, children }: RequirePermissionProps) {
  const { has, isLoading } = usePermissions();
  if (isLoading) return <Skeleton variant="rounded" height={160} sx={{ borderRadius: 3 }} />;
  if (!has(...anyOf)) {
    return (
      <Alert severity="warning" sx={{ borderRadius: 3 }}>
        <FormattedMessage {...messages.notAllowed} values={{ permissions: anyOf.join(' or ') }} />
      </Alert>
    );
  }
  return <>{children}</>;
}
