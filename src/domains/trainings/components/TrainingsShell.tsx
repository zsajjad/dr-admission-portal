'use client';

import { ReactNode } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Box, Stack, Tab, Tabs } from '@mui/material';

import { PageHeading } from '@/components/PageHeading';
import { RequirePermission } from '@/components/RequirePermission';

import { FormattedMessage } from '@/theme/FormattedMessage';

import { routes } from '@/router/routes';

import messages from '../messages';
import { TRAININGS_READ, useTrainingsAccess } from '../permissions';

type Access = ReturnType<typeof useTrainingsAccess>;

interface TabConfig {
  href: string;
  label: React.ComponentProps<typeof FormattedMessage>;
  /** Hidden when this returns false; every tab needs the read permission */
  show?: (access: Access) => boolean;
}

const TABS: TabConfig[] = [
  { href: routes.trainings.catalog, label: messages.tabCatalog },
  { href: routes.trainings.windows, label: messages.tabWindows },
];

/** Heading, tabs and the read-permission check shared by every trainings page */
export function TrainingsShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const access = useTrainingsAccess();
  const tabs = TABS.filter((tab) => !tab.show || tab.show(access));
  const current = tabs.find((tab) => pathname === tab.href || pathname.startsWith(`${tab.href}/`))?.href ?? false;

  return (
    <Stack>
      <PageHeading heading={messages.title} />
      <RequirePermission anyOf={TRAININGS_READ}>
        <Box sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={current} variant="scrollable" scrollButtons="auto">
            {tabs.map((tab) => (
              <Tab
                key={tab.href}
                value={tab.href}
                label={<FormattedMessage {...tab.label} />}
                component={Link}
                href={tab.href}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              />
            ))}
          </Tabs>
        </Box>
        {children}
      </RequirePermission>
    </Stack>
  );
}
