'use client';

import { useIntl } from 'react-intl';

import { Chip, Stack, Typography } from '@mui/material';

import messages from '@/domains/students/messages';

import { FamilyRelation, FinalResultStatus, SiblingLevel } from '@/providers/service/app.schemas';

import familyMessages from '../messages';
import { orderReasons } from '../rules';

type Msg = { id: string; defaultMessage: string };

const LEVEL_COLOR: Record<SiblingLevel, 'success' | 'warning' | 'default'> = {
  STRONG: 'success',
  MEDIUM: 'warning',
  WEAK: 'default',
};

/** Strong, Medium or Weak; the word is always in the chip */
export function StrengthChip({ level }: { level: SiblingLevel }) {
  const intl = useIntl();
  return (
    <Chip
      size="small"
      color={LEVEL_COLOR[level]}
      variant={level === 'WEAK' ? 'outlined' : 'filled'}
      label={intl.formatMessage(familyMessages[`level${level}`])}
    />
  );
}

export const RELATIONS: FamilyRelation[] = ['SIBLING', 'HALF_SIBLING', 'COUSIN', 'WARD'];

export const relationMessage = (relation: string): Msg =>
  (familyMessages as Record<string, Msg>)[`relation${relation}`] ?? { id: relation, defaultMessage: relation };

/** Half-sibling, Cousin or Ward; nothing for a sibling (the usual case) unless `always` */
export function RelationChip({ relation, always }: { relation: FamilyRelation; always?: boolean }) {
  const intl = useIntl();
  if (relation === 'SIBLING' && !always) return null;
  return (
    <Chip size="small" variant="outlined" color="secondary" label={intl.formatMessage(relationMessage(relation))} />
  );
}

/** The reasons for a match, in words, joined with " · " */
export function useReasonsText() {
  const intl = useIntl();
  return (reasons: readonly string[], fatherScore?: number) =>
    orderReasons(reasons)
      .map((r) => {
        if (r === 'SIMILAR_FATHER_NAME' && fatherScore === undefined) {
          return intl.formatMessage(familyMessages.reasonSimilarFatherNoScore);
        }
        const msg = (familyMessages as Record<string, Msg>)[`reason${r}`];
        return msg ? intl.formatMessage(msg, { score: String(fatherScore) }) : r;
      })
      .join(' · ');
}

export function ReasonsText({ reasons, fatherScore }: { reasons: readonly string[]; fatherScore?: number }) {
  const text = useReasonsText();
  return (
    <Typography component="span" variant="body2" color="text.secondary">
      {text(reasons, fatherScore)}
    </Typography>
  );
}

/** What confirming does: starts a family, adds to one, or joins two */
export function OutcomeText({ outcome }: { outcome: string }) {
  const intl = useIntl();
  const msg = (familyMessages as Record<string, Msg>)[`outcome${outcome}`];
  return (
    <Typography component="span" variant="caption" color="text.secondary">
      {msg ? intl.formatMessage(msg) : outcome}
    </Typography>
  );
}

export function InactiveChip() {
  const intl = useIntl();
  return <Chip size="small" variant="outlined" label={intl.formatMessage(familyMessages.inactive)} />;
}

const FINAL_COLOR: Record<FinalResultStatus, 'success' | 'error' | 'default'> = {
  PASS: 'success',
  FAIL: 'error',
  TERMINATED: 'default',
};

/** The profile's result format: a status chip with "Rank x of y" (AdmissionSnapshot's FinalResult) */
export function ResultSummary({
  status,
  pct,
  branchRank,
  rankedOf,
  dense,
}: {
  status?: FinalResultStatus | null;
  pct?: number | null;
  branchRank?: number | null;
  rankedOf?: number | null;
  dense?: boolean;
}) {
  const intl = useIntl();
  if (!status) {
    return (
      <Typography variant="body2" color="text.secondary">
        {intl.formatMessage(familyMessages.noResult)}
      </Typography>
    );
  }
  return (
    <Stack direction={dense ? 'column' : 'row'} spacing={dense ? 0.25 : 1} alignItems={dense ? 'flex-start' : 'center'}>
      <Chip
        size="small"
        color={FINAL_COLOR[status]}
        label={
          pct !== null && pct !== undefined && status !== 'TERMINATED'
            ? `${intl.formatMessage(messages[`result${status}`])} · ${pct}%`
            : intl.formatMessage(messages[`result${status}`])
        }
      />
      {branchRank ? (
        <Typography variant="caption" color="text.secondary">
          {intl.formatMessage(familyMessages.rankOf, { rank: String(branchRank), of: String(rankedOf ?? '?') })}
        </Typography>
      ) : null}
    </Stack>
  );
}
