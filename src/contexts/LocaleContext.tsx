'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LocaleContextType {
  locale: string;
  setLocale: (locale: string) => void;
  availableLocales: string[];
}

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
  const [locale, setLocale] = useState(initialLocale);
  const availableLocales = ['en', 'ur'];

  const value: LocaleContextType = {
    locale,
    setLocale,
    availableLocales,
  };

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
};
