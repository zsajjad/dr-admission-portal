'use client';

import { AdminPermissionsView } from '@/domains/adminPermissions/view';

import { RequirePermission } from '@/components/RequirePermission';

export default function AdminPermissionsPage() {
  return (
    <RequirePermission superAdminOnly>
      <AdminPermissionsView />
    </RequirePermission>
  );
}
