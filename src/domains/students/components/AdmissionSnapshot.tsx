'use client';

import { ReactNode } from 'react';

import { ExpandMore as DetailsIcon } from '@mui/icons-material';
import { Box, Button, Card, CardContent, Chip, Grid, Skeleton, Stack, Typography } from '@mui/material';

import { FinalResultStatus, Permission, StudentProfileAdmission } from '@/providers/service/app.schemas';
import { useResultsControllerFindForAdmission } from '@/providers/service/results/results';

import { FormattedMessage } from '@/theme/FormattedMessage';

import { usePermissions } from '@/hooks/usePermissions';

import messages from '../messages';
import { admissionStatusColor, admissionStatusMessage, cardStyle, contrastText, vanEligibilityMessage } from '../utils';

const finalColor: Record<FinalResultStatus, 'success' | 'error' | 'default'> = {
  PASS: 'success',
  FAIL: 'error',
  TERMINATED: 'default',
};

function Fact({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
        {label}
      </Typography>
      <Typography variant="body2" component="div" sx={{ fontWeight: 600 }}>
        {children}
      </Typography>
    </Box>
  );
}

/** The final result and rank, when the admin may see results */
function FinalResult({ admissionId }: { admissionId: string }) {
  const { has } = usePermissions();
  const canView = has(Permission.reportsview, Permission.resultsenter);
  const { data, isLoading } = useResultsControllerFindForAdmission(admissionId, { query: { enabled: canView } });
  if (!canView) return <>--</>;
  if (isLoading) return <Skeleton width={80} />;
  const final = data?.data?.final;
  if (!final?.result) return <FormattedMessage {...messages.resultNotEntered} />;
  return (
    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
      <Chip
        size="small"
        color={finalColor[final.result]}
        label={<FormattedMessage {...messages[`result${final.result}`]} />}
      />
      {final.branchRank ? (
        <Typography variant="caption" color="text.secondary">
          <FormattedMessage
            {...messages.resultRank}
            values={{ rank: String(final.branchRank), of: String(final.rankedOf ?? '?') }}
          />
        </Typography>
      ) : null}
    </Stack>
  );
}

interface AdmissionSnapshotProps {
  admission: StudentProfileAdmission;
  /** This session's admission */
  isCurrent: boolean;
  /** Opens the full admission below, with its actions */
  onShowDetails: () => void;
}

/** One admission at a glance: class, section, status, fee, attendance, interview and result */
export function AdmissionSnapshot({ admission: a, isCurrent, onShowDetails }: AdmissionSnapshotProps) {
  const attended = a.attendance.present + a.attendance.late;
  const total = a.attendance.totalDays;
  const classTeacher = a.section?.teachers[0];

  return (
    <Card sx={{ ...cardStyle, height: '100%', opacity: a.isActive ? 1 : 0.75 }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 0.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {a.session.name}
          </Typography>
          {isCurrent && <Chip size="small" color="primary" label={<FormattedMessage {...messages.thisSession} />} />}
          {!a.isActive && <Chip size="small" label={<FormattedMessage {...messages.deactivated} />} />}
          <Chip
            size="small"
            color={admissionStatusColor(a.status)}
            label={<FormattedMessage {...admissionStatusMessage(a.status)} />}
          />
          <Chip
            size="small"
            variant={a.isFeePaid ? 'filled' : 'outlined'}
            color={a.isFeePaid ? 'success' : 'default'}
            label={<FormattedMessage {...(a.isFeePaid ? messages.feePaid : messages.feeUnpaid)} />}
          />
          <Box sx={{ flex: 1 }} />
          <Button size="small" endIcon={<DetailsIcon fontSize="small" />} onClick={onShowDetails}>
            <FormattedMessage {...messages.details} />
          </Button>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          {a.classLevel.name} · {a.branch.code} · {a.area.name}
        </Typography>

        <Grid container spacing={1.5}>
          <Grid size={{ xs: 6, md: 4 }}>
            <Fact label={<FormattedMessage {...messages.sectionSlotTitle} />}>
              {a.section ? (
                <>
                  {a.section.letter}
                  {classTeacher && (
                    <Typography component="span" variant="caption" color="text.secondary">
                      {' '}
                      · {classTeacher.name}
                    </Typography>
                  )}
                </>
              ) : (
                <Typography component="span" variant="body2" color="text.secondary">
                  <FormattedMessage {...messages.sectionNotPlacedShort} />
                </Typography>
              )}
            </Fact>
          </Grid>
          <Grid size={{ xs: 6, md: 4 }}>
            <Fact label={<FormattedMessage {...messages.attendance} />}>
              {a.attendance.recordedDays > 0 ? (
                <>
                  {attended}/{a.attendance.recordedDays}
                  <Typography component="span" variant="caption" color="text.secondary">
                    {' '}
                    · {Math.round((attended / a.attendance.recordedDays) * 100)}%
                    {a.attendance.recordedDays < total && (
                      <>
                        {' · '}
                        <FormattedMessage
                          {...messages.daysLeft}
                          values={{ days: String(total - a.attendance.recordedDays) }}
                        />
                      </>
                    )}
                  </Typography>
                </>
              ) : (
                '--'
              )}
            </Fact>
          </Grid>
          <Grid size={{ xs: 6, md: 4 }}>
            <Fact label={<FormattedMessage {...messages.interview} />}>
              {a.interview?.averageRating !== undefined ? `${a.interview.averageRating}/5` : '--'}
            </Fact>
          </Grid>
          <Grid size={{ xs: 6, md: 4 }}>
            <Fact label={<FormattedMessage {...messages.van} />}>
              {a.van ? (
                <Chip
                  size="small"
                  label={a.van.name}
                  sx={{ bgcolor: a.van.colorHex, color: contrastText(a.van.colorHex), fontWeight: 600 }}
                />
              ) : (
                <Typography component="span" variant="body2" color="text.secondary">
                  <FormattedMessage {...vanEligibilityMessage(a.vanEligibility)} />
                </Typography>
              )}
            </Fact>
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            <Fact label={<FormattedMessage {...messages.resultFinal} />}>
              <FinalResult admissionId={a.id} />
            </Fact>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
