'use client';

import { ReactNode, useMemo } from 'react';

import { Lock as LockIcon } from '@mui/icons-material';
import { Alert, Box, Chip, Grid, Skeleton, Stack, Typography } from '@mui/material';

import {
  AdmissionResultEntity,
  FinalResultStatus,
  Permission,
  ResultPart,
  StudentProfileAdmission,
} from '@/providers/service/app.schemas';
import {
  useResultsControllerFindForAdmission,
  useResultsControllerListSteps,
} from '@/providers/service/results/results';

import { FormattedMessage } from '@/theme/FormattedMessage';

import { usePermissions } from '@/hooks/usePermissions';

import { useLocale } from '@/contexts/LocaleContext';

import messages from '../messages';
import { formatDate } from '../utils';

import { SectionCard } from './SectionCard';

const finalColor: Record<FinalResultStatus, 'success' | 'error' | 'default'> = {
  PASS: 'success',
  FAIL: 'error',
  TERMINATED: 'default',
};

const partTitle = {
  [ResultPart.THEORY]: messages.resultTheory,
  [ResultPart.WAZU]: messages.resultWazu,
  [ResultPart.NAMAZ]: messages.resultNamaz,
  [ResultPart.ATTENDANCE]: messages.resultAttendance,
};

/** Several sources can hold a row for a part; the one that counts is the most recently updated. */
function latestByPart(parts: AdmissionResultEntity[]) {
  const latest = new Map<ResultPart, AdmissionResultEntity>();
  for (const row of parts) {
    const current = latest.get(row.part);
    if (!current || row.updatedAt > current.updatedAt) latest.set(row.part, row);
  }
  return latest;
}

const fmt = (n?: number | null) => (n === null || n === undefined ? '' : String(Math.round(n * 100) / 100));

/**
 * This session's result, from GET /results/admissions/:admissionId:
 * theory, Wazu and Namaz (with the steps they got wrong), attendance, and the final result with the branch rank.
 */
export function AdmissionResults({ admission }: { admission: StudentProfileAdmission }) {
  const { has, isLoading: permissionsLoading } = usePermissions();
  const canView = has(Permission.reportsview, Permission.resultsenter);
  const { locale } = useLocale();

  const { data, isLoading, isError } = useResultsControllerFindForAdmission(admission.id, {
    query: { enabled: canView },
  });
  const { data: steps } = useResultsControllerListSteps({ query: { enabled: canView, staleTime: Infinity } });

  const stepName = useMemo(() => {
    const names = new Map(
      (steps?.data || []).map((s) => [`${s.skill}:${s.code}`, locale === 'ur' ? s.nameUr : s.nameEn]),
    );
    return (part: ResultPart, code: string) => names.get(`${part}:${code}`) || code;
  }, [steps?.data, locale]);

  const results = data?.data;
  const final = results?.final;
  const byPart = useMemo(() => latestByPart(results?.parts || []), [results?.parts]);

  const summary = final?.result ? (
    <Stack direction="row" spacing={0.5}>
      <Chip
        size="small"
        color={finalColor[final.result]}
        label={<FormattedMessage {...messages[`result${final.result}`]} />}
      />
      {final.locked && (
        <Chip
          size="small"
          variant="outlined"
          icon={<LockIcon fontSize="small" />}
          label={<FormattedMessage {...messages.resultLocked} />}
        />
      )}
    </Stack>
  ) : undefined;

  const body = () => {
    if (permissionsLoading || (canView && isLoading)) {
      return <Skeleton variant="rounded" height={96} />;
    }
    if (!canView) {
      return (
        <Typography variant="body2" color="text.secondary">
          <FormattedMessage {...messages.resultsNotAllowed} />
        </Typography>
      );
    }
    if (isError || !results) {
      return (
        <Alert severity="error" sx={{ py: 0 }}>
          <FormattedMessage {...messages.resultsLoadError} />
        </Alert>
      );
    }
    if (byPart.size === 0 && !final) {
      return (
        <Typography variant="body2" color="text.secondary">
          <FormattedMessage {...messages.resultsNone} />
        </Typography>
      );
    }

    return (
      <Stack spacing={2}>
        <Grid container spacing={2}>
          {[ResultPart.THEORY, ResultPart.WAZU, ResultPart.NAMAZ, ResultPart.ATTENDANCE].map((part) => (
            <Grid key={part} size={{ xs: 12, sm: 6 }}>
              <PartTile part={part} row={byPart.get(part)} stepName={stepName} />
            </Grid>
          ))}
        </Grid>
        <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 1.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>
            <FormattedMessage {...messages.resultFinal} />
          </Typography>
          {final ? (
            <Stack direction="row" spacing={2} alignItems="baseline" flexWrap="wrap" useFlexGap>
              {final.total !== null && final.total !== undefined && (
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  <FormattedMessage
                    {...messages.resultTotal}
                    values={{ total: final.maxTotal ? `${fmt(final.total)}/${fmt(final.maxTotal)}` : fmt(final.total) }}
                  />
                </Typography>
              )}
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {final.branchRank ? (
                  <FormattedMessage
                    {...messages.resultRank}
                    values={{ rank: String(final.branchRank), of: String(final.rankedOf ?? '?') }}
                  />
                ) : (
                  <FormattedMessage {...messages.resultNotRanked} />
                )}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                <FormattedMessage {...messages[`source${final.source}`]} />
                {final.lockedAt && ` · ${formatDate(final.lockedAt)}`}
              </Typography>
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              <FormattedMessage {...messages.resultNotEntered} />
            </Typography>
          )}
        </Box>
      </Stack>
    );
  };

  return (
    <SectionCard title={<FormattedMessage {...messages.resultsSlotTitle} />} summary={summary}>
      {body()}
    </SectionCard>
  );
}

