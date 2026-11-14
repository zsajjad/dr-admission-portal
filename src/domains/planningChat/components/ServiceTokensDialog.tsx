'use client';

import * as React from 'react';

import { useQueryClient } from '@tanstack/react-query';

import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';

import {
  getReportChatControllerListServiceTokensQueryKey,
  useReportChatControllerCreateServiceToken,
  useReportChatControllerListServiceTokens,
  useReportChatControllerRevokeServiceToken,
} from '@/providers/service/reports-chat/reports-chat';

import { FormattedMessage } from '@/theme/FormattedMessage';

import messages from '../messages';

/** Super admins: create and revoke tokens for the reports MCP server. A new token is shown once. */
export function ServiceTokensDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const { data } = useReportChatControllerListServiceTokens({ query: { enabled: open } });
  const create = useReportChatControllerCreateServiceToken();
  const revoke = useReportChatControllerRevokeServiceToken();
  const [name, setName] = React.useState('');
  const [daily, setDaily] = React.useState(200);
  const [perMinute, setPerMinute] = React.useState(20);
  const [newToken, setNewToken] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  // Revoking cuts a client off at once, so it takes a second click to confirm.
  const [confirmRevoke, setConfirmRevoke] = React.useState<string | null>(null);

  const refresh = () => queryClient.invalidateQueries({ queryKey: getReportChatControllerListServiceTokensQueryKey() });

  const handleCreate = async () => {
    setError(null);
    try {
      const res = await create.mutateAsync({
        data: { name: name.trim(), dailyCallLimit: daily, perMinuteLimit: perMinute },
      });
      setNewToken(res.token);
      setCopied(false);
      setName('');
      await refresh();
    } catch (e) {
      setError((e as { message?: string })?.message ?? 'Failed');
    }
  };

  const handleClose = () => {
    setNewToken(null);
    setConfirmRevoke(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <FormattedMessage {...messages.serviceTokensTitle} />
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            <FormattedMessage {...messages.serviceTokensHelp} />
          </Typography>
          {newToken ? (
            <Alert
              severity="warning"
              action={
                <Tooltip title={<FormattedMessage {...(copied ? messages.copied : messages.copy)} />}>
                  <IconButton
                    size="small"
                    onClick={() => {
                      void navigator.clipboard.writeText(newToken);
                      setCopied(true);
                    }}
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              }
            >
              <FormattedMessage {...messages.copyTokenNow} />
              <Box component="code" dir="ltr" sx={{ display: 'block', mt: 1, wordBreak: 'break-all' }}>
                {newToken}
              </Box>
            </Alert>
          ) : null}
          {error ? <Alert severity="error">{error}</Alert> : null}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
            <TextField
              size="small"
              label={<FormattedMessage {...messages.tokenName} />}
              value={name}
              onChange={(e) => setName(e.target.value)}
              inputProps={{ maxLength: 100 }}
              sx={{ flex: 1 }}
            />
            <TextField
              size="small"
              type="number"
              label={<FormattedMessage {...messages.dailyCallLimit} />}
              value={daily}
              onChange={(e) => setDaily(Number(e.target.value))}
              inputProps={{ min: 1, max: 5000 }}
              sx={{ width: 140 }}
            />
            <TextField
              size="small"
              type="number"
              label={<FormattedMessage {...messages.perMinuteLimit} />}
              value={perMinute}
              onChange={(e) => setPerMinute(Number(e.target.value))}
              inputProps={{ min: 1, max: 120 }}
              sx={{ width: 160 }}
            />
            <Button variant="contained" disabled={name.trim().length < 3 || create.isPending} onClick={handleCreate}>
              <FormattedMessage {...messages.createToken} />
            </Button>
          </Stack>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>
                  <FormattedMessage {...messages.tokenName} />
                </TableCell>
                <TableCell>
                  <FormattedMessage {...messages.tokenColumn} />
                </TableCell>
                <TableCell>
                  <FormattedMessage {...messages.dailyCallLimit} />
                </TableCell>
                <TableCell>
                  <FormattedMessage {...messages.perMinuteLimit} />
                </TableCell>
                <TableCell>
                  <FormattedMessage {...messages.lastUsed} />
                </TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {(data?.data ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Typography variant="body2" color="text.secondary">
                      <FormattedMessage {...messages.noTokens} />
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : null}
              {(data?.data ?? []).map((t) => (
                <TableRow key={t.id}>
                  <TableCell>{t.name}</TableCell>
                  <TableCell dir="ltr">
                    <code>{t.tokenPrefix}…</code>
                  </TableCell>
                  <TableCell>{t.dailyCallLimit}</TableCell>
                  <TableCell>{t.perMinuteLimit}</TableCell>
                  <TableCell>
                    {t.lastUsedAt ? new Date(t.lastUsedAt).toLocaleString() : <FormattedMessage {...messages.never} />}
                  </TableCell>
                  <TableCell align="right">
                    {t.revokedAt ? (
                      <Chip size="small" label={<FormattedMessage {...messages.revoked} />} />
                    ) : (
                      <Button
                        size="small"
                        color="error"
                        variant={confirmRevoke === t.id ? 'contained' : 'text'}
                        disabled={revoke.isPending}
                        sx={{ whiteSpace: 'nowrap' }}
                        onClick={async () => {
                          if (confirmRevoke !== t.id) {
                            setConfirmRevoke(t.id);
                            return;
                          }
                          setConfirmRevoke(null);
                          await revoke.mutateAsync({ id: t.id });
                          await refresh();
                        }}
                      >
                        <FormattedMessage {...(confirmRevoke === t.id ? messages.confirmRevoke : messages.revoke)} />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>
          <FormattedMessage {...messages.close} />
        </Button>
      </DialogActions>
    </Dialog>
  );
}
