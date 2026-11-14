'use client';

import { Suspense } from 'react';

import { Stack } from '@mui/material';

import messages from '@/domains/staffUsers/messages';
import { StaffCardsView } from '@/domains/staffUsers/view/cards';

import { PageHeading } from '@/components/PageHeading';
import { RequirePermission } from '@/components/RequirePermission';

import { Permission } from '@/providers/service/app.schemas';

export default function StaffCardsPage() {
  return (
    <Stack>
      <PageHeading heading={messages.cardsTitle} />
      <RequirePermission anyOf={[Permission.staffmanage]}>
        <Suspense fallback={null}>
          <StaffCardsView />
        </Suspense>
      </RequirePermission>
    </Stack>
  );
}