interface PartTileProps {
  part: ResultPart;
  row?: AdmissionResultEntity;
  stepName: (part: ResultPart, code: string) => string;
}

function PartTile({ part, row, stepName }: PartTileProps) {
  const isSteps = part === ResultPart.WAZU || part === ResultPart.NAMAZ;
  const wrong = row?.steps.filter((s) => s.correct === false) || [];

  let value: ReactNode = (
    <Typography variant="body2" color="text.secondary">
      <FormattedMessage {...messages.resultNotEntered} />
    </Typography>
  );
  if (row) {
    const score =
      part === ResultPart.ATTENDANCE ? (
        row.marks !== null && row.marks !== undefined ? (
          <FormattedMessage
            {...messages.resultDays}
            values={{ days: fmt(row.marks), total: fmt(row.maxMarks) || '?' }}
          />
        ) : null
      ) : (
        [
          row.marks !== null && row.marks !== undefined
            ? row.maxMarks
              ? `${fmt(row.marks)}/${fmt(row.maxMarks)}`
              : fmt(row.marks)
            : '',
          row.scorePct !== null && row.scorePct !== undefined ? `${fmt(row.scorePct)}%` : '',
        ]
          .filter(Boolean)
          .join(' · ')
      );
    value = (
      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
        {score && (
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {score}
          </Typography>
        )}
        {row.passed !== null && row.passed !== undefined && (
          <Chip
            size="small"
            variant="outlined"
            color={row.passed ? 'success' : 'error'}
            label={<FormattedMessage {...(row.passed ? messages.resultPassed : messages.resultFailed)} />}
          />
        )}
      </Stack>
    );
  }

  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>
        <FormattedMessage {...partTitle[part]} />
      </Typography>
      {value}
      {row && isSteps && (
        <Box sx={{ mt: 0.75 }}>
          {row.steps.length === 0 ? (
            <Typography variant="caption" color="text.secondary">
              <FormattedMessage {...messages.resultNoSteps} />
            </Typography>
          ) : wrong.length === 0 ? (
            <Typography variant="caption" color="success.main">
              <FormattedMessage {...messages.resultAllStepsRight} />
            </Typography>
          ) : (
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap alignItems="center">
              <Typography variant="caption" color="text.secondary">
                <FormattedMessage {...messages.resultWrongSteps} />:
              </Typography>
              {wrong.map((s) => (
                <Chip
                  key={s.stepCode}
                  size="small"
                  color="error"
                  variant="outlined"
                  label={stepName(part, s.stepCode)}
                />
              ))}
            </Stack>
          )}
        </Box>
      )}
      {row && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
          <FormattedMessage {...messages[`source${row.source}`]} />
          {row.assessedAt && ` · ${formatDate(row.assessedAt)}`}
        </Typography>
      )}
    </Box>
  );
}
