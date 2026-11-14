'use client';

import { useEffect, useState } from 'react';

import { useIntl } from 'react-intl';

import { Alert, MenuItem, Stack, TextField, Typography } from '@mui/material';

import { ProfileDialog } from '@/domains/students/dialogs/ProfileDialog';

import { Section } from '@/providers/service/app.schemas';
import { useSectionControllerAssign } from '@/providers/service/section/section';

import { FormattedMessage } from '@/theme/FormattedMessage';

import { useSectionActions } from '../hooks/useSectionActions';
import { useAllSections } from '../hooks/useSectionData';
import messages from '../messages';

interface MoveDialogProps {
  open: boolean;
  section: Section;
  admissionIds: string[];
  onClose: () => void;
  onDone: () => void;
}

/** Move students to another open section of the same class level */
export function MoveDialog({ open, section, admissionIds, onClose, onDone }: MoveDialogProps) {
  const assign = useSectionControllerAssign();
  const { onSuccess, onError } = useSectionActions();
  const intl = useIntl();
  const { data: sections } = useAllSections({
    sessionId: section.sessionId,
    branchId: section.branchId,
    classLevelId: section.classLevelId,
  });
  const targets = (sections || []).filter((s) => s.id !== section.id && s.isActive);
  const [target, setTarget] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (open) {
      setTarget('');
      setReason('');
    }
  }, [open]);

  const handleSubmit = () => {
    if (!target) return;
    assign.mutate(
      { id: target, data: { admissionIds, ...(reason.trim() ? { reason: reason.trim() } : {}) } },
      {
        onSuccess: async (res) => {
          await onSuccess(intl.formatMessage(messages.placed, { assigned: res.assigned, moved: res.moved }));
          onDone();
          onClose();
        },
        onError,
      },
    );
  };

  return (
    <ProfileDialog
      open={open}
      title={<FormattedMessage {...messages.moveTitle} values={{ count: String(admissionIds.length) }} />}
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={assign.isPending}
      maxWidth="xs"
    >
      <Stack spacing={2}>
        <Typography variant="body2" color="text.secondary">
          <FormattedMessage {...messages.moveHint} />
        </Typography>
        {targets.length === 0 ? (
          <Alert severity="info">
            <FormattedMessage {...messages.noOtherSections} />
          </Alert>
        ) : (
          <TextField
            select
            size="small"
            fullWidth
            required
            label={<FormattedMessage {...messages.moveTarget} />}
            value={target}
            onChange={(e) => setTarget(e.target.value)}
          >
            {targets.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.displayName} · {s.studentCount}
              </MenuItem>
            ))}
          </TextField>
        )}
        <TextField
          size="small"
          fullWidth
          label={<FormattedMessage {...messages.reasonOptional} />}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </Stack>
    </ProfileDialog>
  );
}
