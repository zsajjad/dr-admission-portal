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
              '--SideNav-width': '248px',
              '--SideNav-zIndex': 1100,
              '--MobileNav-width': '280px',
              '--MobileNav-zIndex': 1100,
            },
            // Text marked as Urdu prefers the Urdu font, even for digits and punctuation
            '[lang="ur"], .font-urdu': {
              fontFamily: 'var(--font-urdu), var(--font-inter), serif !important',
            },
            'html[lang="ur"]': {
              direction: 'rtl',
            },
            // Nastaliq is tall: give Urdu lines more room so wrapped lines don't overlap
            'html[lang="ur"] .MuiTypography-root, html[lang="ur"] body': {
              lineHeight: 1.9,
            },
            // Chips clip their label; let Urdu letters reach above and below the line instead
            'html[lang="ur"] .MuiChip-root': {
              height: 'auto',
              minHeight: 24,
            },
            'html[lang="ur"] .MuiChip-label': {
              overflow: 'visible',
              lineHeight: 1.9,
            },
          }}
        />
        {children}
      </ThemeProvider>
    </EmotionCacheProvider>
  );
}
