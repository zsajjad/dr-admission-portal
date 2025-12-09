'use client';

import { useEffect, useMemo, useState } from 'react';

import { Alert, Stack } from '@mui/material';
import { GridColDef, GridPaginationModel } from '@mui/x-data-grid';

import { DataTable } from '@/components/DataTable';
import { RowActions } from '@/components/RowActions';

import { KEYS } from '@/providers/constants/key';
import { QuestionSet, QuestionSetControllerFindAllSortBy } from '@/providers/service/app.schemas';
import {
  useQuestionSetControllerActivate,
  useQuestionSetControllerDeactivate,
  useQuestionSetControllerFindAll,
} from '@/providers/service/question-set/question-set';

import { useFormattedMessage } from '@/theme/FormattedMessage';

import { useActivationHandlers } from '@/hooks/useActivationHandlers';
import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi';
import { useListingFilters } from '@/hooks/useListingFilters';
import { useMutationHandlers } from '@/hooks/useMutationHandlers';

import { routes } from '@/router/routes';
import { useQueryParams } from '@/router/useQueryParams';

import { extractNetworkError } from '@/utils/extractNetworkError';

import messages from './messages';

export default function QuestionsListing() {
  const { route } = useQueryParams();
  const activateQuestionSet = useQuestionSetControllerActivate();
  const deactivateQuestionSet = useQuestionSetControllerDeactivate();
  const { isAuthenticated: enabled } = useAuthenticatedApi();

  const formattedMessages = {
    errorUpdate: useFormattedMessage(messages.errorSuccess),
    noRowsLabel: useFormattedMessage(messages.noData),
    successUpdate: useFormattedMessage(messages.updateSuccess),
    titleHeaderName: useFormattedMessage(messages.titleHeaderName),
    classLevelHeaderName: useFormattedMessage(messages.classLevelHeaderName),
    sessionHeaderName: useFormattedMessage(messages.sessionHeaderName),
    questionsCountHeaderName: useFormattedMessage(messages.questionsCountHeaderName),
    actionsHeaderName: useFormattedMessage(messages.actionsHeaderName),
  };

  const { onSuccess, onError } = useMutationHandlers({
    queryKey: [KEYS.QUESTION_SET_LISTING],
    supportQueryKey: [KEYS.QUESTION_SET_DETAIL],
    messages: {
      successUpdate: formattedMessages.successUpdate,
      errorUpdate: formattedMessages.errorUpdate,
    },
  });

  const { handleActivate, handleDeactivate } = useActivationHandlers<QuestionSet>(
    activateQuestionSet,
    deactivateQuestionSet,
    onSuccess,
    onError,
  );

  const { filters, handleSortModelChange, handleFilterModelChange, handlePaginationModelChange } = useListingFilters();

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: filters.page,
    pageSize: filters.pageSize,
  });

  useEffect(() => {
    setPaginationModel({
      page: filters.page,
      pageSize: filters.pageSize,
    });
  }, [filters.page, filters.pageSize]);

  const {
    data: questionSets,
    isLoading,
    isError,
    error,
  } = useQuestionSetControllerFindAll(
    {
      sortBy: filters.sortBy as QuestionSetControllerFindAllSortBy,
      sortOrder: filters.sortOrder || 'desc',
      skip: filters.page * filters.pageSize,
      take: filters.pageSize,
      includeInActive: filters.includeInActive,
      title: filters?.title as string,
    },
    {
      query: {
        enabled,
        queryKey: [KEYS.QUESTION_SET_LISTING, filters],
      },
    },
  );

  const rowCount = useMemo(() => {
    return questionSets?.count;
  }, [questionSets?.count]);

  const columns: GridColDef[] = useMemo(
    () => [
      { field: 'title', headerName: formattedMessages.titleHeaderName, flex: 1 },
      {
        field: 'classLevel',
        headerName: formattedMessages.classLevelHeaderName,
        flex: 1,
        valueGetter: (value: QuestionSet['classLevel']) => value?.name || '-',
      },
      {
        field: 'session',
        headerName: formattedMessages.sessionHeaderName,
        flex: 1,
        valueGetter: (value: QuestionSet['session']) => value?.name || '-',
      },
      {
        field: 'questions',
        headerName: formattedMessages.questionsCountHeaderName,
        flex: 0.5,
        valueGetter: (value: QuestionSet['questions']) => value?.length || 0,
      },
      {
        field: 'actions',
        headerName: formattedMessages.actionsHeaderName,
        headerAlign: 'right',
        renderCell: (params) => (
          <RowActions
            onEdit={params.row.isActive ? () => route({ url: routes.questions.edit(params?.row?.id) }) : undefined}
            onActivate={params.row.isActive ? undefined : () => handleActivate(params.row)}
            onDeactivate={params.row.isActive ? () => handleDeactivate(params.row) : undefined}
            isLoading={
              (activateQuestionSet.isPending && activateQuestionSet.variables?.id === params.row.id) ||
              (deactivateQuestionSet.isPending && deactivateQuestionSet.variables?.id === params.row.id)
            }
          />
        ),
        width: 150,
        sortable: false,
        filterable: false,
      },
    ],
    [
      activateQuestionSet.isPending,
      activateQuestionSet.variables?.id,
      deactivateQuestionSet.isPending,
      deactivateQuestionSet.variables?.id,
      formattedMessages.actionsHeaderName,
      formattedMessages.titleHeaderName,
      formattedMessages.classLevelHeaderName,
      formattedMessages.sessionHeaderName,
      formattedMessages.questionsCountHeaderName,
      handleActivate,
      handleDeactivate,
      route,
    ],
  );

  return (
    <Stack>
      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {extractNetworkError(error)}
        </Alert>
      )}
      <DataTable<QuestionSet>
        pagination
        columns={columns}
        filterMode="server"
        sortingMode="server"
        paginationMode="server"
        filterDebounceMs={500}
        isLoading={isLoading}
        rows={questionSets?.data || []}
        getRowId={(row) => row?.id}
        rowCount={rowCount}
        pageSizeOptions={[10, 20, 50, 100]}
        onSortModelChange={handleSortModelChange}
        onFilterModelChange={handleFilterModelChange}
        onPaginationModelChange={handlePaginationModelChange}
        paginationModel={paginationModel}
        noDataFound={formattedMessages.noRowsLabel}
        rowClickUrl={(row) => (row.isActive ? `${routes.questions.detail(row?.id?.toString())}` : '')}
      />
    </Stack>
  );
}
