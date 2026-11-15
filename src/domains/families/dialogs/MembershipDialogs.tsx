'use client';

import { useEffect, useState } from 'react';

import { useIntl } from 'react-intl';

import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { useNotify } from '@/domains/schools/components/common';
import { PickStudent } from '@/domains/studentMerge/components/PickStudent';
import { ProfileDialog } from '@/domains/students/dialogs/ProfileDialog';

import { FamilyEntity, FamilyMemberEntity, FamilyRelation, StudentListItem } from '@/providers/service/app.schemas';
import {
  familiesControllerEndMembership,
  familiesControllerUpdateMembership,
  useFamiliesControllerStudentFamily,
} from '@/providers/service/families/families';

import { useRefreshFamilies } from '../api';
import { ReasonsText, RELATIONS, relationMessage, StrengthChip } from '../components/chips';
import messages from '../messages';
import { byBirthOrder } from '../rules';

import { ConfirmSiblingDialog, PairInfo, PairStudent } from './SiblingDialogs';

/** yyyy-mm-dd for a date input */
const dayOf = (value?: string | Date | null) => (value ? new Date(value).toISOString().slice(0, 10) : '');
const today = () => new Date().toISOString().slice(0, 10);

/** Change relation, or "in the family since" (PATCH /admin/families/:id/members/:studentId) */
export function MembershipDialog({
  open,
  mode,
  familyId,
  member,
  onClose,
}: {
  open: boolean;
  mode: 'relation' | 'since';
  familyId: string;
  member: FamilyMemberEntity | null;
  onClose: () => void;
}) {
  const intl = useIntl();
  const notify = useNotify();
  const refresh = useRefreshFamilies();
  const [relation, setRelation] = useState<FamilyRelation>('SIBLING');
  const [always, setAlways] = useState(true);
  const [since, setSince] = useState('');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open && member) {
      setRelation(member.relation);
      setAlways(!member.validFrom);
      setSince(dayOf(member.validFrom));
      setReason('');
    }
  }, [open, member]);

  if (!member) return null;

  const submit = async () => {
    setBusy(true);
    try {
      await familiesControllerUpdateMembership(familyId, member.id, {
        ...(mode === 'relation' ? { relation } : { validFrom: always || !since ? null : since }),
        reason: reason.trim() || undefined,
      });
      await refresh();
      notify.success(intl.formatMessage(messages.saved));
      onClose();
    } catch (err) {
      notify.error(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ProfileDialog
      open={open}
      title={intl.formatMessage(mode === 'relation' ? messages.relationTitle : messages.sinceTitle, {
        name: member.name,
      })}
      onClose={onClose}
      onSubmit={submit}
      isSubmitting={busy}
    >
      <Stack spacing={2}>
        {mode === 'relation' ? (
          <RadioGroup value={relation} onChange={(e) => setRelation(e.target.value as FamilyRelation)}>
            {RELATIONS.map((r) => (
              <FormControlLabel
                key={r}
                value={r}
                control={<Radio size="small" />}
                label={
                  <Box sx={{ py: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {intl.formatMessage(relationMessage(r))}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {intl.formatMessage(messages[`relationHelp${r}`])}
                    </Typography>
                  </Box>
                }
              />
            ))}
          </RadioGroup>
        ) : (
          <>
            <RadioGroup value={always ? 'always' : 'date'} onChange={(e) => setAlways(e.target.value === 'always')}>
              <FormControlLabel
                value="always"
                control={<Radio size="small" />}
                label={intl.formatMessage(messages.sinceAlways)}
              />
              <FormControlLabel
                value="date"
                control={<Radio size="small" />}
                label={intl.formatMessage(messages.sinceDate)}
              />
            </RadioGroup>
            {!always && (
              <TextField
                type="date"
                size="small"
                label={intl.formatMessage(messages.date)}
                value={since}
                onChange={(e) => setSince(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            )}
          </>
        )}
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

/** Moved out, or linked in error (POST /admin/families/:id/members/:studentId/end) */
export function EndMembershipDialog({
  open,
  reason,
  familyId,
  member,
  onClose,
  onEnded,
}: {
  open: boolean;
  reason: 'MOVED_OUT' | 'LINKED_IN_ERROR';
  familyId: string;
  member: FamilyMemberEntity | null;
  onClose: () => void;
  onEnded: (family: FamilyEntity) => void;
}) {
  const intl = useIntl();
  const notify = useNotify();
  const refresh = useRefreshFamilies();
  const [date, setDate] = useState(today());
  const [note, setNote] = useState('');
  const [markNotSiblings, setMarkNotSiblings] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) {
      setDate(today());
      setNote('');
      setMarkNotSiblings(reason === 'LINKED_IN_ERROR');
    }
  }, [open, reason]);

  if (!member) return null;
  const future = reason === 'MOVED_OUT' && date > today();

  const submit = async () => {
    if (future) return;
    setBusy(true);
    try {
      const res = await familiesControllerEndMembership(familyId, member.id, {
        reason,
        effectiveDate: reason === 'MOVED_OUT' && date ? date : undefined,
        note: note.trim() || undefined,
        markNotSiblings: markNotSiblings || undefined,
      });
      await refresh();
      notify.success(intl.formatMessage(messages.saved));
      onEnded(res.data);
      onClose();
    } catch (err) {
      notify.error(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ProfileDialog
      open={open}
      title={intl.formatMessage(reason === 'MOVED_OUT' ? messages.movedOutTitle : messages.errorTitle, {
        name: member.name,
      })}
      onClose={onClose}
      onSubmit={submit}
      isSubmitting={busy}
      submitLabel={intl.formatMessage(reason === 'MOVED_OUT' ? messages.movedOut : messages.linkedInError)}
      submitColor={reason === 'MOVED_OUT' ? 'primary' : 'error'}
    >
      <Stack spacing={2}>
        {reason === 'MOVED_OUT' ? (
          <>
            <Typography variant="body2">{intl.formatMessage(messages.movedOutBody)}</Typography>
            <TextField
              type="date"
              size="small"
              label={intl.formatMessage(messages.leftOn)}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              error={future}
              helperText={future ? intl.formatMessage(messages.futureDate) : undefined}
              slotProps={{ inputLabel: { shrink: true }, htmlInput: { max: today() } }}
            />
          </>
        ) : (
          <Alert severity="warning">{intl.formatMessage(messages.errorBody)}</Alert>
        )}
        <TextField
          size="small"
          label={intl.formatMessage(messages.noteOptional)}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          inputProps={{ maxLength: 1000 }}
        />
        <FormControlLabel
          control={
            <Checkbox size="small" checked={markNotSiblings} onChange={(e) => setMarkNotSiblings(e.target.checked)} />
          }
          label={<Typography variant="body2">{intl.formatMessage(messages.markNotSiblings)}</Typography>}
        />
      </Stack>
    </ProfileDialog>
  );
}

/**
 * Add a child: from the possible siblings of the family's eldest current member, or any student by GR, name or
 * phone. Then the Confirm sibling dialog against that member (POST /admin/families/confirm).
 */
export function AddChildDialog({
  open,
  family,
  canMerge,
  onClose,
}: {
  open: boolean;
  family: FamilyEntity;
  canMerge: boolean;
  onClose: () => void;
}) {
  const intl = useIntl();
  const anchor = [...family.members].sort(byBirthOrder)[0];
  const { data, isLoading } = useFamiliesControllerStudentFamily(
    anchor?.id ?? '',
    { includeWeak: true },
    { query: { enabled: open && !!anchor } },
  );
  const [picked, setPicked] = useState<PairStudent | null>(null);
  const [pair, setPair] = useState<PairInfo>();

  if (!anchor) return null;
  const suggestions = data?.data?.suggestions ?? [];
  const a: PairStudent = { id: anchor.id, name: anchor.name, grNumber: anchor.grNumber, fatherName: anchor.fatherName };

  return (
    <>
      <ProfileDialog
        open={open && !picked}
        title={intl.formatMessage(messages.addChildTitle)}
        onClose={onClose}
        onSubmit={onClose}
        submitLabel={intl.formatMessage(messages.done)}
        maxWidth="md"
      >
        <Stack spacing={2}>
          <PickStudent
            label={intl.formatMessage(messages.addChildFind)}
            onPick={(s: StudentListItem) => {
              setPair(undefined);
              setPicked({ id: s.id, name: s.name, grNumber: s.grNumber, fatherName: s.fatherName });
            }}
          />
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {intl.formatMessage(messages.addChildSuggested)}
          </Typography>
          {!isLoading && !suggestions.length && (
            <Typography variant="body2" color="text.secondary">
              {intl.formatMessage(messages.addChildNone)}
            </Typography>
          )}
          {suggestions.map((s) => (
            <Stack
              key={s.student.id}
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={{ p: 1.25, border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {s.student.name}{' '}
                  <Typography component="span" variant="caption" color="text.secondary">
                    <span dir="ltr" style={{ fontFamily: 'monospace' }}>
                      {s.student.grNumber}
                    </span>
                  </Typography>
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                  <StrengthChip level={s.level} />
                  <ReasonsText reasons={s.reasons} fatherScore={s.fatherScore} />
                </Stack>
              </Box>
              <Button
                size="small"
                variant="outlined"
                disabled={!s.student.isActive}
                onClick={() => {
                  setPair({ level: s.level, reasons: s.reasons, fatherScore: s.fatherScore, outcome: s.outcome });
                  setPicked({
                    id: s.student.id,
                    name: s.student.name,
                    grNumber: s.student.grNumber,
                    fatherName: s.student.fatherName,
                  });
                }}
              >
                {intl.formatMessage(messages.pick)}
              </Button>
            </Stack>
          ))}
        </Stack>
      </ProfileDialog>
      <ConfirmSiblingDialog
        open={open && !!picked}
        a={a}
        b={picked}
        pair={pair}
        canMerge={canMerge}
        onClose={() => setPicked(null)}
        onConfirmed={() => {
          setPicked(null);
          onClose();
        }}
      />
    </>
  );
}
