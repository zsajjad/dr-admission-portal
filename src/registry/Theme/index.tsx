'use client';

import * as React from 'react';

import CssBaseline from '@mui/material/CssBaseline';
import GlobalStyles from '@mui/material/GlobalStyles';
import { ThemeProvider } from '@mui/material/styles';

import { createTheme } from '@/theme/create-theme';

import { EmotionCacheProvider } from './_emotion_cache';

export interface ThemeProviderProps {
  children: React.ReactNode;
}

export function CustomThemeProvider({ children }: ThemeProviderProps): React.JSX.Element {
  const theme = React.useMemo(() => createTheme(), []);

  return (
    <EmotionCacheProvider options={{ key: 'mui' }}>
      <ThemeProvider disableTransitionOnChange theme={theme} defaultMode="light">
        <CssBaseline />
        <GlobalStyles
          styles={{
            body: {
              '--MainNav-height': '56px',
              '--MainNav-zIndex': 1000,
              '--SideNav-width': '220px',
              '--SideNav-zIndex': 1100,
              '--MobileNav-width': '280px',
              '--MobileNav-zIndex': 1100,
            },
            // Urdu font styles - apply to elements with lang="ur" attribute
            '[lang="ur"]': {
              fontFamily: 'var(--font-urdu), "Noto Nastaliq Urdu", serif !important',
              direction: 'rtl',
            },
            // Utility class for Urdu text
            '.font-urdu': {
              fontFamily: 'var(--font-urdu), "Noto Nastaliq Urdu", serif !important',
            },
            // RTL layout when document is in Urdu
            'html[lang="ur"]': {
              direction: 'rtl',
            },
            'html[lang="ur"] body': {
              fontFamily: 'var(--font-urdu), "Noto Nastaliq Urdu", serif',
            },
          }}
        />
        {children}
      </ThemeProvider>
    </EmotionCacheProvider>
  );
}
