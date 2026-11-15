'use client';

import { ReactNode } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Box, Stack, Tab, Tabs } from '@mui/material';

import { PageHeading } from '@/components/PageHeading';
import { RequirePermission } from '@/components/RequirePermission';

import { FormattedMessage } from '@/theme/FormattedMessage';

import { routes } from '@/router/routes';
import { useQueryParams } from '@/router/useQueryParams';

import messages from '../messages';

/** Heading, tabs and the admin check shared by the schools pages. Core allows /school to admins only. */
export function SchoolsShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { setParam } = useQueryParams();
  const current = pathname.startsWith(routes.schools.unmatched) ? routes.schools.unmatched : routes.schools.listing;
  const onList = pathname === routes.schools.listing;

  return (
    <Stack>
      <PageHeading
        heading={messages.title}
        onAddPress={onList ? () => setParam({ newParams: { create: 'true' }, scroll: false }) : undefined}
      />
      <RequirePermission adminOnly>
        <Box sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={current}>
            <Tab
              value={routes.schools.listing}
              label={<FormattedMessage {...messages.tabSchools} />}
              component={Link}
              href={routes.schools.listing}
            />
            <Tab
              value={routes.schools.unmatched}
              label={<FormattedMessage {...messages.tabUnmatched} />}
              component={Link}
              href={routes.schools.unmatched}
            />
          </Tabs>
        </Box>
        {children}
      </RequirePermission>
    </Stack>
  );
}
