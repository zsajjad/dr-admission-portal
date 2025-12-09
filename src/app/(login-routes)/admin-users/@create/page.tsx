'use client';

import { useCallback } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { Drawer } from '@mui/material';

import AdminUserForm from '@/domains/adminUsers/views/form';

export default function AdminUserCreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const showCreate = searchParams.get('create');

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  if (!showCreate) {
    return null;
  }

  return (
    <Drawer
      open={true}
      anchor="right"
      onClose={handleBack}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '100%', sm: 400, md: 500 },
          boxSizing: 'border-box',
          padding: 3,
        },
      }}
    >
      <AdminUserForm onClose={handleBack} onSuccess={handleBack} />
    </Drawer>
  );
}
