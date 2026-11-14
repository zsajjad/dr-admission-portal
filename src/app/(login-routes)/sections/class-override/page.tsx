'use client';

import { Suspense } from 'react';

import { ClassOverrideView } from '@/domains/sections/view/override';

import { RequirePermission } from '@/components/RequirePermission';

import { Permission } from '@/providers/service/app.schemas';

export default function ClassOverridePage() {
  return (
    <RequirePermission anyOf={[Permission.sectionsmanage]}>
      <Suspense fallback={null}>
        <ClassOverrideView />
      </Suspense>
    </RequirePermission>
  );
}
