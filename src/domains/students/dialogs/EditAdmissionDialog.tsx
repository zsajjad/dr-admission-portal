'use client';

import { useEffect, useState } from 'react';

import { Alert, Checkbox, FormControlLabel, Grid, TextField } from '@mui/material';

import { AreaSelect } from '@/components/AreaSelect';
import { BranchSelect } from '@/components/BranchSelect';

import { useAdmissionsControllerUpdate } from '@/providers/service/admissions/admissions';
import { StudentProfileAdmission, UpdateAdmissionDto } from '@/providers/service/app.schemas';

import { FormattedMessage, useFormattedMessage } from '@/theme/FormattedMessage';

import { useSnackbarContext } from '@/contexts/SnackbarContext';

import { useProfileActions } from '../hooks/useProfileActions';
import messages from '../messages';

import { ProfileDialog } from './ProfileDialog';

interface EditAdmissionDialogProps {
  open: boolean;
  studentId: string;
  admission: StudentProfileAdmission;
  onClose: () => void;
}

/** Branch, area, school and van request, through the existing PATCH /admissions/:id */
export function EditAdmissionDialog({ open, studentId, admission, onClose }: EditAdmissionDialogProps) {
  const { onSuccess, onError } = useProfileActions(studentId);
  const { show } = useSnackbarContext();
  const nothingChanged = useFormattedMessage(messages.nothingChanged);
  const required = useFormattedMessage(messages.required);
  const mutation = useAdmissionsControllerUpdate();

  const initial = {
    branchId: admission.branch.id,
    areaId: admission.area.id,
    schoolName: admission.schoolName ?? '',
    schoolClass: admission.schoolClass ?? '',
    vanRequired: admission.vanRequired,
  };
  const [values, setValues] = useState(initial);
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    if (open) {
      setValues(initial);
      setShowErrors(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, admission.id]);

  const handleSave = () => {
    if (!values.branchId || !values.areaId) {
      setShowErrors(true);
      return;
    }
    const data: UpdateAdmissionDto = {};
    if (values.branchId !== initial.branchId) data.branchId = values.branchId;
    if (values.areaId !== initial.areaId || data.branchId) data.areaId = values.areaId;
    if (values.schoolName.trim() !== initial.schoolName) data.schoolName = values.schoolName.trim();
    if (values.schoolClass.trim() !== initial.schoolClass) data.schoolClass = values.schoolClass.trim();
    if (values.vanRequired !== initial.vanRequired) data.vanRequired = values.vanRequired;
    if (!Object.keys(data).length) {
      show({ message: nothingChanged, type: 'info' });
      return;
    }
    mutation.mutate(
      { id: admission.id, data },
      {
        onSuccess: async () => {
          await onSuccess();
          onClose();
        },
        onError,
      },
    );
  };

  const branchChanged = values.branchId !== initial.branchId || values.areaId !== initial.areaId;

  return (
    <ProfileDialog
      open={open}
      title={<FormattedMessage {...messages.admissionDialogTitle} values={{ session: admission.session.name }} />}
      onClose={onClose}
      onSubmit={handleSave}
      isSubmitting={mutation.isPending}
    >
      <Grid container spacing={2}>
        <Grid size={6}>
          <BranchSelect
            size="small"
            value={values.branchId}
            onChange={(branchId) => setValues((v) => ({ ...v, branchId, areaId: '' }))}
            error={required}
            touched={showErrors && !values.branchId}
          />
        </Grid>
        <Grid size={6}>
          <AreaSelect
            size="small"
            branchId={values.branchId}
            value={values.areaId}
            onChange={(areaId) => setValues((v) => ({ ...v, areaId }))}
            error={required}
            touched={showErrors && !values.areaId}
            disabled={!values.branchId}
          />
        </Grid>
        {branchChanged && (
          <Grid size={12}>
            <Alert severity="info">
              <FormattedMessage {...messages.admissionBranchNote} />
            </Alert>
          </Grid>
        )}
        <Grid size={8}>
          <TextField
            size="small"
            fullWidth
            label={<FormattedMessage {...messages.schoolName} />}
            value={values.schoolName}
            onChange={(e) => setValues((v) => ({ ...v, schoolName: e.target.value }))}
          />
        </Grid>
        <Grid size={4}>
          <TextField
            size="small"
            fullWidth
            label={<FormattedMessage {...messages.schoolClass} />}
            value={values.schoolClass}
            onChange={(e) => setValues((v) => ({ ...v, schoolClass: e.target.value }))}
          />
        </Grid>
        <Grid size={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={values.vanRequired}
                onChange={(e) => setValues((v) => ({ ...v, vanRequired: e.target.checked }))}
              />
            }
            label={<FormattedMessage {...messages.vanRequested} />}
          />
        </Grid>
      </Grid>
    </ProfileDialog>
  );
}
