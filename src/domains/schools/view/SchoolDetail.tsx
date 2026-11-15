'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';

import { useIntl } from 'react-intl';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CallMergeIcon from '@mui/icons-material/CallMerge';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { ActionDialog } from '@/domains/trainings/components/ActionDialog';

import { DetailHeader } from '@/components/DetailHeader';
import { DetailNotFound } from '@/components/DetailNotFound';
import { DetailSkeleton } from '@/components/Skeleton/DetailSkeleton';

import { School, SchoolKind, UpdateSchoolDto } from '@/providers/service/app.schemas';
import {
  useSchoolControllerActivate,
  useSchoolControllerAddAliases,
  useSchoolControllerDeactivate,
  useSchoolControllerFindOne,
  useSchoolControllerUpdate,
} from '@/providers/service/school/school';

import { routes } from '@/router/routes';

import { extractNetworkError } from '@/utils/extractNetworkError';

import {
  areaLabel,
  ATTRIBUTE_LABELS,
  AttributeSelect,
  AreasSelect,
  KIND_LABELS,
  KINDS,
  useAreas,
  useNotify,
  useRefreshSchools,
} from '../components/common';
import { MergeDialog } from '../components/dialogs';
import messages from '../messages';
import { Attribute, ATTRIBUTES, cleanSpellings, isMissingDetails } from '../rules';

/** A titled card on the school's page */
function Section({ title, help, children }: { title: string; help?: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        {help && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {help}
          </Typography>
        )}
        <Box sx={{ mt: 2 }}>{children}</Box>
      </CardContent>
    </Card>
  );
}

interface FormValues extends Record<Attribute, string> {
  name: string;
  kind: SchoolKind;
  areaIds: string[];
}

const toValues = (s: School): FormValues => ({
  name: s.name,
  kind: s.kind,
  areaIds: [...s.areaIds],
  type: s.type ?? '',
  feeBand: s.feeBand ?? '',
  medium: s.medium ?? '',
});

/** Only the fields that changed, so a save never touches the rest */
function changes(school: School, v: FormValues): UpdateSchoolDto {
  const dto: UpdateSchoolDto = {};
  const name = v.name.replace(/\s+/g, ' ').trim();
  if (name && name !== school.name) dto.name = name;
  if (v.kind !== school.kind) dto.kind = v.kind;
  const sameAreas = v.areaIds.length === school.areaIds.length && v.areaIds.every((id) => school.areaIds.includes(id));
  if (!sameAreas) dto.areaIds = v.areaIds;
  // An emptied detail is sent as null, which clears it
  for (const a of ATTRIBUTES) {
    if (v[a] !== (school[a] ?? '')) Object.assign(dto, { [a]: v[a] || null });
  }
  return dto;
}

