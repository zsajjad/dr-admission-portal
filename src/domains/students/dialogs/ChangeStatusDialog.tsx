'use client';

import { useEffect, useState } from 'react';

import { MenuItem, Stack, TextField } from '@mui/material';

import { useAdmissionsControllerUpdateStatus } from '@/providers/service/admissions/admissions';
import { AdmissionStatus, StudentProfileAdmission } from '@/providers/service/app.schemas';

import { FormattedMessage, useFormattedMessage } from '@/theme/FormattedMessage';

import { useProfileActions } from '../hooks/useProfileActions';
import messages from '../messages';
import { admissionStatusMessage } from '../utils';

import { ProfileDialog } from './ProfileDialog';

interface ChangeStatusDialogProps {
  open: boolean;
  studentId: string;
  admission: StudentProfileAdmission;
  onClose: () => void;
}

/** Uses the existing PATCH /admissions/:id/status; rejection needs a reason */
export function ChangeStatusDialog({ open, studentId, admission, onClose }: ChangeStatusDialogProps) {
  const { onSuccess, onError } = useProfileActions(studentId);
  const mutation = useAdmissionsControllerUpdateStatus();
  const required = useFormattedMessage(messages.required);

  const [status, setStatus] = useState<AdmissionStatus>(admission.status);
  const [rejectedReason, setRejectedReason] = useState(admission.rejectedReason ?? '');
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (open) {
      setStatus(admission.status);
      setRejectedReason(admission.rejectedReason ?? '');
      setShowError(false);
    }
  }, [open, admission.status, admission.rejectedReason]);

  const isRejected = status === AdmissionStatus.REJECTED;

  const handleSave = () => {
    if (isRejected && !rejectedReason.trim()) {
      setShowError(true);
      return;
    }
    if (status === admission.status && (!isRejected || rejectedReason.trim() === (admission.rejectedReason ?? ''))) {
      onClose();
      return;
    }
    mutation.mutate(
      { id: admission.id, data: { status, ...(isRejected && { rejectedReason: rejectedReason.trim() }) } },
      {
        onSuccess: async () => {
          await onSuccess();
          onClose();
        },
        onError,
      },
    );
  };

  return (
    <ProfileDialog
      open={open}
      title={<FormattedMessage {...messages.statusDialogTitle} values={{ session: admission.session.name }} />}
      onClose={onClose}
      onSubmit={handleSave}
      isSubmitting={mutation.isPending}
      maxWidth="xs"
    >
      <Stack spacing={2}>
        <TextField
          select
          size="small"
          fullWidth
          label={<FormattedMessage {...messages.status} />}
          value={status}
          onChange={(e) => setStatus(e.target.value as AdmissionStatus)}
        >
          {Object.values(AdmissionStatus).map((s) => (
            <MenuItem key={s} value={s}>
              <FormattedMessage {...admissionStatusMessage(s)} />
            </MenuItem>
          ))}
        </TextField>
        {isRejected && (
          <TextField
            size="small"
            fullWidth
            required
            multiline
            minRows={2}
            label={<FormattedMessage {...messages.rejectedReason} />}
            value={rejectedReason}
            onChange={(e) => setRejectedReason(e.target.value)}
            error={showError && !rejectedReason.trim()}
            helperText={showError && !rejectedReason.trim() ? required : undefined}
          />
        )}
      </Stack>
    </ProfileDialog>
  );
}
