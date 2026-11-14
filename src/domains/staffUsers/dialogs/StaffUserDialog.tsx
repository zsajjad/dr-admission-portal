'use client';

import { useEffect, useState } from 'react';

import { useIntl } from 'react-intl';

import {
  Alert,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  FormLabel,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { ProfileDialog } from '@/domains/students/dialogs/ProfileDialog';

import { StaffLanguage, StaffRole, StaffUserEntity } from '@/providers/service/app.schemas';
import { useStaffUserControllerCreate, useStaffUserControllerUpdate } from '@/providers/service/staff-user/staff-user';

import { FormattedMessage, useFormattedMessage } from '@/theme/FormattedMessage';

import { useStaffActions } from '../hooks/useStaffActions';
import messages from '../messages';
import { roleHintMessage, roleMessage, STAFF_PHONE_PATTERN, STAFF_ROLES } from '../utils';

interface StaffUserDialogProps {
  open: boolean;
  /** Edit this user; leave out to add a new one */
  user?: StaffUserEntity;
  onClose: () => void;
  /** Called with the saved user (new users get their staff ID from the server) */
  onSaved?: (user: StaffUserEntity) => void;
}

export function StaffUserDialog({ open, user, onClose, onSaved }: StaffUserDialogProps) {
  const create = useStaffUserControllerCreate();
  const update = useStaffUserControllerUpdate();
  const { onSuccess, onError } = useStaffActions();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [roles, setRoles] = useState<StaffRole[]>([]);
  const [language, setLanguage] = useState<StaffLanguage>(StaffLanguage.ur);
  const [touched, setTouched] = useState(false);

  const nameRequired = useFormattedMessage(messages.nameRequired);
  const phoneInvalid = useFormattedMessage(messages.phoneInvalid);
  const rolesRequired = useFormattedMessage(messages.rolesRequired);
  const intl = useIntl();

  useEffect(() => {
    if (!open) return;
    setName(user?.name ?? '');
    setPhone(user?.phone ?? '');
    setRoles(user?.roles ?? []);
    setLanguage(user?.language ?? StaffLanguage.ur);
    setTouched(false);
  }, [open, user]);

  const errors = {
    name: !name.trim() ? nameRequired : '',
    phone: phone.trim() && !STAFF_PHONE_PATTERN.test(phone.trim()) ? phoneInvalid : '',
    roles: roles.length === 0 ? rolesRequired : '',
  };
  const valid = !errors.name && !errors.phone && !errors.roles;

  const toggleRole = (role: StaffRole) =>
    setRoles((current) => (current.includes(role) ? current.filter((r) => r !== role) : [...current, role]));

  const handleSubmit = () => {
    setTouched(true);
    if (!valid) return;
    const data = { name: name.trim(), roles, language, ...(phone.trim() ? { phone: phone.trim() } : {}) };
    if (user) {
      update.mutate(
        { id: user.id, data },
        {
          onSuccess: async (res) => {
            await onSuccess();
            onSaved?.(res.data);
            onClose();
          },
          onError,
        },
      );
    } else {
      create.mutate(
        { data },
        {
          onSuccess: async (res) => {
            await onSuccess(intl.formatMessage(messages.created, { staffId: res.data.staffId }));
            onSaved?.(res.data);
            onClose();
          },
          onError,
        },
      );
    }
  };

  return (
    <ProfileDialog
      open={open}
      title={
        user ? (
          <FormattedMessage {...messages.editTitle} values={{ name: user.name }} />
        ) : (
          <FormattedMessage {...messages.createTitle} />
        )
      }
      onClose={onClose}
      onSubmit={handleSubmit}
      isSubmitting={create.isPending || update.isPending}
    >
      <Stack spacing={2}>
        {user ? (
          <Typography variant="body2" color="text.secondary">
            <FormattedMessage {...messages.staffId} />:{' '}
            <Typography component="span" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
              {user.staffId}
            </Typography>
          </Typography>
        ) : (
          <Alert severity="info">
            <FormattedMessage {...messages.staffIdAssigned} />
          </Alert>
        )}
        <TextField
          size="small"
          fullWidth
          required
          autoFocus
          label={<FormattedMessage {...messages.name} />}
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={touched && !!errors.name}
          helperText={touched && errors.name}
        />
        <TextField
          size="small"
          fullWidth
          label={<FormattedMessage {...messages.phone} />}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          error={touched && !!errors.phone}
          helperText={touched && errors.phone}
          slotProps={{ htmlInput: { inputMode: 'tel', dir: 'ltr' } }}
        />
        <FormControl error={touched && !!errors.roles} component="fieldset">
          <FormLabel component="legend" sx={{ fontSize: 14, mb: 0.5 }}>
            <FormattedMessage {...messages.roles} />
          </FormLabel>
          <FormGroup>
            {STAFF_ROLES.map((role) => (
              <FormControlLabel
                key={role}
                control={<Checkbox size="small" checked={roles.includes(role)} onChange={() => toggleRole(role)} />}
                label={
                  <span>
                    <FormattedMessage {...roleMessage(role)} />
                    <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      <FormattedMessage {...roleHintMessage(role)} />
                    </Typography>
                  </span>
                }
              />
            ))}
          </FormGroup>
          {touched && errors.roles && <FormHelperText>{errors.roles}</FormHelperText>}
        </FormControl>
        <TextField
          select
          size="small"
          fullWidth
          label={<FormattedMessage {...messages.language} />}
          value={language}
          onChange={(e) => setLanguage(e.target.value as StaffLanguage)}
        >
          <MenuItem value={StaffLanguage.ur}>
            <FormattedMessage {...messages.languageUr} />
          </MenuItem>
          <MenuItem value={StaffLanguage.en}>
            <FormattedMessage {...messages.languageEn} />
          </MenuItem>
        </TextField>
      </Stack>
    </ProfileDialog>
  );
}
