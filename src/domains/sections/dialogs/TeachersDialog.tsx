'use client';

import { useEffect, useMemo, useState } from 'react';

import { Add as AddIcon, Close as RemoveIcon } from '@mui/icons-material';
import { Alert, Autocomplete, Button, IconButton, MenuItem, Stack, TextField, Typography } from '@mui/material';

import { useAllStaffUsers } from '@/domains/staffUsers/hooks/useAllStaffUsers';
import { ProfileDialog } from '@/domains/students/dialogs/ProfileDialog';

import { Section, SectionTeacherRole, StaffRole, StaffUserEntity } from '@/providers/service/app.schemas';
import { useSectionControllerSetTeachers } from '@/providers/service/section/section';

import { FormattedMessage, useFormattedMessage } from '@/theme/FormattedMessage';

import { useSectionActions } from '../hooks/useSectionActions';
import messages from '../messages';

interface Row {
  staffUserId: string;
  role: SectionTeacherRole;
}

const ROLES: SectionTeacherRole[] = [SectionTeacherRole.CLASS_TEACHER, SectionTeacherRole.ASSISTANT];

/** Replace the section's teachers: each with a role, class teacher or assistant */
export function TeachersDialog({ open, section, onClose }: { open: boolean; section: Section; onClose: () => void }) {
  const setTeachers = useSectionControllerSetTeachers();
  const { onSuccess, onError } = useSectionActions();
  const { data: staff, isLoading } = useAllStaffUsers({ role: StaffRole.TEACHER }, { enabled: open });
  const [rows, setRows] = useState<Row[]>([]);
  const [reason, setReason] = useState('');
  const teacherLabel = useFormattedMessage(messages.teacher);
  const inactiveLabel = useFormattedMessage(messages.teacherInactive);

  useEffect(() => {
    if (!open) return;
    setRows(section.teachers.map((t) => ({ staffUserId: t.staffUserId, role: t.role })));
    setReason('');
  }, [open, section.teachers]);

  // Current teachers who are no longer active teachers can still be picked, so the list can be saved as it is
  const options = useMemo(() => {
    const list: StaffUserEntity[] = [...(staff || [])];
    for (const t of section.teachers) {
      if (!list.some((s) => s.id === t.staffUserId)) {
        list.push({
          id: t.staffUserId,
          staffId: t.staffId,
          name: `${t.name} (${inactiveLabel})`,
          roles: [],
          branchIds: [],
          language: 'ur',
          isActive: t.isActive,
          activeDevices: 0,
          createdAt: '',
        });
      }
    }
    return list;
  }, [staff, section.teachers, inactiveLabel]);
  const byId = useMemo(() => new Map(options.map((o) => [o.id, o])), [options]);

  const ids = rows.map((r) => r.staffUserId).filter(Boolean);
  const duplicate = new Set(ids).size !== ids.length;

  const update = (i: number, patch: Partial<Row>) =>
    setRows((rs) => rs.map((r, k) => (k === i ? { ...r, ...patch } : r)));

  const handleSubmit = () => {
    if (duplicate) return;
    setTeachers.mutate(
      {
        id: section.id,
        data: {
          teachers: rows.filter((r) => r.staffUserId),
          ...(reason.trim() ? { reason: reason.trim() } : {}),
        },
      },
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
      title={<FormattedMessage {...messages.teachersTitle} values={{ name: section.displayName }} />}
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={setTeachers.isPending}
    >
      <Stack spacing={2}>
        <Typography variant="body2" color="text.secondary">
          <FormattedMessage {...messages.teachersHint} />
        </Typography>
        {rows.map((row, i) => (
          <Stack key={i} direction="row" spacing={1} alignItems="center">
            <Autocomplete<StaffUserEntity, false>
              size="small"
              sx={{ flex: 1 }}
              loading={isLoading}
              options={options.filter((o) => o.id === row.staffUserId || !ids.includes(o.id))}
              value={byId.get(row.staffUserId) ?? null}
              getOptionLabel={(o) => `${o.name} · ${o.staffId}`}
              isOptionEqualToValue={(a, b) => a.id === b.id}
              onChange={(_, v) => update(i, { staffUserId: v?.id ?? '' })}
              renderInput={(params) => <TextField {...params} label={teacherLabel} />}
            />
            <TextField
              select
              size="small"
              sx={{ width: 170 }}
              label={<FormattedMessage {...messages.role} />}
              value={row.role}
              onChange={(e) => update(i, { role: e.target.value as SectionTeacherRole })}
            >
              {ROLES.map((r) => (
                <MenuItem key={r} value={r}>
                  <FormattedMessage {...messages[`role${r}`]} />
                </MenuItem>
              ))}
            </TextField>
            <IconButton aria-label="remove" onClick={() => setRows((rs) => rs.filter((_, k) => k !== i))}>
              <RemoveIcon fontSize="small" />
            </IconButton>
          </Stack>
        ))}
        {duplicate && (
          <Alert severity="error">
            <FormattedMessage {...messages.teacherTwice} />
          </Alert>
        )}
        <Button
          startIcon={<AddIcon />}
          sx={{ alignSelf: 'flex-start' }}
          onClick={() =>
            setRows((rs) => [
              ...rs,
              {
                staffUserId: '',
                role: rs.some((r) => r.role === SectionTeacherRole.CLASS_TEACHER)
                  ? SectionTeacherRole.ASSISTANT
                  : SectionTeacherRole.CLASS_TEACHER,
              },
            ])
          }
        >
          <FormattedMessage {...messages.addTeacher} />
        </Button>
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
