'use client';

import { useEffect, useState } from 'react';

import { MenuItem, Stack, TextField } from '@mui/material';

import { StaffRole } from '@/providers/service/app.schemas';
import { useBranchControllerFindAll } from '@/providers/service/branch/branch';

import { FormattedMessage, useFormattedMessage } from '@/theme/FormattedMessage';

import { TestingWindow, useCreateWindow, useUpdateWindow } from '../../api/setup';
import { ActionDialog } from '../../components/ActionDialog';
import { StaffUserMultiSelect } from '../../components/StaffUserSelect';
import { useSessions } from '../../components/useCurrentSession';
import { useNotify } from '../../components/useNotify';
import common from '../../messages';
import { fromLocalInput, toLocalInput } from '../../utils';

import messages from './messages';

interface WindowDialogProps {
  open: boolean;
  onClose: () => void;
  /** Editing this window; a new one otherwise */
  window?: TestingWindow | null;
  defaultSessionId?: string;
}

const ALL = 'ALL';

/** Open a testing window for a session, one branch or all, and optionally only some testers */
export function WindowDialog({ open, onClose, window: editing, defaultSessionId }: WindowDialogProps) {
  const notify = useNotify();
  const create = useCreateWindow();
  const update = useUpdateWindow();
  const { sessions } = useSessions();
  const { data: branchesData } = useBranchControllerFindAll({ take: 100 });
  const branches = branchesData?.data ?? [];
  const required = useFormattedMessage(common.required);
  const afterOpening = useFormattedMessage(messages.closesBeforeOpens);
  const placeholder = useFormattedMessage(messages.namePlaceholder);

  const [sessionId, setSessionId] = useState('');
  const [name, setName] = useState('');
  const [branchId, setBranchId] = useState(ALL);
  const [opensAt, setOpensAt] = useState('');
  const [closesAt, setClosesAt] = useState('');
  const [testerIds, setTesterIds] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSessionId(editing?.sessionId ?? defaultSessionId ?? '');
    setName(editing?.name ?? '');
    setBranchId(editing?.branchId ?? ALL);
    setOpensAt(toLocalInput(editing?.opensAt));
    setClosesAt(toLocalInput(editing?.closesAt));
    setTesterIds(editing?.testerStaffUserIds ?? []);
    setSubmitted(false);
  }, [open, editing, defaultSessionId]);

  const opensIso = fromLocalInput(opensAt);
  const closesIso = fromLocalInput(closesAt);
  const orderError = !!closesIso && new Date(closesIso) <= new Date(opensIso ?? Date.now());
  const missing = { sessionId: !sessionId, name: !name.trim(), closesAt: !closesIso };
  const invalid = missing.sessionId || missing.name || missing.closesAt || orderError;
  const saving = create.isPending || update.isPending;

  const handleSubmit = () => {
    setSubmitted(true);
    if (invalid || !closesIso) return;
    const data = {
      sessionId,
      name: name.trim(),
      branchId: branchId === ALL ? null : branchId,
      ...(opensIso && { opensAt: opensIso }),
      closesAt: closesIso,
      testerStaffUserIds: testerIds,
    };
    const callbacks = {
      onSuccess: () => {
        notify.success();
        onClose();
      },
      onError: notify.error,
    };
    if (editing) update.mutate({ id: editing.id, data }, callbacks);
    else create.mutate(data, callbacks);
  };

  return (
    <ActionDialog
      open={open}
      title={<FormattedMessage {...(editing ? messages.editWindow : messages.newWindow)} />}
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={saving}
    >
      <Stack spacing={2}>
        <TextField
          select
          size="small"
          label={<FormattedMessage {...common.session} />}
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)}
          disabled={!!editing}
          error={submitted && missing.sessionId}
          helperText={submitted && missing.sessionId ? required : undefined}
        >
          {sessions.map((s) => (
            <MenuItem key={s.id} value={s.id}>
              {s.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          size="small"
          label={<FormattedMessage {...messages.name} />}
          placeholder={placeholder}
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={submitted && missing.name}
          helperText={submitted && missing.name ? required : undefined}
        />
        <TextField
          select
          size="small"
          label={<FormattedMessage {...common.branch} />}
          value={branchId}
          onChange={(e) => setBranchId(e.target.value)}
        >
          <MenuItem value={ALL}>
            <FormattedMessage {...common.allBranches} />
          </MenuItem>
          {branches.map((b) => (
            <MenuItem key={b.id} value={b.id}>
              {b.name}
            </MenuItem>
          ))}
        </TextField>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            type="datetime-local"
            size="small"
            fullWidth
            label={<FormattedMessage {...messages.opensAt} />}
            value={opensAt}
            onChange={(e) => setOpensAt(e.target.value)}
            helperText={<FormattedMessage {...messages.opensAtHelp} />}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            type="datetime-local"
            size="small"
            fullWidth
            label={<FormattedMessage {...messages.closesAt} />}
            value={closesAt}
            onChange={(e) => setClosesAt(e.target.value)}
            error={submitted && (missing.closesAt || orderError)}
            helperText={submitted && missing.closesAt ? required : orderError ? afterOpening : undefined}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Stack>
        <StaffUserMultiSelect
          role={StaffRole.TESTER}
          label={<FormattedMessage {...messages.testers} />}
          value={testerIds}
          onChange={setTesterIds}
          helperText={<FormattedMessage {...messages.testersHelp} />}
        />
      </Stack>
    </ActionDialog>
  );
}
