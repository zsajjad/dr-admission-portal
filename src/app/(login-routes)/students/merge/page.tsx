'use client';

import { StudentMergeView } from '@/domains/studentMerge/view';

import { RequirePermission } from '@/components/RequirePermission';

import { Permission } from '@/providers/service/app.schemas';

export default function StudentMergePage() {
  return (
    <RequirePermission anyOf={[Permission.studentsmerge]}>
      <StudentMergeView />
    </RequirePermission>
  );
}
