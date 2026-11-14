'use client';

import { StaffUsersListing } from '@/domains/staffUsers/view/listing';

import { RequirePermission } from '@/components/RequirePermission';

import { Permission } from '@/providers/service/app.schemas';

export default function StaffUsersPage() {
  return (
    <RequirePermission anyOf={[Permission.staffmanage]}>
      <StaffUsersListing />
    </RequirePermission>
  );
}
