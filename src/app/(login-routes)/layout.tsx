import * as React from 'react';

import { LayoutSkeleton } from '@/components/Layout';

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <React.Suspense fallback={<></>}>
      <LayoutSkeleton>{children}</LayoutSkeleton>
    </React.Suspense>
  );
}
