'use client';

import { use } from 'react';

import { Stack } from '@mui/material';

import messages from '@/domains/staffUsers/messages';
import { StaffUserDetailView } from '@/domains/staffUsers/view/detail';

import { PageHeading } from '@/components/PageHeading';
import { RequirePermission } from '@/components/RequirePermission';

import { Permission } from '@/providers/service/app.schemas';

export default function StaffUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Stack>
      <PageHeading heading={messages.detailTitle} />
      <RequirePermission anyOf={[Permission.staffmanage]}>
        <StaffUserDetailView id={id} />
      </RequirePermission>
    </Stack>
  );
}
