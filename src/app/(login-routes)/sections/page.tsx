'use client';

import { Suspense } from 'react';

import { SectionsOverview } from '@/domains/sections/view/overview';

import { RequirePermission } from '@/components/RequirePermission';

import { Permission } from '@/providers/service/app.schemas';

export default function SectionsPage() {
  return (
    <RequirePermission anyOf={[Permission.sectionsmanage]}>
      <Suspense fallback={null}>
        <SectionsOverview />
      </Suspense>
    </RequirePermission>
  );
}
