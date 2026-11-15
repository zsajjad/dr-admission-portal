'use client';

import { useEffect, useState } from 'react';

import { useIntl } from 'react-intl';

import Link from 'next/link';

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { useNotify } from '@/domains/schools/components/common';
import { ProfileDialog } from '@/domains/students/dialogs/ProfileDialog';

import { ConfirmSiblingsResult, FamilyRelation, SiblingLevel } from '@/providers/service/app.schemas';
import { familiesControllerConfirm, familiesControllerReject } from '@/providers/service/families/families';

import { routes } from '@/router/routes';

import { useRefreshFamilies } from '../api';
import { OutcomeText, ReasonsText, RELATIONS, relationMessage, StrengthChip } from '../components/chips';
import messages from '../messages';
import { errorCode } from '../rules';

/** One side of a pair, as the dialogs show it */
export interface PairStudent {
  id: string;
  name: string;
  grNumber: string;
  fatherName?: string;
}

export interface PairInfo {
  level?: SiblingLevel;
  reasons?: string[];
  fatherScore?: number | null;
  outcome?: string;
}

function Side({ student }: { student: PairStudent }) {
  return (
    <Box sx={{ flex: 1, minWidth: 0, p: 1.5, border: 1, borderColor: 'divider', borderRadius: 2 }}>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {student.name}
      </Typography>
      <Typography variant="caption" color="text.secondary" component="div">
        <span dir="ltr" style={{ fontFamily: 'monospace' }}>
          {student.grNumber}
        </span>
      </Typography>
      {student.fatherName && (
        <Typography variant="caption" color="text.secondary" component="div">
          {student.fatherName}
        </Typography>
      )}
    </Box>
  );
}

/**
 * Confirm two students are siblings (POST /admin/families/confirm) with the relation picked (default Sibling).
 * A likely duplicate is refused by core: the dialog then offers the merge page, or confirming anyway.
 */
