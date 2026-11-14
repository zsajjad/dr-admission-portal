'use client';

import { useState } from 'react';

import Link from 'next/link';

import {
  Block as DeactivateIcon,
  Edit as EditIcon,
  Key as KeyIcon,
  Logout as LogoutIcon,
  PhonelinkErase as DiscardIcon,
  Print as PrintIcon,
  Restore as ReactivateIcon,
} from '@mui/icons-material';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import { Field } from '@/domains/students/components/Field';
import { SectionCard } from '@/domains/students/components/SectionCard';
import { cardStyle, formatDateTime } from '@/domains/students/utils';

import { DataNotFound } from '@/components/DataNotFound';
import { DetailSkeleton } from '@/components/Skeleton/DetailSkeleton';

import { StaffDeviceEntity, StaffLanguage, StaffUserDetail } from '@/providers/service/app.schemas';
import { useStaffUserControllerFindOne } from '@/providers/service/staff-user/staff-user';

import { FormattedMessage, useFormattedMessage } from '@/theme/FormattedMessage';

import { routes } from '@/router/routes';

import { extractNetworkError } from '@/utils/extractNetworkError';

import { RoleChips } from '../../components/RoleChips';
import { ActivationDialog } from '../../dialogs/ActivationDialog';
import { LoginCodeDialog } from '../../dialogs/LoginCodeDialog';
import { LogoutDialog } from '../../dialogs/LogoutDialog';
import { StaffUserDialog } from '../../dialogs/StaffUserDialog';
import messages from '../../messages';
import { codeStatusColor, codeStatusMessage, deviceState, ltr } from '../../utils';

type Dialog =
  | { kind: 'edit' | 'code' | 'activation' }
  | { kind: 'logout'; device?: StaffDeviceEntity; discardUnsent: boolean }
  | null;

/** One staff user: details, login code, phones, and every action on them */
export function StaffUserDetailView({ id }: { id: string }) {
  const notFound = useFormattedMessage(messages.notFound);
  const { data, isLoading, error } = useStaffUserControllerFindOne(id, { query: { enabled: !!id } });
  const [dialog, setDialog] = useState<Dialog>(null);
  const close = () => setDialog(null);

  if (isLoading) return <DetailSkeleton />;
  const user = data?.data;
  if (!user) {
    // @ts-expect-error error shape comes from the API
    if (!error || error?.statusCode === 404) return <DataNotFound notFoundMessage={notFound} />;
    return (
      <Alert severity="error" sx={{ borderRadius: 3 }}>
        <FormattedMessage {...messages.loadError} />: {extractNetworkError(error)}
      </Alert>
    );
  }

  const loggedIn = user.devices.filter((d) => deviceState(d) === 'loggedIn');
  const draining = user.devices.filter((d) => deviceState(d) === 'draining');

  return (
    <Stack spacing={2.5}>
      {!user.isActive && (
        <Alert severity="warning" sx={{ borderRadius: 3 }}>
          <FormattedMessage {...messages.deactivatedBanner} />
        </Alert>
      )}

      <Header user={user} onDialog={setDialog} />

      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 4 }}>
          <LoginCodeCard user={user} onIssue={() => setDialog({ kind: 'code' })} />
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <SectionCard
            title={<FormattedMessage {...messages.phones} />}
            actions={
              loggedIn.length + draining.length > 0 && (
                <Stack direction="row" spacing={1}>
                  {loggedIn.length > 0 && (
                    <Button
                      size="small"
                      variant="outlined"
                      color="warning"
                      startIcon={<LogoutIcon />}
                      onClick={() => setDialog({ kind: 'logout', discardUnsent: false })}
                    >
                      <FormattedMessage {...messages.logOutAll} />
                    </Button>
                  )}
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    startIcon={<DiscardIcon />}
                    onClick={() => setDialog({ kind: 'logout', discardUnsent: true })}
                  >
                    <FormattedMessage {...messages.logOutAllDiscard} />
                  </Button>
                </Stack>
              )
            }
          >
            <PhonesTable
              devices={user.devices}
              onLogout={(device, discardUnsent) => setDialog({ kind: 'logout', device, discardUnsent })}
            />
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                <FormattedMessage {...messages.logoutExplainTitle} />
              </Typography>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                <FormattedMessage {...messages.logoutExplain} />
              </Typography>
              <Typography variant="body2">
                <FormattedMessage {...messages.discardExplain} />
              </Typography>
            </Alert>
          </SectionCard>
        </Grid>
      </Grid>

      <StaffUserDialog open={dialog?.kind === 'edit'} user={user} onClose={close} />
      <LoginCodeDialog open={dialog?.kind === 'code'} user={user} onClose={close} />
      <ActivationDialog open={dialog?.kind === 'activation'} user={user} onClose={close} />
      <LogoutDialog
        open={dialog?.kind === 'logout'}
        user={user}
        device={dialog?.kind === 'logout' ? dialog.device : undefined}
        discardUnsent={dialog?.kind === 'logout' ? dialog.discardUnsent : false}
        onClose={close}
      />
    </Stack>
  );
}

