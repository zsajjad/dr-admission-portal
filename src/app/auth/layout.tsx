import * as React from 'react';

import { Layout } from '@/domains/auth/Layout';

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <React.Suspense fallback={<></>}>
      <Layout>{children}</Layout>
    </React.Suspense>
  );
}
