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

// RTL locales configuration
const rtlLocales = ['ur', 'ar', 'fa', 'he'];

// Component to update document lang and dir attributes based on locale
function LocaleDocumentUpdater({ locale }: { locale: string }) {
  useEffect(() => {
    const isRtl = rtlLocales.includes(locale);

    // Update html lang attribute
    document.documentElement.lang = locale;

    // Update html dir attribute for RTL/LTR
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';

    return () => {
      // Reset to defaults on unmount
      document.documentElement.lang = 'en';
      document.documentElement.dir = 'ltr';
    };
  }, [locale]);

  return null;
}

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

  return (
    <RawIntlProvider value={intl}>
      <LocaleDocumentUpdater locale={locale} />
      {children}
    </RawIntlProvider>
  );
}
