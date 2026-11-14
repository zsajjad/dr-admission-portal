'use client';

import { ReactNode } from 'react';

import { Alert, Skeleton } from '@mui/material';

import { Permission } from '@/providers/service/app.schemas';

import { FormattedMessage } from '@/theme/FormattedMessage';

import { usePermissions } from '@/hooks/usePermissions';

import messages from './messages';

interface RequirePermissionProps {
  /** Any one of these is enough */
  anyOf?: Permission[];
  /** Only super admins (for pages no permission opens, like granting permissions) */
  superAdminOnly?: boolean;
  children: ReactNode;
}

/** Shows the page only to admins with one of the permissions; the API enforces the same rule. */
export function RequirePermission({ anyOf = [], superAdminOnly, children }: RequirePermissionProps) {
  const { has, isSuperAdmin, isLoading } = usePermissions();
  if (isLoading) return <Skeleton variant="rounded" height={160} sx={{ borderRadius: 3 }} />;
  if (superAdminOnly && !isSuperAdmin) {
    return (
      <Alert severity="warning" sx={{ borderRadius: 3 }}>
        <FormattedMessage {...messages.superAdminOnly} />
      </Alert>
    );
  }
  if (anyOf.length > 0 && !has(...anyOf)) {
    return (
      <Alert severity="warning" sx={{ borderRadius: 3 }}>
        <FormattedMessage {...messages.notAllowed} values={{ permissions: anyOf.join(' or ') }} />
      </Alert>
    );
  }
  return <>{children}</>;
}