function DetailsForm({ school }: { school: School }) {
  const intl = useIntl();
  const notify = useNotify();
  const refresh = useRefreshSchools();
  const update = useSchoolControllerUpdate();
  const [values, setValues] = useState<FormValues>(() => toValues(school));
  useEffect(() => setValues(toValues(school)), [school]);

  const dto = changes(school, values);
  const dirty = Object.keys(dto).length > 0;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!dirty || !values.name.trim()) return;
    try {
      await update.mutateAsync({ id: school.id, data: dto });
      notify.success();
      await refresh();
    } catch (err) {
      notify.error(err);
    }
  };

  return (
    <Section title={intl.formatMessage(messages.details)} help={intl.formatMessage(messages.attributesHelp)}>
      <Stack component="form" spacing={2} onSubmit={submit} noValidate>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 8 }}>
            <TextField
              fullWidth
              label={intl.formatMessage(messages.name)}
              value={values.name}
              onChange={(e) => setValues({ ...values, name: e.target.value })}
              helperText={intl.formatMessage(messages.nameHelp)}
              error={!values.name.trim()}
              slotProps={{ htmlInput: { maxLength: 150 } }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              select
              fullWidth
              label={intl.formatMessage(messages.kind)}
              value={values.kind}
              onChange={(e) => setValues({ ...values, kind: e.target.value as SchoolKind })}
            >
              {KINDS.map((k) => (
                <MenuItem key={k} value={k}>
                  {intl.formatMessage(KIND_LABELS[k])}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          {ATTRIBUTES.map((a) => (
            <Grid key={a} size={{ xs: 12, md: 4 }}>
              <AttributeSelect attribute={a} value={values[a]} onChange={(v) => setValues({ ...values, [a]: v })} />
            </Grid>
          ))}
          <Grid size={{ xs: 12 }}>
            <AreasSelect
              value={values.areaIds}
              onChange={(areaIds) => setValues({ ...values, areaIds })}
              label={intl.formatMessage(messages.areas)}
              helperText={intl.formatMessage(messages.areasHelp)}
            />
          </Grid>
        </Grid>
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button disabled={!dirty || update.isPending} onClick={() => setValues(toValues(school))}>
            {intl.formatMessage(messages.cancel)}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={!dirty || !values.name.trim() || update.isPending}
            startIcon={update.isPending ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {intl.formatMessage(messages.save)}
          </Button>
        </Stack>
      </Stack>
    </Section>
  );
}

function Spellings({ school }: { school: School }) {
  const intl = useIntl();
  const notify = useNotify();
  const refresh = useRefreshSchools();
  const addAliases = useSchoolControllerAddAliases();
  const update = useSchoolControllerUpdate();
  const [input, setInput] = useState('');
  const [removing, setRemoving] = useState<string | null>(null);

  // Adding goes through POST :id/aliases, which also links the admissions typed this way
  const add = async (e: FormEvent) => {
    e.preventDefault();
    const names = cleanSpellings(input.split('\n'), [school.name, ...school.aliases]);
    if (!names.length) {
      setInput('');
      return;
    }
    try {
      const res = await addAliases.mutateAsync({ id: school.id, data: { names } });
      notify.success(intl.formatMessage(messages.spellingAdded, { count: res.admissionsLinked }));
      setInput('');
      await refresh();
    } catch (err) {
      notify.error(err);
    }
  };

  // Removing replaces the spellings with the rest (PATCH aliases)
  const remove = async () => {
    if (!removing) return;
    try {
      await update.mutateAsync({ id: school.id, data: { aliases: school.aliases.filter((a) => a !== removing) } });
      notify.success(intl.formatMessage(messages.spellingRemoved));
      setRemoving(null);
      await refresh();
    } catch (err) {
      notify.error(err);
    }
  };

  return (
    <Section title={intl.formatMessage(messages.spellings)} help={intl.formatMessage(messages.spellingsCardHelp)}>
      <Stack spacing={2}>
        {school.aliases.length ? (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {school.aliases.map((alias) => (
              <Chip key={alias} label={alias} onDelete={() => setRemoving(alias)} />
            ))}
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary">
            {intl.formatMessage(messages.noSpellings)}
          </Typography>
        )}
        <Stack component="form" direction="row" spacing={1} onSubmit={add} alignItems="flex-start">
          <TextField
            size="small"
            label={intl.formatMessage(messages.newSpelling)}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            sx={{ flex: 1, maxWidth: 420 }}
            slotProps={{ htmlInput: { maxLength: 150 } }}
          />
          <Button
            type="submit"
            variant="outlined"
            disabled={!input.trim() || addAliases.isPending}
            startIcon={addAliases.isPending ? <CircularProgress size={16} color="inherit" /> : <AddIcon />}
          >
            {intl.formatMessage(messages.addSpelling)}
          </Button>
        </Stack>
      </Stack>

      <ActionDialog
        open={!!removing}
        title={intl.formatMessage(messages.removeSpelling, { name: removing ?? '' })}
        onClose={() => setRemoving(null)}
        onSubmit={remove}
        isSubmitting={update.isPending}
        submitColor="error"
        submitLabel={intl.formatMessage(messages.remove)}
        maxWidth="xs"
      >
        <Typography variant="body2">{intl.formatMessage(messages.removeSpellingHelp)}</Typography>
      </ActionDialog>
    </Section>
  );
}

export function SchoolDetail({ id }: { id: string }) {
  const intl = useIntl();
  const router = useRouter();
  const notify = useNotify();
  const refresh = useRefreshSchools();
  const { byId: areasById } = useAreas();
  const activate = useSchoolControllerActivate();
  const deactivate = useSchoolControllerDeactivate();
  const [merging, setMerging] = useState(false);

  const { data, isLoading, isFetching, error } = useSchoolControllerFindOne(id, { includeInActive: true });
  const school = data?.data;

  const areas = useMemo(
    () => (school?.areaIds ?? []).map((areaId) => areasById.get(areaId)).filter((a) => !!a),
    [school, areasById],
  );

  if (isLoading) return <DetailSkeleton />;
  if (!school) {
    return (
      <Stack spacing={2}>
        {error ? <Alert severity="error">{extractNetworkError(error)}</Alert> : null}
        <DetailNotFound notFoundMessage={intl.formatMessage(messages.notFound)} />
      </Stack>
    );
  }

  // Core sends isActive to ADMIN role only; a school it returns otherwise is active
  const isActive = school.isActive !== false;

  const toggleActive = async () => {
    try {
      if (isActive) {
        await deactivate.mutateAsync({ id: school.id });
        notify.success(intl.formatMessage(messages.deactivated));
      } else {
        await activate.mutateAsync({ id: school.id });
        notify.success(intl.formatMessage(messages.activated));
      }
      await refresh();
    } catch (err) {
      notify.error(err);
    }
  };

  return (
    <Stack spacing={2}>
      <Box>
        <Button component={Link} href={routes.schools.listing} size="small" startIcon={<ArrowBackIcon />}>
          {intl.formatMessage(messages.backToList)}
        </Button>
      </Box>
      <DetailHeader
        title={school.name}
        chips={
          <>
            <Chip size="small" variant="outlined" label={intl.formatMessage(KIND_LABELS[school.kind])} />
            {isMissingDetails(school) && (
              <Chip size="small" color="warning" variant="outlined" label={intl.formatMessage(messages.missingChip)} />
            )}
          </>
        }
        isActive={isActive}
        fields={[
          ...ATTRIBUTES.map((a) => {
            const value = school[a];
            return {
              key: a,
              label: intl.formatMessage(ATTRIBUTE_LABELS[a].label),
              value: value ? intl.formatMessage(ATTRIBUTE_LABELS[a].values[value]) : undefined,
            };
          }),
          {
            key: 'admissions',
            label: intl.formatMessage(messages.admissions),
            value: school.admissionCount === undefined ? undefined : intl.formatNumber(school.admissionCount),
            dir: 'ltr',
          },
          {
            key: 'spellings',
            label: intl.formatMessage(messages.spellings),
            value: intl.formatNumber(school.aliases.length),
            dir: 'ltr',
          },
          {
            key: 'areas',
            label: intl.formatMessage(messages.areas),
            value: areas.length ? (
              <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                {areas.map((a) => (
                  <Chip key={a.id} label={areaLabel(a)} size="small" variant="outlined" className="font-urdu" />
                ))}
              </Stack>
            ) : undefined,
          },
        ]}
        createdAt={school.createdAt}
        createdBy={school.createdBy?.name}
        updatedAt={school.updatedAt}
        updatedBy={school.updatedBy?.name}
        onToggleActive={toggleActive}
        isToggling={activate.isPending || deactivate.isPending || isFetching}
        actions={
          <Button variant="outlined" size="small" startIcon={<CallMergeIcon />} onClick={() => setMerging(true)}>
            {intl.formatMessage(messages.mergeInto)}
          </Button>
        }
      />
      <DetailsForm school={school} />
      <Spellings school={school} />
      <MergeDialog
        open={merging}
        keep={school}
        onClose={() => setMerging(false)}
        onMerged={(kept) => {
          if (kept.id !== school.id) router.replace(routes.schools.detail(kept.id));
        }}
      />
    </Stack>
  );
}
