import type { Metadata, Viewport } from 'next';

import localFont from 'next/font/local';

import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';

import { ErrorBoundary, SimpleErrorFallback } from '@/components/ErrorBoundary';

import { DatePickerProvider } from '@/registry/DatePicker';
import { IntlRegistry } from '@/registry/Intl';
import { ReactQueryRegistry } from '@/registry/ReactQuery';
import { CustomThemeProvider } from '@/registry/Theme';

import { AuthContextProvider } from '@/contexts/AuthContext';
import { LocaleProvider } from '@/contexts/LocaleContext';
import { SessionContext } from '@/contexts/SessionContext';
import { SnackbarContextProvider } from '@/contexts/SnackbarContext';

import { config } from '@/config';

export const metadata: Metadata = {
  title: {
    template: `%s | ${config.site.name}`,
    default: config.site.name,
  },
  description: config.site.description,
  applicationName: config.site.name,
  // Same icons as the public website (favicon.ico is app/favicon.ico).
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-96x96.png', type: 'image/png', sizes: '96x96' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  // Staff tools are not for search engines.
  robots: { index: false, follow: false },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: config.site.themeColor,
} satisfies Viewport;

const interVariable = localFont({
  src: './fonts/PlusJakartaSans-VariableFont_wght.ttf',
  variable: '--font-inter', // Define a CSS variable name
  weight: '100 900', // Specify the range for the variable font
  display: 'swap',
  // No metric-matched Arial stand-in: Arial has Arabic letters, so it would catch Urdu text
  // before the Urdu font further down the font stack.
  adjustFontFallback: false,
});

// Urdu: Noto Nastaliq Urdu (SIL Open Font License), the Arabic-script subset from Google Fonts,
// weights 400-700. It sits after the Latin font in the theme's font stack, so Urdu letters use it in
// both locales. Not preloaded: with the unicode-range below, the browser fetches it only when a page
// has Urdu text.
const notoNastaliqUrdu = localFont({
  src: '../assets/fonts/NotoNastaliqUrdu-Arabic.woff2',
  variable: '--font-urdu',
  weight: '400 700',
  display: 'swap',
  preload: false,
  adjustFontFallback: false,
  declarations: [
    {
      prop: 'unicode-range',
      value:
        'U+0600-06FF, U+0750-077F, U+0870-08FF, U+200C-200E, U+2010-2011, U+204F, U+2E41, U+FB50-FDFF, U+FE70-FEFC',
    },
  ],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${interVariable.variable} ${notoNastaliqUrdu.variable}`}>
      <head></head>
      <body>
        <ErrorBoundary fallback={<SimpleErrorFallback />}>
          <SessionContext>
            <LocaleProvider>
              <DatePickerProvider>
                <SnackbarContextProvider>
                  <AppRouterCacheProvider>
                    <ReactQueryRegistry>
                      <CustomThemeProvider>
                        <IntlRegistry>
                          <AuthContextProvider>{children}</AuthContextProvider>
                        </IntlRegistry>
                      </CustomThemeProvider>
                    </ReactQueryRegistry>
                  </AppRouterCacheProvider>
                </SnackbarContextProvider>
              </DatePickerProvider>
            </LocaleProvider>
          </SessionContext>
        </ErrorBoundary>
      </body>
    </html>
  );
}
