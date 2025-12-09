/**
 * Admission Pages Heading
 */
'use client';

import React, { useCallback, useMemo } from 'react';

import { useParams } from 'next/navigation';

import { PageHeading, PageHeadingProps } from '@/components/PageHeading';

import { useListingFilters } from '@/hooks/useListingFilters';

import { routes } from '@/router/routes';
import { useQueryParams } from '@/router/useQueryParams';

import { toBoolean } from '@/utils';

import messages from './messages';

interface HeadingProps extends Omit<PageHeadingProps, 'heading'> {
  showAddButton?: boolean;
  showEditButton?: boolean;
  showIncludeInActive?: boolean;
  headingType: 'list' | 'detail' | 'edit' | 'create';
}

export function Heading({
  showAddButton,
  showEditButton,
  showIncludeInActive,
  headingType = 'list',
}: HeadingProps): React.JSX.Element {
  const { id } = useParams();
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

  const pageHeading = useMemo(() => messages[headingType], [headingType]);

  return (
    <PageHeading
      heading={pageHeading}
      isIncludeInActive={toBoolean(filters?.includeInActive)}
      onAddPress={showAddButton ? () => route({ url: routes.admission.create }) : undefined}
      onEditPress={showEditButton ? () => route({ url: routes.admission.edit(id as string) }) : undefined}
      onCheckedIncludeInActive={showIncludeInActive ? handleIncludeInActivePress : undefined}
    />
  );
}
