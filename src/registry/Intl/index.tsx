'use client';

import { useState, useEffect } from 'react';

import merge from 'lodash/merge';
import { RawIntlProvider, createIntl, createIntlCache } from 'react-intl';

import { useLocale } from '@/contexts/LocaleContext';

import messages from '@/translations/en.json';
import urMessages from '@/translations/ur.json';

const cache = createIntlCache();

// Available locales
const availableLocales = {
  en: messages,
  ur: urMessages,
};

export function IntlRegistry({
  children,
  customMessages,
}: {
  children: React.ReactNode;
  customMessages?: Record<string, Record<string, string>>;
}) {
  const { locale } = useLocale();

  const [intl, setIntl] = useState(() => {
    const messagesForLocale = availableLocales[locale as keyof typeof availableLocales] || availableLocales.en;
    return createIntl(
      {
        locale,
        messages: merge(messagesForLocale, (customMessages ? customMessages?.[locale] : {}) || {}),
      },
      cache,
    );
  });

  useEffect(() => {
    const messagesForLocale = availableLocales[locale as keyof typeof availableLocales] || availableLocales.en;
    const newIntl = createIntl(
      {
        locale,
        messages: merge(messagesForLocale, (customMessages ? customMessages?.[locale] : {}) || {}),
      },
      cache,
    );
    setIntl(newIntl);
  }, [locale, customMessages]);

  return <RawIntlProvider value={intl}>{children}</RawIntlProvider>;
}
