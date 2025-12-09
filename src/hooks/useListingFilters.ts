/**
 * useListingFilters hook
 *
 * This hook is used to manage the filters for a listing page.
 * It provides a way to store the filters in the URL and to persist them across page reloads.
 *
 * @returns {Object} An object containing the filters and a function to update them.
 */

import { useCallback, useMemo } from 'react';

import { debounce } from 'lodash';
import qs from 'query-string';

import { GridFilterModel, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';

import { useQueryParams } from '@/router/useQueryParams';

interface FilterQuery {
  page: number;
  pageSize: number;
  sortOrder?: 'asc' | 'desc';
  includeInActive?: boolean;
  [key: string]: string | number | boolean | undefined;
}

const defaultPaginationModel = {
  pageSize: 10,
  page: 0,
};

interface ListingFilterHookReturn<T> {
  filters: FilterQuery & T;
  resetFilters: () => void;
  setFilter: (args: Record<string, string | number | boolean | undefined>) => void;
  handleSortModelChange: (model: GridSortModel) => void;
  handleFilterModelChange: (model: GridFilterModel) => void;
  handlePaginationModelChange: (model: GridPaginationModel) => void;
}

export const useListingFilters = <T>(): ListingFilterHookReturn<T> => {
  const { setParam, getAllParams, deleteParams, setNewParams } = useQueryParams();

  const filters = useMemo<FilterQuery & T>(() => {
    const parsedFilters = getAllParams();

    return {
      ...(parsedFilters as FilterQuery & T),
      page: Number(parsedFilters.page ?? defaultPaginationModel.page),
      pageSize: Number(parsedFilters.pageSize ?? defaultPaginationModel.pageSize),
    };
  }, [getAllParams]);

  const setFilter = useCallback(
    (args: Record<string, string | number | boolean | undefined>) => {
      const newFilters = { ...filters, ...args };

      // Remove undefined values if needed
      const filteredFilters = Object.entries(newFilters).reduce<Record<string, string | number | boolean | undefined>>(
        (acc, [key, value]) => {
          if (value !== undefined) {
            acc[key] = value;
          }
          return acc;
        },
        {},
      );

      setParam({
        scroll: false,
        replace: true,
        allParams: qs.stringify(filteredFilters),
      });
    },
    [filters, setParam],
  );

  const handleSortModelChange = useCallback(
    (model: GridSortModel) => {
      if (!model[0]) {
        setFilter({
          sortOrder: undefined,
          sortBy: undefined,
        });
        return;
      }
      setFilter({
        sortOrder: model[0].sort || 'asc',
        sortBy: model[0].field || 'id',
      });
    },
    [setFilter],
  );

  const resetFilters = useCallback(() => {
    deleteParams(Object.keys(filters)?.map((i) => i));
    setNewParams({ ...defaultPaginationModel, includeInActive: filters?.includeInActive });
  }, [deleteParams, filters, setNewParams]);

  const handlePaginationModelChange = useCallback(
    (model: GridPaginationModel) => {
      setFilter({
        page: model.page,
        pageSize: model.pageSize,
      });
    },
    [setFilter],
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSetFilter = useCallback(
    debounce((filterObj: Record<string, string | undefined>, hasValue: boolean) => {
      setFilter({
        ...filterObj,
        page: hasValue ? 0 : filters.page,
      });
    }, 500),
    [filters, setFilter],
  );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedResetFilter = useCallback(
    debounce(() => {
      resetFilters();
    }, 500),
    [filters, setFilter],
  );

  const handleFilterModelChange = useCallback(
    (model: GridFilterModel) => {
      // No filters at all → reset
      if (!model.items.length) {
        debouncedResetFilter();
        return;
      }

      // Build filter object (keep empty values instead of skipping them)
      const filterObj = model.items.reduce<Record<string, string | undefined>>((acc, item) => {
        acc[item.field] = item?.value;
        return acc;
      }, {});

      // Check if there is at least one "real" value
      const hasValue = Object.values(filterObj).some((v) => v !== undefined && v !== null && v !== '');

      // Apply filters and reset to first page
      debouncedSetFilter(filterObj, hasValue);
    },
    [debouncedResetFilter, debouncedSetFilter],
  );

  return {
    filters,
    setFilter,
    resetFilters,
    handleSortModelChange,
    handleFilterModelChange,
    handlePaginationModelChange,
  };
};
