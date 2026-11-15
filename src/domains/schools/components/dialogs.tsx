'use client';

import { useEffect, useState } from 'react';

import { useIntl } from 'react-intl';

import SwapVertIcon from '@mui/icons-material/SwapVert';
import { Alert, Box, Button, Grid, MenuItem, Stack, TextField, Typography } from '@mui/material';

import { ActionDialog } from '@/domains/trainings/components/ActionDialog';

import { School, SchoolKind, UnmatchedSchoolName } from '@/providers/service/app.schemas';
import {
  useSchoolControllerAddAliases,
  useSchoolControllerCreate,
  useSchoolControllerLinkAdmissions,
  useSchoolControllerMerge,
} from '@/providers/service/school/school';

import { extractNetworkError } from '@/utils/extractNetworkError';

import messages from '../messages';
import { cleanSpellings, namesOf } from '../rules';

import { AreasSelect, KIND_LABELS, KINDS, SchoolPicker, SpellingsInput, useNotify, useRefreshSchools } from './common';

/** A new school, empty or from an unmatched typed name (whose admissions are then linked to it) */
export function CreateSchoolDialog({
  open,
  from,
  onClose,
  onCreated,
}: {
  open: boolean;
  /** The unmatched name it's created for */
  from?: UnmatchedSchoolName | null;
  onClose: () => void;
  onCreated?: (school: School) => void;
}) {
  const intl = useIntl();
  const notify = useNotify();
  const refresh = useRefreshSchools();
  const create = useSchoolControllerCreate();
  const link = useSchoolControllerLinkAdmissions();
  const [name, setName] = useState('');
  const [kind, setKind] = useState<SchoolKind>('SCHOOL');
  const [areaIds, setAreaIds] = useState<string[]>([]);
  const [aliases, setAliases] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(from?.name ?? '');
    setKind('SCHOOL');
    setAreaIds([]);
    setAliases(from ? cleanSpellings(from.spellings, [from.name]) : []);
    setError(null);
  }, [open, from]);

  const busy = create.isPending || link.isPending;

  const submit = async () => {
    setError(null);
    try {
      const trimmed = name.replace(/\s+/g, ' ').trim();
      const res = await create.mutateAsync({
        data: { name: trimmed, kind, areaIds, aliases: cleanSpellings(aliases, [trimmed]) },
      });
      // Creating a school adds its spellings but links nothing; this links the admissions that used them
      if (from) {
        const linked = await link.mutateAsync({ params: { dryRun: false } });
        notify.success(intl.formatMessage(messages.createdAndLinked, { count: linked.linked }));
      } else {
        notify.success(intl.formatMessage(messages.created));
      }
      await refresh();
      onClose();
      onCreated?.(res.data);
    } catch (err) {
      setError(extractNetworkError(err) || intl.formatMessage(messages.saveFailed));
    }
  };

  return (
    <ActionDialog
      open={open}
      title={intl.formatMessage(messages.createTitle)}
      onClose={onClose}
      onSubmit={submit}
      isSubmitting={busy}
      submitDisabled={!name.trim()}
      submitLabel={intl.formatMessage(messages.create)}
    >
      <Stack spacing={2}>
        {from && <Alert severity="info">{intl.formatMessage(messages.createFromNameHelp)}</Alert>}
        {error && <Alert severity="error">{error}</Alert>}
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 8 }}>
            <TextField
              fullWidth
              autoFocus
              label={intl.formatMessage(messages.name)}
              value={name}
              onChange={(e) => setName(e.target.value)}
              slotProps={{ htmlInput: { maxLength: 150 } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              select
              fullWidth
              label={intl.formatMessage(messages.kind)}
              value={kind}
              onChange={(e) => setKind(e.target.value as SchoolKind)}
            >
              {KINDS.map((k) => (
                <MenuItem key={k} value={k}>
                  {intl.formatMessage(KIND_LABELS[k])}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
        <SpellingsInput
          value={aliases}
          onChange={setAliases}
          label={intl.formatMessage(messages.spellings)}
          helperText={intl.formatMessage(messages.spellingsHelp)}
        />
        <AreasSelect
          value={areaIds}
          onChange={setAreaIds}
          label={intl.formatMessage(messages.areas)}
          helperText={intl.formatMessage(messages.areasHelp)}
        />
      </Stack>
    </ActionDialog>
  );
}

/** Link one or more unmatched typed names to a school: they become its spellings and their admissions link */
export function LinkNamesDialog({
  names,
  onClose,
  onLinked,
}: {
  names: UnmatchedSchoolName[] | null;
  onClose: () => void;
  onLinked?: () => void;
}) {
  const intl = useIntl();
  const notify = useNotify();
  const refresh = useRefreshSchools();
  const addAliases = useSchoolControllerAddAliases();
  const [school, setSchool] = useState<School | null>(null);
  const [error, setError] = useState<string | null>(null);
  const open = !!names?.length;

  useEffect(() => {
    if (!open) return;
    setSchool(null);
    setError(null);
  }, [open]);

  const groups = names ?? [];
  const count = groups.reduce((n, g) => n + g.count, 0);

  const submit = async () => {
    if (!school) return;
    setError(null);
    try {
      const res = await addAliases.mutateAsync({ id: school.id, data: { names: namesOf(groups) } });
      notify.success(intl.formatMessage(messages.linked, { school: res.data.name, count: res.admissionsLinked }));
      await refresh();
      onLinked?.();
      onClose();
    } catch (err) {
      setError(extractNetworkError(err) || intl.formatMessage(messages.saveFailed));
    }
  };

  return (
    <ActionDialog
      open={open}
      title={intl.formatMessage(messages.linkTitle, { count: groups.length })}
      onClose={onClose}
      onSubmit={submit}
      isSubmitting={addAliases.isPending}
      submitDisabled={!school}
      submitLabel={intl.formatMessage(messages.link)}
    >
      <Stack spacing={2}>
        <Box sx={{ bgcolor: 'background.default', borderRadius: 2, p: 1.5, maxHeight: 180, overflowY: 'auto' }}>
          {groups.map((g) => (
            <Typography key={g.name} variant="body2" sx={{ py: 0.25 }}>
              <strong>{g.name}</strong>
              {g.spellings.length ? ` · ${g.spellings.join(' · ')}` : ''}{' '}
              <Typography component="span" variant="caption" color="text.secondary">
                ({intl.formatNumber(g.count)})
              </Typography>
            </Typography>
          ))}
        </Box>
        <Typography variant="body2" color="text.secondary">
          {intl.formatMessage(messages.linkHelp, { count })}
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <SchoolPicker value={school} onChange={setSchool} autoFocus />
      </Stack>
    </ActionDialog>
  );
}

/** Fold a duplicate into the school that stays, after a clear confirmation */
export function MergeDialog({
  open,
  keep: initialKeep,
  remove: initialRemove,
  onClose,
  onMerged,
}: {
  open: boolean;
  keep?: School | null;
  remove?: School | null;
  onClose: () => void;
  onMerged?: (kept: School) => void;
}) {
  const intl = useIntl();
  const notify = useNotify();
  const refresh = useRefreshSchools();
  const merge = useSchoolControllerMerge();
  const [keep, setKeep] = useState<School | null>(null);
  const [remove, setRemove] = useState<School | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setKeep(initialKeep ?? null);
    setRemove(initialRemove ?? null);
    setError(null);
    // Only when it opens: a refetch behind the dialog mustn't undo the admin's picks
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const same = !!keep && !!remove && keep.id === remove.id;
  const ready = !!keep && !!remove && !same;

  const submit = async () => {
    if (!keep || !remove || same) return;
    setError(null);
    try {
      const res = await merge.mutateAsync({ id: keep.id, data: { sourceSchoolId: remove.id } });
      notify.success(intl.formatMessage(messages.merged, { count: res.admissionsMoved }));
      await refresh();
      onClose();
      onMerged?.(res.data);
    } catch (err) {
      setError(extractNetworkError(err) || intl.formatMessage(messages.saveFailed));
    }
  };

  return (
    <ActionDialog
      open={open}
      title={intl.formatMessage(messages.mergeTitle)}
      onClose={onClose}
      onSubmit={submit}
      isSubmitting={merge.isPending}
      submitDisabled={!ready}
      submitColor="error"
      submitLabel={intl.formatMessage(messages.mergeConfirm)}
    >
      <Stack spacing={2}>
        {error && <Alert severity="error">{error}</Alert>}
        <SchoolPicker
          value={keep}
          onChange={setKeep}
          label={intl.formatMessage(messages.mergeKeep)}
          excludeIds={remove ? [remove.id] : []}
        />
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            size="small"
            startIcon={<SwapVertIcon />}
            onClick={() => {
              setKeep(remove);
              setRemove(keep);
            }}
            disabled={!keep && !remove}
          >
            {intl.formatMessage(messages.mergeSwap)}
          </Button>
        </Box>
        <SchoolPicker
          value={remove}
          onChange={setRemove}
          label={intl.formatMessage(messages.mergeRemove)}
          excludeIds={keep ? [keep.id] : []}
        />
        {same && <Alert severity="warning">{intl.formatMessage(messages.mergeSame)}</Alert>}
        {ready && (
          <Alert severity="warning">
            {remove.admissionCount === undefined
              ? intl.formatMessage(messages.mergeSummaryNoCount, { keep: keep.name, remove: remove.name })
              : intl.formatMessage(messages.mergeSummary, {
                  keep: keep.name,
                  remove: remove.name,
                  count: remove.admissionCount,
                })}{' '}
            <strong>{intl.formatMessage(messages.mergeCannotUndo)}</strong>
          </Alert>
        )}
      </Stack>
    </ActionDialog>
  );
}

/** Link every admission whose typed name matches a school's spelling: a dry run first, then the real one */
export function LinkAdmissionsDialog({
  open,
  sessionId,
  onClose,
}: {
  open: boolean;
  sessionId?: string;
  onClose: () => void;
}) {
  const intl = useIntl();
  const notify = useNotify();
  const refresh = useRefreshSchools();
  const dryRun = useSchoolControllerLinkAdmissions();
  const run = useSchoolControllerLinkAdmissions();
  const { mutate: check, reset } = dryRun;

  useEffect(() => {
    if (open) check({ params: { sessionId, dryRun: true } });
    else reset();
  }, [open, sessionId, check, reset]);

  const preview = dryRun.data;

  const submit = async () => {
    try {
      const res = await run.mutateAsync({ params: { sessionId, dryRun: false } });
      notify.success(intl.formatMessage(messages.linkAllDone, { count: res.linked }));
      await refresh();
      onClose();
    } catch (err) {
      notify.error(err);
    }
  };

  return (
    <ActionDialog
      open={open}
      title={intl.formatMessage(messages.linkAllTitle)}
      onClose={onClose}
      onSubmit={submit}
      isSubmitting={run.isPending}
      submitDisabled={!preview || preview.linked === 0}
      submitLabel={intl.formatMessage(messages.link)}
    >
      <Stack spacing={2}>
        <Typography variant="body2" color="text.secondary">
          {intl.formatMessage(messages.linkAllHelp)}
        </Typography>
        {dryRun.isPending && <Typography variant="body2">{intl.formatMessage(messages.linkAllChecking)}</Typography>}
        {dryRun.isError && <Alert severity="error">{extractNetworkError(dryRun.error)}</Alert>}
        {preview && (
          <Alert severity={preview.linked ? 'info' : 'success'}>
            {intl.formatMessage(messages.linkAllDryRun, {
              checked: preview.checked,
              linked: preview.linked,
              unmatched: preview.unmatched,
            })}
          </Alert>
        )}
      </Stack>
    </ActionDialog>
  );
}
