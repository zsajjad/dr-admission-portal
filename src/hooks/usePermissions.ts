import { useCallback } from 'react';

import { useSession } from 'next-auth/react';

import { useAdminPermissionControllerMe } from '@/providers/service/admin-permission/admin-permission';
import { Permission, RoleName } from '@/providers/service/app.schemas';

/**
 * What the signed-in admin may do, from GET /admin-permission/me.
 * A SUPER_ADMIN gets every permission from the server, so there is no role check here.
 * The API enforces the same rules; this only decides what to show.
 */
export function usePermissions() {
  const { status } = useSession();
  const { data, isLoading } = useAdminPermissionControllerMe({
    query: { enabled: status === 'authenticated', staleTime: 5 * 60 * 1000 },
  });
  const effective = data?.data?.effective;

  /** True when the admin has at least one of the given permissions */
  const has = useCallback(
    (...permissions: Permission[]) => !!effective && permissions.some((p) => effective.includes(p)),
    [effective],
  );

  const role = data?.data?.role;
  return {
    has,
    role,
    /** Only super admins grant permissions */
    isSuperAdmin: role === RoleName.SUPER_ADMIN,
    isLoading: status === 'loading' || isLoading,
  };
}
