/**
 * A key field input component that fetches the key from database, to ensure that the key is unique.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';

import type { UseQueryResult } from '@tanstack/react-query';
import { snakeCase } from 'lodash';
import * as Yup from 'yup';

import { Key as KeyIcon } from '@mui/icons-material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { CircularProgress, IconButton, TextField, TextFieldProps, Tooltip } from '@mui/material';

import { useFormattedMessage } from '@/theme/FormattedMessage';

import { excludeSpecial } from '@/constants/regex';

import messages from './message';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyUseQueryHook<TData = unknown, TError = unknown> = (...args: any[]) => UseQueryResult<TData, TError>;

type HookReturnData<THook extends AnyUseQueryHook> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ReturnType<THook> extends UseQueryResult<infer TData, any> ? TData : never;

type QueryArgsBuilder<THook extends AnyUseQueryHook> = (
  value: string,
  context: { enabled: boolean; disabled: boolean; isValid: boolean },
) => Parameters<THook>;

interface KeyFieldProps<TItem, THook extends AnyUseQueryHook> extends TextFieldProps<'outlined'> {
  touched: boolean;
  value?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onViewLinkClick?: (item: any) => void;
  useKeyLookup: THook;
  buildQueryArgs: QueryArgsBuilder<THook>;
  selectMatchCount?: (data: HookReturnData<THook> | undefined) => number;
  selectMatchedItem?: (data: HookReturnData<THook> | undefined) => TItem | undefined;
  setError: (error?: string) => void;
  disabledLookup?: boolean;
  fieldLabel?: string;
}

type DefaultItem = unknown;
type DefaultHook = AnyUseQueryHook;

type ValidationStatus = 'loading' | 'matched' | 'success' | 'disabled' | 'invalid' | 'required';
type ValidationColor = 'primary' | 'error' | 'disabled';

export function KeyField<TItem = DefaultItem, THook extends AnyUseQueryHook = DefaultHook>({
  touched,
  value,
  onChange,
  helperText: helperTextProp,
  disabled,
  name,
  onViewLinkClick,
  useKeyLookup,
  buildQueryArgs,
  selectMatchCount,
  selectMatchedItem,
  setError,
  disabledLookup,
  fieldLabel,
  ...restProps
}: KeyFieldProps<TItem, THook>) {
  const [currentValue, setCurrentValue] = useState<string>(value ?? '');
  const [validationError, setValidationError] = useState<string | undefined>(undefined);

  const isQueryEnabled = useMemo(() => {
    if (disabledLookup) return false;
    return Boolean(currentValue) && !validationError && !disabled;
  }, [disabledLookup, currentValue, validationError, disabled]);

  const buildQueryArgsRef = useRef(buildQueryArgs);
  useEffect(() => {
    buildQueryArgsRef.current = buildQueryArgs;
  }, [buildQueryArgs]);

  const queryArgs = useMemo(() => {
    return buildQueryArgsRef.current(currentValue, {
      enabled: isQueryEnabled,
      disabled: Boolean(disabled),
      isValid: !validationError && Boolean(currentValue),
    });
  }, [currentValue, validationError, isQueryEnabled, disabled]);

  const queryResult = useKeyLookup(...queryArgs);

  const data = queryResult.data as HookReturnData<THook> | undefined;

  const matchCount = useMemo(() => {
    if (selectMatchCount) return selectMatchCount(data);

    if (data == null) return 0;

    if (typeof data === 'object') {
      if ('count' in (data as Record<string, unknown>)) {
        const count = (data as Record<string, unknown>).count;
        if (typeof count === 'number') return count;
      }

      if ('items' in (data as Record<string, unknown>)) {
        const items = (data as Record<string, unknown>).items;
        if (Array.isArray(items)) return items.length;
      }
    }

    if (Array.isArray(data)) return data.length;

    return data ? 1 : 0;
  }, [data, selectMatchCount]);

  const matchedItem = useMemo(() => {
    if (selectMatchedItem) return selectMatchedItem(data);

    if (data == null) return undefined;

    if (Array.isArray(data)) return (data[0] ?? undefined) as TItem | undefined;

    if (typeof data === 'object' && data !== null) {
      const items = (data as Record<string, unknown>).items;
      if (Array.isArray(items)) return (items[0] ?? undefined) as TItem | undefined;
    }

    return data as unknown as TItem;
  }, [data, selectMatchedItem]);

  useEffect(() => {
    setCurrentValue((prev) => {
      const next = value ?? '';
      return prev === next ? prev : next;
    });
  }, [value]);

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const nextValue = event.target.value;
      setCurrentValue(nextValue);
      onChange?.(event);
    },
    [onChange],
  );

  const validationStatus = useMemo<ValidationStatus>(() => {
    if (disabled) return 'disabled';
    if (!currentValue || currentValue.trim().length === 0) return 'required';
    if (validationError) return 'invalid';
    if (!disabledLookup && queryResult.isLoading) return 'loading';
    if (!disabledLookup && matchCount > 0) return 'matched';
    return 'success';
  }, [disabled, currentValue, validationError, disabledLookup, queryResult.isLoading, matchCount]);

  const validationColor = useMemo<ValidationColor>(() => {
    if (
      validationStatus === 'matched' ||
      validationStatus === 'invalid' ||
      validationStatus === 'required' ||
      restProps.error
    )
      return 'error';
    if (validationStatus === 'loading' || validationStatus === 'disabled') return 'disabled';
    return 'primary';
  }, [restProps.error, validationStatus]);

  const suggestedKey = useMemo(() => {
    const cleaned = snakeCase(currentValue);
    const onlyAllowed = cleaned
      .replace(/[^a-z0-9_]+/g, '_')
      .replace(/[_]+/g, '_')
      .replace(/^[_]+|[_]+$/g, '');
    return onlyAllowed || 'example-key';
  }, [currentValue]);

  // i18n
  const requiredMsg = useFormattedMessage(messages.required);
  const keyExistsMsg = useFormattedMessage(messages.keyAlreadyExists);
  const invalidMsg = useFormattedMessage({ ...messages.invalid, values: { suggestedKey } });
  const viewMsg = useFormattedMessage(messages.view);
  const KeyLengthMessage = useFormattedMessage({
    ...messages.lengthMsg,
    values: { fieldLabel: fieldLabel ?? 'Key' },
  });

  // Yup validation for current value
  const validationSchema = useMemo(() => {
    return Yup.string().required(requiredMsg).matches(excludeSpecial, invalidMsg).max(100, KeyLengthMessage);
  }, [requiredMsg, invalidMsg, KeyLengthMessage]);

  useEffect(() => {
    if (disabled) {
      setValidationError(undefined);
      return;
    }

    if (!currentValue || currentValue.trim().length === 0) {
      setValidationError(requiredMsg);
      return;
    }

    // Validate using Yup
    validationSchema
      .validate(currentValue)
      .then(() => setValidationError(undefined))
      .catch((err) => setValidationError(err?.message));
  }, [currentValue, disabled, invalidMsg, requiredMsg, validationSchema]);

  useEffect(() => {
    if (validationStatus === 'success' && currentValue !== value && onChange && name) {
      onChange({
        target: {
          name: name as string,
          value: currentValue,
        },
      } as ChangeEvent<HTMLInputElement>);
    }
  }, [validationStatus, currentValue, value, onChange, name]);

  const endAdornment = useMemo(() => {
    if (validationStatus === 'loading') return <CircularProgress size={20} />;
    if (validationStatus === 'matched')
      return (
        <Tooltip title={viewMsg} placement="top" arrow>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <IconButton size="small" onClick={() => onViewLinkClick?.(matchedItem as any)}>
            <OpenInNewIcon color={validationColor} />
          </IconButton>
        </Tooltip>
      );
    return undefined;
  }, [validationStatus, validationColor, onViewLinkClick, matchedItem, viewMsg]);

  const helperText = useMemo(() => {
    if (!touched) return helperTextProp;
    if (validationStatus === 'required') return requiredMsg;
    if (validationStatus === 'matched') return keyExistsMsg;
    if (validationStatus === 'invalid') return validationError;
    return helperTextProp;
  }, [touched, helperTextProp, validationStatus, requiredMsg, keyExistsMsg, validationError]);

  const error = useMemo(() => {
    return (
      validationStatus === 'matched' ||
      validationStatus === 'invalid' ||
      validationStatus === 'required' ||
      !!restProps.error
    );
  }, [validationStatus, restProps.error]);

  // Reflect validation status into parent form (e.g., Formik) to block submit
  useEffect(() => {
    if (validationStatus === 'required') {
      setError(requiredMsg);
      return;
    }

    if (!disabledLookup && validationStatus === 'matched') {
      setError(keyExistsMsg);
      return;
    }

    if (validationStatus === 'invalid') {
      setError(invalidMsg);
      return;
    }

    // Clear error for success/loading/disabled
    if (!disabledLookup) setError(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invalidMsg, keyExistsMsg, requiredMsg, validationStatus]);

  return (
    <TextField
      {...restProps}
      name={name}
      disabled={disabled}
      value={currentValue}
      onChange={handleChange}
      error={touched && error}
      helperText={touched && helperText}
      slotProps={{
        input: {
          startAdornment: <KeyIcon color={touched ? validationColor : 'disabled'} />,
          endAdornment: endAdornment,
        },
      }}
    />
  );
}
