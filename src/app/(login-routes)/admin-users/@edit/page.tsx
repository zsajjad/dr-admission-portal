'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import { Drawer } from '@mui/material';

import AdminUserForm from '@/domains/adminUsers/views/form';

import { useAdminUsersControllerFindOne } from '@/providers/service/admin-users/admin-users';

export default function AdminUsersEditPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editItemKey = searchParams.get('edit');

  const { data: adminUserDetail, isLoading } = useAdminUsersControllerFindOne(editItemKey || '', {
    query: {
      enabled: !!editItemKey,
    },
  });
  const handleBack = () => {
    router.back();
  };

  if (!editItemKey || !adminUserDetail?.data?.id) {
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
      <AdminUserForm
        onClose={handleBack}
        onSuccess={handleBack}
        editItem={adminUserDetail?.data}
        isLoading={isLoading}
      />
    </Drawer>
  );
}
