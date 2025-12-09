import { Stack } from '@mui/material';

import Heading from '@/domains/adminUsers/component/Heading';
import AdminUsersListing from '@/domains/adminUsers/views/listing';

const AdminUsersPage = () => {
  return (
    <Stack>
      <Heading showAddButton showIncludeInActive />
      <AdminUsersListing />
    </Stack>
  );
};

export default AdminUsersPage;
