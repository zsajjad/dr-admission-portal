'use client';

import { useEffect, useMemo, useState } from 'react';

import { Alert, MenuItem, Stack, TextField } from '@mui/material';

import { useAdmissionsControllerUpdateClassLevel } from '@/providers/service/admissions/admissions';
import { Gender, StudentProfileAdmission } from '@/providers/service/app.schemas';
import { useClassLevelControllerFindAll } from '@/providers/service/class-level/class-level';

import { FormattedMessage } from '@/theme/FormattedMessage';

import { useProfileActions } from '../hooks/useProfileActions';
import messages from '../messages';

import { ProfileDialog } from './ProfileDialog';

interface ChangeClassDialogProps {
  open: boolean;
  studentId: string;
  gender: Gender;
  admission: StudentProfileAdmission;
  onClose: () => void;
}

/** Overrides the class level worked out from the birth date (PATCH /admissions/:id/class-level) */
export function ChangeClassDialog({ open, studentId, gender, admission, onClose }: ChangeClassDialogProps) {
  const { onSuccess, onError } = useProfileActions(studentId);
  const mutation = useAdmissionsControllerUpdateClassLevel();
  const { data: classLevels, isLoading } = useClassLevelControllerFindAll({ take: 100 }, { query: { enabled: open } });

  const options = useMemo(
    () =>
      (classLevels?.data || [])
        .filter((c) => c.gender === gender && c.isActive !== false)
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.age - b.age),
    [classLevels?.data, gender],
  );

  const [classLevelId, setClassLevelId] = useState(admission.classLevel.id);
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (open) {
      setClassLevelId(admission.classLevel.id);
      setReason('');
    }
  }, [open, admission.classLevel.id]);

  const handleSave = () => {
    if (classLevelId === admission.classLevel.id) {
      onClose();
      return;
    }
    mutation.mutate(
      { id: admission.id, data: { classLevelId, ...(reason.trim() && { reason: reason.trim() }) } },
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
      title={<FormattedMessage {...messages.classDialogTitle} values={{ session: admission.session.name }} />}
      onClose={onClose}
      onSubmit={handleSave}
      isSubmitting={mutation.isPending}
      maxWidth="xs"
    >
      <Stack spacing={2}>
        <Alert severity="info">
          <FormattedMessage {...messages.classDialogNote} />
        </Alert>
        <TextField
          select
          size="small"
          fullWidth
          disabled={isLoading}
          label={<FormattedMessage {...messages.classLevel} />}
          value={options.some((o) => o.id === classLevelId) ? classLevelId : ''}
          onChange={(e) => setClassLevelId(e.target.value)}
        >
          {options.map((c) => (
            <MenuItem key={c.id} value={c.id}>
              {c.name}
            </MenuItem>
          ))}
        </TextField>
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
