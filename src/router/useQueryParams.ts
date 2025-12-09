'use client';

import { useCallback } from 'react';

import qs from 'query-string';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export const useQueryParams = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = new URLSearchParams(searchParams.toString());

  const setParam = useCallback(
    ({
      newParams,
      allParams,
      replace,
      scroll = true,
    }: {
      newParams?: { [key: string]: string | boolean };
      allParams?: string;
      replace?: boolean;
      scroll?: boolean;
    }) => {
      let stringQuery;
      if (!allParams) {
        const oldParams = qs.parse(searchParams.toString());
        stringQuery = qs.stringify({ ...oldParams, ...newParams }, { arrayFormat: 'bracket' });
      } else {
        stringQuery = allParams;
      }
      if (replace) {
        router.replace(`${pathname}?${stringQuery}`, { scroll });
        return;
      }
      route({ param: stringQuery, scroll });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pathname, searchParams],
  );

  const setNewParams = useCallback(
    (newParams: { [key: string]: string | number | boolean | undefined }) => {
      // resetParams();
      // params.set(name, value);
      const stringQuery = qs.stringify(newParams);
      route({ param: stringQuery });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const getAllParams = useCallback(() => {
    const allParams = qs.parse(searchParams?.toString(), { arrayFormat: 'bracket' });
    return allParams || {};
  }, [searchParams]);

  const deleteParams = useCallback(
    (keys: string[]) => {
      if (keys) {
        const oldParams = qs.parse(searchParams.toString());
        keys.forEach((key) => {
          delete oldParams[key];
        });
        const stringQuery = qs.stringify({ ...oldParams });
        router.replace(`${pathname}${stringQuery ? `?${stringQuery}` : ''}`, { scroll: false });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchParams],
  );

  const getParam = ({ name }: { name: string }) => {
    return params.get(name);
  };

  const route = useCallback(
    ({ url, param, scroll = true }: { url?: string; param?: string | null; scroll?: boolean }) => {
      const path = url || pathname;
      const fullPath = param ? `${path}?${param}` : path;
      router.push(fullPath, { scroll });
    },
    [pathname, router],
  );

  return { setParam, setNewParams, getParam, getAllParams, route, deleteParams };
};