function Header({ user, onDialog }: { user: StaffUserDetail; onDialog: (d: Dialog) => void }) {
  const initials = user.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');

  return (
    <Card sx={cardStyle}>
      <CardContent sx={{ p: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ md: 'flex-start' }}>
          <Avatar variant="rounded" sx={{ width: 72, height: 72, fontSize: 28, bgcolor: 'primary.main' }}>
            {initials}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {user.name}
              </Typography>
              <Chip
                label={user.staffId}
                variant="outlined"
                sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 16, letterSpacing: '0.08em' }}
              />
              <Chip
                size="small"
                color={user.isActive ? 'success' : 'default'}
                label={<FormattedMessage {...(user.isActive ? messages.active : messages.deactivated)} />}
              />
            </Stack>
            <Box sx={{ mt: 1 }}>
              <RoleChips roles={user.roles} />
            </Box>
            <Grid container spacing={2} sx={{ mt: 1.5 }}>
              <Grid size={{ xs: 6, md: 3 }}>
                <Field label={<FormattedMessage {...messages.phone} />} value={user.phone} dir="ltr" />
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <Field
                  label={<FormattedMessage {...messages.language} />}
                  value={
                    <FormattedMessage
                      {...(user.language === StaffLanguage.en ? messages.languageEn : messages.languageUr)}
                    />
                  }
                />
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <Field label={<FormattedMessage {...messages.activePhones} />} value={String(user.activeDevices)} />
              </Grid>
              <Grid size={{ xs: 6, md: 3 }}>
                <Field label={<FormattedMessage {...messages.createdAt} />} value={formatDateTime(user.createdAt)} />
              </Grid>
            </Grid>
          </Box>
          <Stack spacing={1} sx={{ flexShrink: 0, minWidth: 200 }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<KeyIcon />}
              disabled={!user.isActive}
              onClick={() => onDialog({ kind: 'code' })}
            >
              <FormattedMessage {...messages.issueLoginCode} />
            </Button>
            <Button variant="outlined" size="small" startIcon={<EditIcon />} onClick={() => onDialog({ kind: 'edit' })}>
              <FormattedMessage {...messages.edit} />
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<PrintIcon />}
              disabled={!user.isActive}
              component={Link}
              href={routes.staffUsers.cards([user.id])}
            >
              <FormattedMessage {...messages.printCard} />
            </Button>
            <Button
              variant="outlined"
              size="small"
              color={user.isActive ? 'error' : 'primary'}
              startIcon={user.isActive ? <DeactivateIcon /> : <ReactivateIcon />}
              onClick={() => onDialog({ kind: 'activation' })}
            >
              <FormattedMessage {...(user.isActive ? messages.deactivate : messages.reactivate)} />
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

