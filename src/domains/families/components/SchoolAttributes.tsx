'use client';

import { useIntl } from 'react-intl';

import Link from 'next/link';

import { Box, Chip, Link as MuiLink, Stack, Typography } from '@mui/material';

import { ATTRIBUTE_LABELS, KIND_LABELS } from '@/domains/schools/components/common';

import { SchoolKind } from '@/providers/service/app.schemas';

import { routes } from '@/router/routes';

import { ChildSchool } from '../api';
import messages from '../messages';

const muted = { borderStyle: 'dashed', color: 'text.secondary' } as const;

/** Kind, type, medium and fee band, in that order; a missing one is a muted "Unknown …" chip */
export function SchoolChips({ school }: { school: ChildSchool }) {
  const intl = useIntl();
  if (!school.id) {
    return (
      <Box>
        <Chip size="small" variant="outlined" sx={muted} label={intl.formatMessage(messages.notOnList)} />
      </Box>
    );
  }
  const kind = school.kind && KIND_LABELS[school.kind as SchoolKind];
  const type = school.type && ATTRIBUTE_LABELS.type.values[school.type];
  const medium = school.medium && ATTRIBUTE_LABELS.medium.values[school.medium];
  const band = school.feeBand && ATTRIBUTE_LABELS.feeBand.values[school.feeBand];
  return (
    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
      {kind && <Chip size="small" variant="outlined" label={intl.formatMessage(kind)} />}
      {type ? (
        <Chip size="small" variant="outlined" label={intl.formatMessage(type)} />
      ) : (
        <Chip size="small" variant="outlined" sx={muted} label={intl.formatMessage(messages.unknownType)} />
      )}
      {medium ? (
        <Chip size="small" variant="outlined" label={intl.formatMessage(medium)} />
      ) : (
        <Chip size="small" variant="outlined" sx={muted} label={intl.formatMessage(messages.unknownMedium)} />
      )}
      {band ? (
        <Chip size="small" variant="outlined" label={intl.formatMessage(band)} />
      ) : (
        <Chip size="small" variant="outlined" sx={muted} label={intl.formatMessage(messages.unknownFeeBand)} />
      )}
    </Stack>
  );
}

/** The school's name (a link for admins), its class, and its chips; "Unknown" when there's none */
export function SchoolCell({
  school,
  schoolClass,
  canOpenSchools,
  chips = true,
}: {
  school?: ChildSchool | null;
  schoolClass?: string | null;
  canOpenSchools: boolean;
  chips?: boolean;
}) {
  const intl = useIntl();
  if (!school) {
    return (
      <Typography variant="body2" color="text.secondary">
        {intl.formatMessage(messages.unknown)}
      </Typography>
    );
  }
  const name = school.id ? school.name : `“${school.name}”`;
  return (
    <Stack spacing={0.5} sx={{ minWidth: 0 }}>
      <Typography variant="body2">
        {school.id && canOpenSchools ? (
          <MuiLink component={Link} href={routes.schools.detail(school.id)} underline="hover" color="inherit">
            {name}
          </MuiLink>
        ) : (
          name
        )}
        {schoolClass ? (
          <Typography component="span" variant="body2" color="text.secondary">
            {' · '}
            {intl.formatMessage(messages.schoolClass, { value: schoolClass })}
          </Typography>
        ) : null}
      </Typography>
      {chips && <SchoolChips school={school} />}
    </Stack>
  );
}
