'use client';

import { useIntl } from 'react-intl';

import Link from 'next/link';

import { Chip, Link as MuiLink, Stack, Typography } from '@mui/material';

import { FamilyMemberAdmission, FamilyRelation, Gender } from '@/providers/service/app.schemas';

import { routes } from '@/router/routes';

import { ChildAdmission, ChildSessions } from '../api';
import messages from '../messages';
import { ageOn } from '../rules';

import { InactiveChip, RelationChip, ResultSummary } from './chips';

/** The child's name (to their profile), GR under it (or "This student"), and the relation when not Sibling */
export function ChildName({
  student,
  relation,
  isThis,
  muted,
  note,
}: {
  student: { id: string; name: string; grNumber: string; isActive?: boolean };
  relation?: FamilyRelation;
  isThis?: boolean;
  muted?: boolean;
  /** A line under the GR, e.g. "left 3 Mar 2026" */
  note?: React.ReactNode;
}) {
  const intl = useIntl();
  return (
    <Stack spacing={0.25} sx={{ minWidth: 0 }}>
      <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
        <MuiLink
          component={Link}
          href={routes.students.profile(student.id)}
          underline="hover"
          color={muted ? 'text.secondary' : 'inherit'}
          sx={{ fontWeight: 600 }}
        >
          {student.name}
        </MuiLink>
        {relation && <RelationChip relation={relation} />}
        {student.isActive === false && <InactiveChip />}
      </Stack>
      {isThis ? (
        <Typography variant="caption" sx={{ color: 'var(--mui-palette-brand-goldText)', fontWeight: 600 }}>
          {intl.formatMessage(messages.thisStudent)}
        </Typography>
      ) : (
        <Typography variant="caption" color="text.secondary">
          <span dir="ltr" style={{ fontFamily: 'monospace' }}>
            {student.grNumber}
          </span>
        </Typography>
      )}
      {note && (
        <Typography variant="caption" color="text.secondary">
          {note}
        </Typography>
      )}
    </Stack>
  );
}

/** "12 M" */
export function AgeGender({ dateOfBirth, gender }: { dateOfBirth?: string | null; gender?: Gender }) {
  const intl = useIntl();
  const age = ageOn(dateOfBirth);
  const g = gender ? intl.formatMessage(messages[`gender${gender}`]) : '';
  return (
    <Typography variant="body2" noWrap>
      {age === undefined ? g || '--' : intl.formatMessage(messages.ageGender, { age: String(age), gender: g })}
    </Typography>
  );
}

/**
 * Where the child sits: this session's branch, class and section, with fee and van chips, from the family response.
 * With no admission this session, the latest class from the child's sessions (with its session's name).
 */
export function ClassText({
  admission,
  latest,
  sessionName,
  chips = true,
}: {
  admission?: FamilyMemberAdmission;
  latest?: ChildAdmission;
  sessionName?: string;
  chips?: boolean;
}) {
  const intl = useIntl();
  if (admission) {
    const section = admission.section?.letter ? ` ${admission.section.letter}` : '';
    return (
      <Stack spacing={0.5}>
        <Typography variant="body2">
          {sessionName ? `${sessionName} · ` : ''}
          {admission.branch.code} · {admission.classLevel.name}
          {section}
        </Typography>
        {chips && (
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            <Chip
              size="small"
              variant="outlined"
              color={admission.isFeePaid ? 'success' : 'warning'}
              label={intl.formatMessage(admission.isFeePaid ? messages.feePaid : messages.feeUnpaid)}
            />
            {admission.vanRequired && <Chip size="small" variant="outlined" label={intl.formatMessage(messages.van)} />}
          </Stack>
        )}
      </Stack>
    );
  }
  if (latest) {
    const section = latest.sectionLetter ? ` ${latest.sectionLetter}` : '';
    return (
      <Stack spacing={0.25}>
        <Typography variant="body2">
          {latest.sessionName} · {latest.branch.code} · {latest.classLevel.name}
          {section}
        </Typography>
        {sessionName && latest.sessionName !== sessionName && (
          <Typography variant="caption" color="text.secondary">
            {intl.formatMessage(messages.notIn, { session: sessionName })}
          </Typography>
        )}
      </Stack>
    );
  }
  return (
    <Typography variant="body2" color="text.secondary">
      {sessionName
        ? intl.formatMessage(messages.notIn, { session: sessionName })
        : intl.formatMessage(messages.noAdmission)}
    </Typography>
  );
}

/** The latest result the child has, with its session when it isn't the latest admission's */
export function LatestResult({ child, visible }: { child?: ChildSessions; visible: boolean }) {
  if (!visible || !child) return <Typography color="text.secondary">--</Typography>;
  const withResult = [...child.admissions].reverse().find((a) => a.result?.status);
  if (!withResult) return <ResultSummary status={null} />;
  const r = withResult.result!;
  return (
    <Stack spacing={0.25}>
      <ResultSummary status={r.status} pct={r.pct} branchRank={r.branchRank} rankedOf={r.rankedOf} dense />
      <Typography variant="caption" color="text.secondary">
        {withResult.sessionName}
      </Typography>
    </Stack>
  );
}
