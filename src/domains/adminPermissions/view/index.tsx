'use client';

import { useMemo, useState } from 'react';

import { useIntl } from 'react-intl';

import { Search as SearchIcon } from '@mui/icons-material';
import {
  Alert,
  Box,
  Chip,
  FormControlLabel,
  Grid,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  Skeleton,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';

import { cardStyle } from '@/domains/students/utils';

import { PageHeading } from '@/components/PageHeading';

import {
  useAdminPermissionControllerListCatalogue,
  useAdminPermissionControllerListUsers,
} from '@/providers/service/admin-permission/admin-permission';
import { AdminUserWithPermissions, RoleName } from '@/providers/service/app.schemas';

import { FormattedMessage } from '@/theme/FormattedMessage';

import { useListingFilters } from '@/hooks/useListingFilters';

import { extractNetworkError } from '@/utils/extractNetworkError';

import { PermissionPanel } from '../components/PermissionPanel';
import { RoleChip } from '../components/RoleChip';
import messages from '../messages';

/**
 * Super admins see every admin with their role and permissions, and grant or remove them.
 * Core writes every change to the audit log.
 */
export function AdminPermissionsView() {
  const intl = useIntl();
  const { filters, setFilter } = useListingFilters<{ user?: string }>();
  const [search, setSearch] = useState('');
  const [showDeactivated, setShowDeactivated] = useState(false);

  const users = useAdminPermissionControllerListUsers({ includeInActive: showDeactivated });
  const catalogue = useAdminPermissionControllerListCatalogue({ query: { staleTime: 10 * 60 * 1000 } });

  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (users.data?.data || []).filter(
      (u) => !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
    );
  }, [users.data?.data, search]);

  const selected: AdminUserWithPermissions | undefined = (users.data?.data || []).find(
    (u) => u.adminUserId === filters.user,
  );

  return (
    <Stack>
      <PageHeading heading={messages.title} />
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        <FormattedMessage {...messages.intro} />
      </Typography>

      {(users.isError || catalogue.isError) && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {extractNetworkError(users.error || catalogue.error) || <FormattedMessage {...messages.loadFailed} />}
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ ...cardStyle, bgcolor: 'background.paper', p: 2 }}>
            <TextField
              size="small"
              fullWidth
              placeholder={intl.formatMessage(messages.search)}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <FormControlLabel
              sx={{ mt: 1 }}
              control={
                <Switch size="small" checked={showDeactivated} onChange={(e) => setShowDeactivated(e.target.checked)} />
              }
              label={
                <Typography variant="body2">
                  <FormattedMessage {...messages.showDeactivated} />
                </Typography>
              }
            />
            {users.isLoading ? (
              <Stack spacing={1} sx={{ mt: 1 }}>
                {[0, 1, 2, 3].map((i) => (
                  <Skeleton key={i} variant="rounded" height={56} />
                ))}
              </Stack>
            ) : list.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                <FormattedMessage {...messages.noAdmins} />
              </Typography>
            ) : (
              <List dense disablePadding sx={{ mt: 1 }}>
                {list.map((u) => (
                  <ListItemButton
                    key={u.adminUserId}
                    selected={u.adminUserId === filters.user}
                    onClick={() => setFilter({ user: u.adminUserId })}
                    sx={{ borderRadius: 2, mb: 0.5, alignItems: 'flex-start' }}
                  >
                    <ListItemText
                      primary={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                            {u.name}
                          </Typography>
                          <RoleChip role={u.role} />
                          {!u.isActive && <Chip size="small" label={<FormattedMessage {...messages.deactivated} />} />}
                        </Stack>
                      }
                      secondary={
                        <>
                          <Typography component="span" variant="caption" color="text.secondary" display="block" noWrap>
                            {u.email}
                          </Typography>
                          <Typography component="span" variant="caption" color="text.secondary">
                            {u.role === RoleName.SUPER_ADMIN ? (
                              <FormattedMessage {...messages.allPermissions} />
                            ) : (
                              <FormattedMessage
                                {...messages.permissionCount}
                                values={{ count: String(u.effective.length) }}
                              />
                            )}
                          </Typography>
                        </>
                      }
                    />
                  </ListItemButton>
                ))}
              </List>
            )}
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          {selected && catalogue.data ? (
            <PermissionPanel key={selected.adminUserId} user={selected} catalogue={catalogue.data.data} />
          ) : (
            <Box sx={{ ...cardStyle, bgcolor: 'background.paper', p: 3 }}>
              <Typography variant="body2" color="text.secondary">
                <FormattedMessage {...messages.pickAdmin} />
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>
    </Stack>
  );
}
