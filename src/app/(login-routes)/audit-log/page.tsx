'use client';

import { AuditLogView } from '@/domains/auditLog/view';

import { RequirePermission } from '@/components/RequirePermission';

import { Permission } from '@/providers/service/app.schemas';

export default function AuditLogPage() {
  return (
    <RequirePermission anyOf={[Permission.auditview]}>
      <AuditLogView />
    </RequirePermission>
  );
}
