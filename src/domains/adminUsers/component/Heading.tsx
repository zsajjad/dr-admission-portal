/**
 * Page Heading
 */
'use client';

import React, { useCallback } from 'react';

import PageHeading, { PageHeadingProps } from '@/components/PageHeading';

import { useListingFilters } from '@/hooks/useListingFilters';

import { routes } from '@/router/routes';
import { useQueryParams } from '@/router/useQueryParams';

import { toBoolean } from '@/utils';

import messages from './messages';

interface HeadingProps extends Omit<PageHeadingProps, 'heading'> {
  showAddButton?: boolean;
  showIncludeInActive?: boolean;
}

export default function Heading({ showAddButton, showIncludeInActive }: HeadingProps): React.JSX.Element {
  const { route } = useQueryParams();
  const { filters, setFilter } = useListingFilters();

  const handleIncludeInActivePress = useCallback(
    (checked: boolean) => {
      setFilter({
        includeInActive: !!checked,
      });
    },
    [setFilter],
  );

  return (
    <PageHeading
      heading={messages.heading}
      isIncludeInActive={toBoolean(filters?.includeInActive)}
      onAddPress={showAddButton ? () => route({ url: routes.adminUsers.create }) : undefined}
      onCheckedIncludeInActive={showIncludeInActive ? handleIncludeInActivePress : undefined}
    />
  );
}
