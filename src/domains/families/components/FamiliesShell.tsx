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
import { FAMILIES_READ, FAMILY_REPORT_READ, useFamiliesAccess } from '../permissions';

/** Heading, tabs and the permission check shared by the family pages */
export function FamiliesShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { canRead, canReport } = useFamiliesAccess();
  const tabs = [
    canRead && { href: routes.families.listing, label: messages.tabFamilies },
    canRead && { href: routes.families.review, label: messages.tabReview },
    canReport && { href: routes.families.report, label: messages.tabReport },
  ].filter(Boolean) as { href: string; label: typeof messages.tabFamilies }[];
  const current =
    pathname.startsWith(routes.families.review) || pathname.startsWith(routes.families.report)
      ? pathname.startsWith(routes.families.review)
        ? routes.families.review
        : routes.families.report
      : routes.families.listing;
  const onReport = current === routes.families.report;

  return (
    <Stack>
      <PageHeading heading={messages.title} />
      <RequirePermission anyOf={FAMILY_REPORT_READ}>
        <Box sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabs.some((t) => t.href === current) ? current : false}>
            {tabs.map((tab) => (
              <Tab
                key={tab.href}
                value={tab.href}
                label={<FormattedMessage {...tab.label} />}
                component={Link}
                href={tab.href}
              />
            ))}
          </Tabs>
        </Box>
        {onReport ? children : <RequirePermission anyOf={FAMILIES_READ}>{children}</RequirePermission>}
      </RequirePermission>
    </Stack>
  );
}
