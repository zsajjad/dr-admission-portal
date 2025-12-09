/**
 * Admin Users Layout
 */

import * as React from 'react';

interface AdminUsersLayoutProps {
  children: React.ReactNode;
  create: React.ReactNode;
  edit: React.ReactNode;
}

export default async function AdminUsersLayout({ children, create, edit }: AdminUsersLayoutProps) {
  return (
    <React.Suspense fallback={<></>}>
      {children}
      {create}
      {edit}
    </React.Suspense>
  );
}
