'use client';

import { use } from 'react';

import { Stack } from '@mui/material';

import messages from '@/domains/sections/messages';
import { SectionDetailView } from '@/domains/sections/view/detail';

import { PageHeading } from '@/components/PageHeading';
import { RequirePermission } from '@/components/RequirePermission';

import { Permission } from '@/providers/service/app.schemas';

export default function SectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Stack>
      <PageHeading heading={messages.detailTitle} />
      <RequirePermission anyOf={[Permission.sectionsmanage]}>
        <SectionDetailView id={id} />
      </RequirePermission>
    </Stack>
  );
}
