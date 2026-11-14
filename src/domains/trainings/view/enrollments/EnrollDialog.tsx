'use client';

import { useEffect, useMemo, useState } from 'react';

import { useRouter } from 'next/navigation';

import { Search as SearchIcon } from '@mui/icons-material';
import { Alert, Box, Button, Chip, CircularProgress, MenuItem, Stack, TextField, Typography } from '@mui/material';

import { StaffRole } from '@/providers/service/app.schemas';
import { useStudentsControllerFindAll } from '@/providers/service/students/students';

import { FormattedMessage, useFormattedMessage } from '@/theme/FormattedMessage';

import { routes } from '@/router/routes';

import { useEnroll, useStudentTrainings } from '../../api/operations';
import { ActionDialog } from '../../components/ActionDialog';
import { StaffUserSelect } from '../../components/StaffUserSelect';
import { useNotify } from '../../components/useNotify';
import { formatPct } from '../../utils';

import messages from './messages';

interface EnrollDialogProps {
  open: boolean;
  onClose: () => void;
  /** Skip the GR lookup, e.g. from the student's trainings page */
  studentId?: string;
}

/**
 * Enroll a student by GR in this session. The trainings come from the catalog: every one required
 * for their age and gender that they haven't passed. Core answers NOTHING_REQUIRED when there are none.
 */
export function EnrollDialog({ open, onClose, studentId: givenStudentId }: EnrollDialogProps) {
  const router = useRouter();
  const notify = useNotify();
  const enroll = useEnroll();
  const enrolledText = useFormattedMessage(messages.enrolled);

  const [gr, setGr] = useState('');
  const [searchGr, setSearchGr] = useState('');
  const [trainerId, setTrainerId] = useState<string | null>(null);
  const [improveIds, setImproveIds] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    setGr('');
    setSearchGr('');
    setTrainerId(null);
    setImproveIds([]);
  }, [open]);

  const { data: found, isFetching: finding } = useStudentsControllerFindAll(
    { search: searchGr, take: 5 },
    { query: { enabled: !!searchGr && !givenStudentId } },
  );
  const student = useMemo(
    () => found?.data.find((s) => s.grNumber === searchGr) ?? (found?.data.length === 1 ? found.data[0] : undefined),
    [found, searchGr],
  );
  const studentId = givenStudentId ?? student?.id;
  const { student: trainings, isFetching: loading } = useStudentTrainings(open ? studentId : undefined);
  const improvable = trainings?.passed.filter((p) => p.improvable) ?? [];
  const nothingRequired = !!trainings && trainings.required.length === 0 && improveIds.length === 0;

  const handleSubmit = () => {
    if (!studentId) return;
    enroll.mutate(
      {
        studentId,
        ...(trainerId && { trainerStaffUserId: trainerId }),
        ...(improveIds.length && { improveTrainingIds: improveIds }),
      },
      {
        onSuccess: (res) => {
          notify.success(enrolledText);
          onClose();
          if (res?.data?.id) router.push(routes.trainings.enrollment(res.data.id));
        },
        onError: notify.error,
      },
    );
  };

  return (
    <ActionDialog
      open={open}
      title={<FormattedMessage {...messages.enrollTitle} />}
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={enroll.isPending}
      submitLabel={<FormattedMessage {...messages.enroll} />}
      submitDisabled={!studentId || nothingRequired}
    >
      <Stack spacing={2}>
        {!givenStudentId && (
          <Stack direction="row" spacing={1} alignItems="flex-start">
            <TextField
              size="small"
              fullWidth
              autoFocus
              label={<FormattedMessage {...messages.enrollGr} />}
              value={gr}
              onChange={(e) => setGr(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  setSearchGr(gr.trim());
                }
              }}
              slotProps={{ htmlInput: { dir: 'ltr' } }}
            />
            <Button
              variant="outlined"
              startIcon={finding ? <CircularProgress size={16} /> : <SearchIcon />}
              onClick={() => setSearchGr(gr.trim())}
              disabled={!gr.trim()}
            >
              <FormattedMessage {...messages.findStudent} />
            </Button>
          </Stack>
        )}
        {searchGr && !finding && !student && !givenStudentId && (
          <Alert severity="warning">
            <FormattedMessage {...messages.studentNotFound} />
          </Alert>
        )}
        {student && (
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'action.hover' }}>
            <Typography sx={{ fontWeight: 600 }}>{student.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {[student.grNumber, student.fatherName, student.branch?.code].filter(Boolean).join(' · ')}
            </Typography>
          </Box>
        )}
        {studentId && loading && <CircularProgress size={20} />}
        {trainings && (
          <Box>
            <Typography variant="caption" color="text.secondary">
              <FormattedMessage {...messages.requiredNow} values={{ age: String(trainings.age ?? '--') }} />
            </Typography>
            {nothingRequired ? (
              <Alert severity="info" sx={{ mt: 0.5 }}>
                <FormattedMessage {...messages.nothingRequired} />
              </Alert>
            ) : (
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 0.5 }}>
                {trainings.required.map((t) => (
                  <Chip key={t.trainingId} size="small" label={`${t.code} · ${t.name}`} />
                ))}
              </Stack>
            )}
          </Box>
        )}
        {improvable.length > 0 && (
          <TextField
            select
            size="small"
            label={<FormattedMessage {...messages.improvePasses} />}
            value={improveIds}
            onChange={(e) => setImproveIds(e.target.value as unknown as string[])}
            helperText={<FormattedMessage {...messages.improvePassesHelp} />}
            slotProps={{ select: { multiple: true } }}
          >
            {improvable.map((p) => (
              <MenuItem key={p.trainingId} value={p.trainingId}>
                {p.code} · {p.name} ({formatPct(p.scorePct)})
              </MenuItem>
            ))}
          </TextField>
        )}
        <StaffUserSelect
          role={StaffRole.TRAINER}
          label={<FormattedMessage {...messages.trainerOptional} />}
          value={trainerId}
          onChange={setTrainerId}
        />
      </Stack>
    </ActionDialog>
  );
}
