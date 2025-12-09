import { useCallback, useMemo } from 'react';

import { FormikValues } from 'formik';

import { languages } from '@/constants/configs';

interface DeleteTranslationMutation<TId> {
  mutate: (
    variables: { id: TId; languageCode: string },
    options?: {
      onSuccess?: () => void;
      onError?: (error: unknown) => void;
      onSettled?: () => void;
    },
  ) => void;
  isPending?: boolean;
}

interface UseTranslationsFormProps<TId> {
  values: FormikValues;
  setFieldValue: (field: string, value: unknown) => void;
  requiredFields: string[];
  deleteTranslationMutation?: DeleteTranslationMutation<TId>;
  editItemId?: TId;
  setDeletingLangCode?: (langCode: string | null) => void;
  mutationSuccess?: () => void;
  mutationError?: (error: unknown) => void;
}

export function useTranslationsForm<TId>({
  values,
  setFieldValue,
  requiredFields,
  deleteTranslationMutation,
  editItemId,
  setDeletingLangCode,
  mutationSuccess,
  mutationError,
}: UseTranslationsFormProps<TId>) {
  const usedLangs = useMemo(() => {
    return values.translations?.map((t: { languageCode: string }) => t.languageCode) || [];
  }, [values.translations]);

  const availableLangs = useCallback(
    (index?: number) => {
      const currentLang = index !== undefined ? values.translations?.[index]?.languageCode : undefined;
      return languages.filter((lang) => lang.code === currentLang || !usedLangs.includes(lang.code)).map((l) => l.code);
    },
    [usedLangs, values.translations],
  );

  const hasAvailableLang = useMemo(() => availableLangs().length > 0, [availableLangs]);

  const canAddMore = useMemo(() => {
    const allFieldsFilled = values.translations?.every((t: Record<string, string>) =>
      ['languageCode', ...requiredFields].every((field) => !!t[field]),
    );
    return allFieldsFilled && hasAvailableLang;
  }, [values.translations, requiredFields, hasAvailableLang]);

  const addTranslation = useCallback(() => {
    if (!canAddMore) return;
    const newEntry = ['languageCode', ...requiredFields].reduce((acc, key) => ({ ...acc, [key]: '' }), { isNew: true });
    setFieldValue('translations', [...values.translations, newEntry]);
  }, [canAddMore, requiredFields, setFieldValue, values.translations]);

  const removeTranslation = useCallback(
    (index: number) => {
      const lang = values.translations?.[index]?.languageCode;
      if (lang === 'en' || values.translations.length === 1) return;
      setFieldValue(
        'translations',
        values.translations.filter((_: unknown, i: number) => i !== index),
      );
    },
    [setFieldValue, values.translations],
  );

  const handleDeleteTranslation = useCallback(
    (index: number) => {
      const langCode = values.translations[index]?.languageCode;
      const translation = values.translations[index];

      if (langCode === 'en' || values.translations.length === 1) return;

      if (translation.isNew) {
        removeTranslation(index);
        return;
      }

      if (editItemId !== undefined && deleteTranslationMutation && setDeletingLangCode) {
        setDeletingLangCode(langCode);
        deleteTranslationMutation.mutate(
          { id: editItemId, languageCode: langCode },
          {
            onSuccess: () => {
              mutationSuccess?.();
              removeTranslation(index);
              setDeletingLangCode(null);
            },
            onError: mutationError,
            onSettled: () => {
              setDeletingLangCode(null);
            },
          },
        );
      } else {
        removeTranslation(index);
      }
    },
    [
      deleteTranslationMutation,
      editItemId,
      mutationError,
      mutationSuccess,
      removeTranslation,
      setDeletingLangCode,
      values.translations,
    ],
  );

  return {
    usedLangs,
    hasAvailableLang,
    canAddMore,
    availableLangs,
    addTranslation,
    removeTranslation,
    handleDeleteTranslation,
  };
}
