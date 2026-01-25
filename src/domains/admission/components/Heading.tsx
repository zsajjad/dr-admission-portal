/**
 * Admission Pages Heading
 */
'use client';

import React, { useCallback, useMemo } from 'react';

import { useParams } from 'next/navigation';

import HistoryIcon from '@mui/icons-material/History';
import { Button } from '@mui/material';

import { PageHeading, PageHeadingProps } from '@/components/PageHeading';

import { FormattedMessage } from '@/theme/FormattedMessage';

import { useListingFilters } from '@/hooks/useListingFilters';

import { routes } from '@/router/routes';
import { useQueryParams } from '@/router/useQueryParams';

import { toBoolean } from '@/utils';

import messages from './messages';

interface HeadingProps extends Omit<PageHeadingProps, 'heading'> {
  showAddButton?: boolean;
  showEditButton?: boolean;
  showIncludeInActive?: boolean;
  showFromLegacyButton?: boolean;
  headingType: 'list' | 'detail' | 'edit' | 'create' | 'fromLegacy';
}

export function Heading({
  showAddButton,
  showEditButton,
  showIncludeInActive,
  showFromLegacyButton,
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

  const rightActions = useMemo(() => {
    if (!showFromLegacyButton) return undefined;
    return (
      <Button
        variant="outlined"
        color="primary"
        startIcon={<HistoryIcon />}
        onClick={() => route({ url: routes.admission.fromLegacy })}
        sx={{
          borderRadius: '999px',
          px: 3,
          py: 1.25,
          fontWeight: 600,
          textTransform: 'none',
        }}
      >
        <FormattedMessage {...messages.fromLegacy} />
      </Button>
    );
  }, [showFromLegacyButton, route]);

  return (
    <PageHeading
      heading={pageHeading}
      isIncludeInActive={toBoolean(filters?.includeInActive)}
      onAddPress={showAddButton ? () => route({ url: routes.admission.create }) : undefined}
      onEditPress={showEditButton ? () => route({ url: routes.admission.edit(id as string) }) : undefined}
      onCheckedIncludeInActive={showIncludeInActive ? handleIncludeInActivePress : undefined}
      rightActions={rightActions}
    />
  );
}
