'use client';

import { useMemo } from 'react';

import { Card, CardContent, Chip, Grid, Stack, Typography } from '@mui/material';

import { DataNotFound } from '@/components/DataNotFound';
import InfoTooltip from '@/components/DataTable/InfoTooltipColumn/Tooltip';
import { DetailItem } from '@/components/DetailItem';
import { DetailTooltipWrapper } from '@/components/DetailTooltipWrapper';
import { DetailSkeleton } from '@/components/Skeleton/DetailSkeleton';

import { KEYS } from '@/providers/constants/key';
import { useAdmissionsControllerFindOne } from '@/providers/service/admissions/admissions';

import { FormattedMessage, useFormattedMessage } from '@/theme/FormattedMessage';

import { useEntityDetailHandler } from '@/hooks/useEntityDetailHandler';

import messages from './messages';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'VERIFIED':
      return 'success';
    case 'REJECTED':
      return 'error';
    case 'DUPLICATE_MERGED':
      return 'warning';
    default:
      return 'default';
  }
};

export function AdmissionDetail({ admissionId }: { admissionId: string }) {
  const {
    data: { data: admissionDetail } = {},
    isLoading,
    isFetching,
    error,
  } = useAdmissionsControllerFindOne(admissionId, undefined, {
    query: { queryKey: [KEYS.ADMISSION_DETAIL, admissionId] },
  });

  const studentFields: { value?: string | number; label: keyof typeof messages }[] = useMemo(() => {
    return [
      {
        label: 'grNumberLabel',
        value: admissionDetail?.student?.grNumber,
      },
      {
        label: 'nameLabel',
        value: admissionDetail?.student?.name,
      },
      {
        label: 'fatherNameLabel',
        value: admissionDetail?.student?.fatherName,
      },
      {
        label: 'phoneLabel',
        value: admissionDetail?.student?.phone,
      },
      {
        label: 'alternatePhoneLabel',
        value: admissionDetail?.student?.alternatePhone,
      },
      {
        label: 'dateOfBirthLabel',
        value: admissionDetail?.student?.dateOfBirth,
      },
      {
        label: 'genderLabel',
        value: admissionDetail?.student?.gender,
      },
      {
        label: 'addressLabel',
        value: admissionDetail?.student?.address,
      },
      {
        label: 'identityNumberLabel',
        value: admissionDetail?.student?.identityNumber,
      },
    ];
  }, [admissionDetail?.student]);

  const admissionFields: { value?: string | number; label: keyof typeof messages }[] = useMemo(() => {
    return [
      {
        label: 'idLabel',
        value: admissionDetail?.id,
      },
      {
        label: 'branchLabel',
        value: admissionDetail?.branch?.name,
      },
      {
        label: 'areaLabel',
        value: admissionDetail?.area?.name,
      },
      {
        label: 'sessionLabel',
        value: admissionDetail?.session?.name,
      },
      {
        label: 'classLevelLabel',
        value: admissionDetail?.classLevel?.name,
      },
    ];
  }, [admissionDetail]);

  const additionalFields: { value?: string | number | boolean; label: keyof typeof messages; isBoolean?: boolean }[] =
    useMemo(() => {
      return [
        {
          label: 'schoolNameLabel',
          value: admissionDetail?.schoolName,
        },
        {
          label: 'schoolClassLabel',
          value: admissionDetail?.schoolClass,
        },
        {
          label: 'lastYearClassLabel',
          value: admissionDetail?.lastYearClass,
        },
        {
          label: 'vanRequiredLabel',
          value: admissionDetail?.vanRequired,
          isBoolean: true,
        },
        {
          label: 'isMarriedLabel',
          value: admissionDetail?.isMarried,
          isBoolean: true,
        },
        {
          label: 'isWorkingLabel',
          value: admissionDetail?.isWorking,
          isBoolean: true,
        },
        {
          label: 'isFinalizedLabel',
          value: admissionDetail?.isFinalized,
          isBoolean: true,
        },
        {
          label: 'isFeePaidLabel',
          value: admissionDetail?.isFeePaid,
          isBoolean: true,
        },
      ];
    }, [admissionDetail]);

  const formattedMessages = {
    failToFetch: useFormattedMessage(messages.failToFetch),
    notFound: useFormattedMessage(messages.notFound),
    successUpdate: useFormattedMessage(messages.successUpdate),
    errorUpdate: useFormattedMessage(messages.errorUpdate),
    yes: useFormattedMessage(messages.yes),
    no: useFormattedMessage(messages.no),
  };

  useEntityDetailHandler({
    data: admissionDetail,
    isLoading: isLoading || isFetching,
    notFoundMessage: formattedMessages.failToFetch,
    isEnabled: true,
    // @ts-expect-error error type is unknown
    error: error?.statusCode,
  });

  if (isLoading) return <DetailSkeleton />;

  if (!admissionDetail) {
    return <DataNotFound notFoundMessage={formattedMessages.notFound} />;
  }

  return (
    <Stack spacing={2}>
      {/* Status Card */}
      <Card>
        <CardContent>
          <DetailTooltipWrapper>
            <InfoTooltip createdAt={admissionDetail?.createdAt} updatedAt={admissionDetail?.updatedAt} />
          </DetailTooltipWrapper>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, md: 6, lg: 3 }}>
              <Typography variant="subtitle2" color="text.secondary">
                <FormattedMessage {...messages.statusLabel} />
              </Typography>
              <Chip
                label={admissionDetail?.status}
                color={getStatusColor(admissionDetail?.status)}
                size="small"
                sx={{ mt: 0.5 }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Student Information */}
      <Typography variant="h6">
        <FormattedMessage {...messages.studentInfoLabel} />
      </Typography>
      <Card>
        <CardContent>
          <Grid container spacing={2}>
            {studentFields.map((field, idx) => (
              <DetailItem
                key={`student-${idx}`}
                label={<FormattedMessage {...messages?.[field.label]} />}
                value={field.value}
              />
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Admission Information */}
      <Typography variant="h6">
        <FormattedMessage {...messages.admissionInfoLabel} />
      </Typography>
      <Card>
        <CardContent>
          <Grid container spacing={2}>
            {admissionFields.map((field, idx) => (
              <DetailItem
                key={`admission-${idx}`}
                label={<FormattedMessage {...messages?.[field.label]} />}
                value={field.value}
              />
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Typography variant="h6">
        <FormattedMessage {...messages.additionalInfoLabel} />
      </Typography>
      <Card>
        <CardContent>
          <Grid container spacing={2}>
            {additionalFields.map((field, idx) => (
              <DetailItem
                key={`additional-${idx}`}
                label={<FormattedMessage {...messages?.[field.label]} />}
                value={field.isBoolean ? (field.value ? formattedMessages.yes : formattedMessages.no) : field.value}
              />
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Stack>
  );
}
