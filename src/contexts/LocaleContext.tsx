'use client';

import React, { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';

interface LocaleContextType {
  locale: string;
  setLocale: (locale: string) => void;
  availableLocales: string[];
}

const LOCALE_STORAGE_KEY = 'portal.locale';

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export const useLocale = (): LocaleContextType => {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
};

interface LocaleProviderProps {
  children: ReactNode;
  initialLocale?: string;
}

export const LocaleProvider: React.FC<LocaleProviderProps> = ({ children, initialLocale = 'en' }) => {
  const [locale, setLocaleState] = useState(initialLocale);
  const availableLocales = ['en', 'ur'];

  // Remember the admin's language on this browser
  useEffect(() => {
    const saved = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (saved && saved !== initialLocale && ['en', 'ur'].includes(saved)) setLocaleState(saved);
  }, [initialLocale]);

  const setLocale = useCallback((next: string) => {
    setLocaleState(next);
    window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
  }, []);

  const value: LocaleContextType = {
    locale,
    setLocale,
    availableLocales,
  };

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
};
