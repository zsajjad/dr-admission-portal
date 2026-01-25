/**
 * Van Pages Heading
 */
'use client';

import React, { useCallback, useMemo } from 'react';

import { useParams } from 'next/navigation';

import { Stack } from '@mui/material';

import { BranchFilter } from '@/components/BranchFilter';
import PageHeading, { PageHeadingProps } from '@/components/PageHeading';
import { SessionFilter } from '@/components/SessionFilter';

import { useListingFilters } from '@/hooks/useListingFilters';

import { routes } from '@/router/routes';
import { useQueryParams } from '@/router/useQueryParams';

import { toBoolean } from '@/utils';

import messages from './messages';

interface VanFilters {
  includeInActive?: boolean;
}

interface HeadingProps extends Omit<PageHeadingProps, 'heading'> {
  showAddButton?: boolean;
  showEditButton?: boolean;
  showIncludeInActive?: boolean;
  showFilters?: boolean;
  headingType: 'list' | 'detail' | 'edit' | 'create';
}

export default function Heading({
  showAddButton,
  showEditButton,
  showIncludeInActive,
  showFilters = false,
  headingType = 'list',
}: HeadingProps): React.JSX.Element {
  const { route } = useQueryParams();
  const { id } = useParams();

  const { filters, setFilter } = useListingFilters<VanFilters>();

  const handleIncludeInActivePress = useCallback(
    (checked: boolean) => {
      setFilter({
        includeInActive: !!checked,
      });
    },
    [setFilter],
  );

  const pageHeading = useMemo(() => messages[headingType], [headingType]);

  const filtersComponent = showFilters ? (
    <Stack direction="row" spacing={2}>
      <BranchFilter />
      <SessionFilter />
    </Stack>
  ) : undefined;

  return (
    <PageHeading
      heading={pageHeading}
      isIncludeInActive={toBoolean(filters?.includeInActive)}
      onAddPress={showAddButton ? () => route({ url: routes.van.create }) : undefined}
      onEditPress={showEditButton ? () => route({ url: routes.van.edit(id as string) }) : undefined}
      onCheckedIncludeInActive={showIncludeInActive ? handleIncludeInActivePress : undefined}
      rightActions={filtersComponent}
    />
  );
}