function LoginCodeCard({ user, onIssue }: { user: StaffUserDetail; onIssue: () => void }) {
  const code = user.loginCode;
  return (
    <SectionCard
      title={<FormattedMessage {...messages.loginCode} />}
      summary={
        <Chip
          size="small"
          color={codeStatusColor(code.status)}
          label={<FormattedMessage {...codeStatusMessage(code.status)} />}
        />
      }
    >
      <Stack spacing={1}>
        {code.issuedAt && (
          <Typography variant="body2">
            <FormattedMessage {...messages.codeIssuedAt} values={{ time: ltr(formatDateTime(code.issuedAt)) }} />
            {code.status === 'OPEN' && code.expiresAt && (
              <>
                {', '}
                <FormattedMessage {...messages.codeExpiresAt} values={{ time: ltr(formatDateTime(code.expiresAt)) }} />
              </>
            )}
          </Typography>
        )}
        {code.status === 'OPEN' && code.attemptsLeft !== undefined && (
          <Typography variant="body2" color="text.secondary">
            <FormattedMessage {...messages.codeAttemptsLeft} values={{ count: String(code.attemptsLeft) }} />
          </Typography>
        )}
        <Typography variant="caption" color="text.secondary">
          <FormattedMessage {...messages.codeNote} />
        </Typography>
        <Box>
          <Button size="small" variant="outlined" startIcon={<KeyIcon />} disabled={!user.isActive} onClick={onIssue}>
            <FormattedMessage {...messages.issueLoginCode} />
          </Button>
        </Box>
      </Stack>
    </SectionCard>
  );
}

function PhonesTable({
  devices,
  onLogout,
}: {
  devices: StaffDeviceEntity[];
  onLogout: (device: StaffDeviceEntity, discardUnsent: boolean) => void;
}) {
  if (devices.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        <FormattedMessage {...messages.noPhones} />
      </Typography>
    );
  }
  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>
              <FormattedMessage {...messages.phoneLabel} />
            </TableCell>
            <TableCell>
              <FormattedMessage {...messages.activatedAt} />
            </TableCell>
            <TableCell>
              <FormattedMessage {...messages.lastSeenAt} />
            </TableCell>
            <TableCell>
              <FormattedMessage {...messages.phoneStatus} />
            </TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {devices.map((d) => {
            const state = deviceState(d);
            const revoked = formatDateTime(d.revokedAt);
            return (
              <TableRow key={d.id}>
                <TableCell sx={{ fontWeight: 600 }}>{d.label}</TableCell>
                <TableCell>{formatDateTime(d.activatedAt)}</TableCell>
                <TableCell>{formatDateTime(d.lastSeenAt)}</TableCell>
                <TableCell>
                  {state === 'loggedIn' && (
                    <Chip size="small" color="success" label={<FormattedMessage {...messages.phoneLoggedIn} />} />
                  )}
                  {state === 'draining' && (
                    <Typography variant="body2" color="warning.main">
                      <FormattedMessage
                        {...messages.phoneDraining}
                        values={{ time: ltr(revoked), until: ltr(formatDateTime(d.drainUntil)) }}
                      />
                    </Typography>
                  )}
                  {state === 'loggedOut' && (
                    <Typography variant="body2" color="text.secondary">
                      <FormattedMessage {...messages.phoneLoggedOut} values={{ time: ltr(revoked) }} />
                    </Typography>
                  )}
                  {state === 'discarded' && (
                    <Typography variant="body2" color="error.main">
                      <FormattedMessage {...messages.phoneDiscarded} values={{ time: ltr(revoked) }} />
                    </Typography>
                  )}
                  {d.revokeReason && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      {d.revokeReason}
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                  {state === 'loggedIn' && (
                    <Button size="small" color="warning" onClick={() => onLogout(d, false)}>
                      <FormattedMessage {...messages.logOut} />
                    </Button>
                  )}
                  {(state === 'loggedIn' || state === 'draining') && (
                    <Button size="small" color="error" onClick={() => onLogout(d, true)}>
                      <FormattedMessage {...messages.logOutDiscard} />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Box>
  );
}