export function ConfirmSiblingDialog({
  open,
  a,
  b,
  pair,
  canMerge,
  duplicateFirst,
  onClose,
  onConfirmed,
}: {
  open: boolean;
  /** Open on the "same child?" step (core already refused the pair as a likely duplicate) */
  duplicateFirst?: boolean;
  /** The student whose page or row this is */
  a: PairStudent | null;
  /** The child being linked; the relation is theirs */
  b: PairStudent | null;
  pair?: PairInfo;
  canMerge: boolean;
  onClose: () => void;
  onConfirmed?: (result: ConfirmSiblingsResult) => void;
}) {
  const intl = useIntl();
  const notify = useNotify();
  const refresh = useRefreshFamilies();
  const [relation, setRelation] = useState<FamilyRelation>('SIBLING');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [duplicate, setDuplicate] = useState(false);

  useEffect(() => {
    if (open) {
      setRelation('SIBLING');
      setNote('');
      setDuplicate(!!duplicateFirst);
    }
  }, [open, a?.id, b?.id, duplicateFirst]);

  if (!a || !b) return null;

  const submit = async (confirmNotDuplicate = false) => {
    setBusy(true);
    try {
      const res = await familiesControllerConfirm({
        studentId: a.id,
        otherStudentId: b.id,
        confirmNotDuplicate: confirmNotDuplicate || undefined,
        relation,
        note: note.trim() || undefined,
      });
      await refresh();
      notify.success(intl.formatMessage(messages.saved));
      onConfirmed?.(res.data);
      onClose();
    } catch (err) {
      if (errorCode(err) === 'POSSIBLE_DUPLICATE') setDuplicate(true);
      else notify.error(err);
    } finally {
      setBusy(false);
    }
  };

  if (duplicate) {
    return (
      <Dialog open={open} onClose={busy ? undefined : onClose} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 600 }}>{intl.formatMessage(messages.duplicateTitle)}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1.5}>
              <Side student={a} />
              <Side student={b} />
            </Stack>
            <Alert severity="warning">{intl.formatMessage(messages.duplicateBody)}</Alert>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Button onClick={onClose} disabled={busy}>
            {intl.formatMessage(messages.cancel)}
          </Button>
          {canMerge && (
            <Button component={Link} href={routes.studentMerge.compare(a.id, b.id)} variant="outlined">
              {intl.formatMessage(messages.compareInMerge)}
            </Button>
          )}
          <Button
            variant="contained"
            color="warning"
            disabled={busy}
            onClick={() => submit(true)}
            startIcon={busy ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {intl.formatMessage(messages.differentChildren)}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  const merges = pair?.outcome === 'MERGES_FAMILIES';
  return (
    <ProfileDialog
      open={open}
      title={intl.formatMessage(messages.confirmTitle)}
      onClose={onClose}
      onSubmit={() => submit(false)}
      isSubmitting={busy}
      submitLabel={intl.formatMessage(messages.confirmButton)}
      submitColor={merges ? 'warning' : 'primary'}
    >
      <Stack spacing={2}>
        <Stack direction="row" spacing={1.5}>
          <Side student={a} />
          <Side student={b} />
        </Stack>
        {pair?.reasons?.length ? (
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
            {pair.level && <StrengthChip level={pair.level} />}
            <ReasonsText reasons={pair.reasons} fatherScore={pair.fatherScore} />
          </Stack>
        ) : null}
        {pair?.outcome && (
          <Box>
            <OutcomeText outcome={pair.outcome} />
          </Box>
        )}
        {merges && <Alert severity="warning">{intl.formatMessage(messages.mergesWarning)}</Alert>}
        <TextField
          select
          size="small"
          label={intl.formatMessage(messages.relationOf, { name: b.name })}
          value={relation}
          onChange={(e) => setRelation(e.target.value as FamilyRelation)}
          helperText={intl.formatMessage(messages[`relationHelp${relation}`])}
        >
          {RELATIONS.map((r) => (
            <MenuItem key={r} value={r}>
              {intl.formatMessage(relationMessage(r))}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          size="small"
          label={intl.formatMessage(messages.noteOptional)}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          multiline
          minRows={1}
          inputProps={{ maxLength: 1000 }}
        />
      </Stack>
    </ProfileDialog>
  );
}

/** Mark two students "not siblings" (POST /admin/families/reject), so they aren't suggested again */
export function NotSiblingsDialog({
  open,
  a,
  b,
  onClose,
  onRejected,
}: {
  open: boolean;
  a: PairStudent | null;
  b: PairStudent | null;
  onClose: () => void;
  onRejected?: () => void;
}) {
  const intl = useIntl();
  const notify = useNotify();
  const refresh = useRefreshFamilies();
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [sameFamily, setSameFamily] = useState(false);

  useEffect(() => {
    if (open) {
      setReason('');
      setSameFamily(false);
    }
  }, [open, a?.id, b?.id]);

  if (!a || !b) return null;

  const submit = async () => {
    setBusy(true);
    try {
      await familiesControllerReject({ studentId: a.id, otherStudentId: b.id, reason: reason.trim() || undefined });
      await refresh();
      notify.success(intl.formatMessage(messages.saved));
      onRejected?.();
      onClose();
    } catch (err) {
      if (errorCode(err) === 'SAME_FAMILY') setSameFamily(true);
      else notify.error(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ProfileDialog
      open={open}
      title={intl.formatMessage(messages.rejectTitle)}
      onClose={onClose}
      onSubmit={submit}
      isSubmitting={busy}
      submitLabel={intl.formatMessage(messages.rejectButton)}
      submitColor="error"
    >
      <Stack spacing={2}>
        <Typography variant="body2">{intl.formatMessage(messages.rejectBody, { a: a.name, b: b.name })}</Typography>
        {sameFamily && <Alert severity="warning">{intl.formatMessage(messages.sameFamily)}</Alert>}
        <TextField
          size="small"
          label={intl.formatMessage(messages.reasonOptional)}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          inputProps={{ maxLength: 1000 }}
        />
      </Stack>
    </ProfileDialog>
  );
}
