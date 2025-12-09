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
};

export const viewport = { width: 'device-width', initialScale: 1 } satisfies Viewport;

const interVariable = localFont({
  src: './fonts/PlusJakartaSans-VariableFont_wght.ttf',
  variable: '--font-inter', // Define a CSS variable name
  weight: '100 900', // Specify the range for the variable font
  display: 'swap',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={interVariable.variable}>
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
