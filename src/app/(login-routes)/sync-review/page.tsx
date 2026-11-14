'use client';

import { SyncReviewView } from '@/domains/syncReview/view';

import { RequirePermission } from '@/components/RequirePermission';

import { Permission } from '@/providers/service/app.schemas';

export default function SyncReviewPage() {
  return (
    <RequirePermission anyOf={[Permission.staffreview]}>
      <SyncReviewView />
    </RequirePermission>
  );
}
