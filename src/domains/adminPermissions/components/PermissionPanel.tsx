'use client';

import { useMemo, useState } from 'react';

import Link from 'next/link';

import { Alert, Box, Button, Checkbox, Chip, Divider, Stack, Typography, alpha } from '@mui/material';

import { cardStyle, formatDate } from '@/domains/students/utils';

import { AdminUserWithPermissions, PermissionDefinition, RoleName } from '@/providers/service/app.schemas';

import { FormattedMessage } from '@/theme/FormattedMessage';

import { usePermissions } from '@/hooks/usePermissions';

import { SaveDialog } from '../dialogs/SaveDialog';
import messages from '../messages';
import { groupCatalogue, permissionMessages } from '../permissionGroups';

import { RoleChip } from './RoleChip';

interface PermissionPanelProps {
  user: AdminUserWithPermissions;
  catalogue: PermissionDefinition[];
  /** Link to this admin's permission changes in the audit log, when the viewer can read it */
  historyHref?: string;
}

/** One admin's permissions as grouped checkboxes: where each comes from, and changes to save. */
export function PermissionPanel({ user, catalogue, historyHref }: PermissionPanelProps) {
  const { isSuperAdmin: viewerIsSuperAdmin } = usePermissions();
  const fromRole = user.role === RoleName.SUPER_ADMIN;
  const granted = useMemo(() => new Map(user.grants.map((g) => [g.permission as string, g])), [user.grants]);
  const [ticked, setTicked] = useState<Set<string>>(() => new Set(user.grants.map((g) => g.permission)));
  const [saving, setSaving] = useState(false);

  const descriptions = useMemo(() => new Map(catalogue.map((c) => [c.code as string, c.description])), [catalogue]);
  const groups = useMemo(() => groupCatalogue(catalogue.map((c) => c.code)), [catalogue]);

  const toGrant = [...ticked].filter((p) => !granted.has(p));
  const toRevoke = [...granted.keys()].filter((p) => !ticked.has(p));
  const dirty = toGrant.length + toRevoke.length;
  const editable = viewerIsSuperAdmin && !fromRole;

  const toggle = (code: string) =>
    setTicked((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });

  return (
    <Box sx={{ ...cardStyle, bgcolor: 'background.paper', p: 2.5 }}>
      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {user.name}
        </Typography>
        <RoleChip role={user.role} />
        <Box sx={{ flex: 1 }} />
        {historyHref && (
          <Button component={Link} href={historyHref} size="small">
            <FormattedMessage {...messages.history} />
          </Button>
        )}
      </Stack>
      <Typography variant="body2" color="text.secondary">
        {user.email}
      </Typography>

      {fromRole && (
        <Alert severity="info" sx={{ mt: 2 }}>
          <FormattedMessage {...messages.superAdminNote} />
        </Alert>
      )}
      {!user.isActive && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          <FormattedMessage {...messages.deactivatedNote} />
        </Alert>
      )}

      {groups.map((group) => (
        <Box key={group.key} sx={{ mt: 2.5 }}>
          <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 600 }}>
            <FormattedMessage {...messages[group.title]} />
          </Typography>
          <Divider sx={{ mb: 0.5 }} />
          {group.codes.map((code) => {
            const known = permissionMessages(code);
            const grant = granted.get(code);
            const on = fromRole || ticked.has(code);
            const adding = !fromRole && ticked.has(code) && !grant;
            const removing = !fromRole && !ticked.has(code) && !!grant;
            return (
              <Stack
                key={code}
                direction="row"
                spacing={1}
                alignItems="flex-start"
                component="label"
                sx={{
                  py: 1,
                  px: 0.5,
                  borderRadius: 2,
                  cursor: editable ? 'pointer' : 'default',
                  bgcolor: (t) =>
                    adding
                      ? alpha(t.palette.success.main, 0.08)
                      : removing
                        ? alpha(t.palette.error.main, 0.08)
                        : undefined,
                }}
              >
                <Checkbox
                  size="small"
                  checked={on}
                  disabled={!editable}
                  onChange={() => toggle(code)}
                  sx={{ mt: -0.5 }}
                  slotProps={{ input: { 'aria-label': code } }}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {known ? <FormattedMessage {...known.name} /> : code}
                    </Typography>
                    <Typography variant="caption" color="text.disabled" sx={{ fontFamily: 'monospace' }}>
                      {code}
                    </Typography>
                    {fromRole && (
                      <Chip
                        size="small"
                        color="primary"
                        variant="outlined"
                        label={<FormattedMessage {...messages.fromRole} />}
                      />
                    )}
                    {adding && (
                      <Chip size="small" color="success" label={<FormattedMessage {...messages.willGrant} />} />
                    )}
                    {removing && (
                      <Chip size="small" color="error" label={<FormattedMessage {...messages.willRemove} />} />
                    )}
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    {known ? <FormattedMessage {...known.hint} /> : descriptions.get(code)}
                  </Typography>
                  {grant && !removing && (
                    <Typography variant="caption" color="text.secondary">
                      {grant.grantedByName ? (
                        <FormattedMessage
                          {...messages.grantedBy}
                          values={{ name: grant.grantedByName, date: formatDate(grant.grantedAt) }}
                        />
                      ) : (
                        <FormattedMessage {...messages.grantedOn} values={{ date: formatDate(grant.grantedAt) }} />
                      )}
                    </Typography>
                  )}
                </Box>
              </Stack>
            );
          })}
        </Box>
      ))}

      {editable && dirty > 0 && (
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          sx={{
            position: 'sticky',
            bottom: 16,
            mt: 3,
            p: 1.5,
            borderRadius: 3,
            bgcolor: 'background.paper',
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
          }}
        >
          <Typography variant="body2" sx={{ flex: 1 }}>
            <FormattedMessage {...messages.changes} values={{ count: String(dirty) }} />
          </Typography>
          <Button onClick={() => setTicked(new Set(granted.keys()))}>
            <FormattedMessage {...messages.discard} />
          </Button>
          <Button variant="contained" onClick={() => setSaving(true)}>
            <FormattedMessage {...messages.save} />
          </Button>
        </Stack>
      )}

      <SaveDialog open={saving} user={user} toGrant={toGrant} toRevoke={toRevoke} onClose={() => setSaving(false)} />
    </Box>
  );
}
