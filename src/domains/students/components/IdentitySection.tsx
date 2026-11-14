import { Box, Grid, Stack, Typography } from '@mui/material';

import { AssetViewer } from '@/components/Asset';

import { Gender, StudentProfileAsset, StudentProfileIdentity } from '@/providers/service/app.schemas';

import { FormattedMessage } from '@/theme/FormattedMessage';

import messages from '../messages';
import { formatBirthDate, formatDateTime } from '../utils';

import { Field } from './Field';
import { SectionCard } from './SectionCard';

function DocumentThumb({ label, asset }: { label: React.ReactNode; asset?: StudentProfileAsset }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
        {label}
      </Typography>
      {asset ? (
        <Box sx={{ width: 140, height: 100, borderRadius: 1.5, overflow: 'hidden', bgcolor: 'grey.100' }}>
          <AssetViewer assetId={asset.id} width={140} height={100} style={{ objectFit: 'cover' }} zoomable />
        </Box>
      ) : (
        <Box
          sx={{
            width: 140,
            height: 100,
            borderRadius: 1.5,
            border: '1px dashed',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="caption" color="text.secondary">
            <FormattedMessage {...messages.noDocument} />
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export function IdentitySection({ student }: { student: StudentProfileIdentity }) {
  return (
    <SectionCard title={<FormattedMessage {...messages.identityAndContact} />}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, md: 4 }}>
              <Field label={<FormattedMessage {...messages.grNumber} />} value={student.grNumber} dir="ltr" />
            </Grid>
            <Grid size={{ xs: 6, md: 4 }}>
              <Field label={<FormattedMessage {...messages.name} />} value={student.name} />
            </Grid>
            <Grid size={{ xs: 6, md: 4 }}>
              <Field label={<FormattedMessage {...messages.fatherName} />} value={student.fatherName} />
            </Grid>
            <Grid size={{ xs: 6, md: 4 }}>
              <Field
                label={<FormattedMessage {...messages.dateOfBirth} />}
                value={formatBirthDate(student.dateOfBirth)}
                dir="ltr"
              />
            </Grid>
            <Grid size={{ xs: 6, md: 4 }}>
              <Field
                label={<FormattedMessage {...messages.gender} />}
                value={<FormattedMessage {...(student.gender === Gender.FEMALE ? messages.female : messages.male)} />}
              />
            </Grid>
            <Grid size={{ xs: 6, md: 4 }}>
              <Field
                label={<FormattedMessage {...messages.identityNumber} />}
                value={student.identityNumber}
                dir="ltr"
              />
            </Grid>
            <Grid size={{ xs: 6, md: 4 }}>
              <Field label={<FormattedMessage {...messages.phone} />} value={student.phone} dir="ltr" />
            </Grid>
            <Grid size={{ xs: 6, md: 4 }}>
              <Field
                label={<FormattedMessage {...messages.alternatePhone} />}
                value={student.alternatePhone}
                dir="ltr"
              />
            </Grid>
            <Grid size={{ xs: 6, md: 4 }}>
              <Field
                label={<FormattedMessage {...messages.branchOnRecord} />}
                value={[student.branch?.code, student.area?.name].filter(Boolean).join(' · ')}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <Field label={<FormattedMessage {...messages.address} />} value={student.address} />
            </Grid>
            <Grid size={{ xs: 6, md: 4 }}>
              <Field
                label={<FormattedMessage {...messages.lastChangedBy} />}
                value={formatDateTime(student.updatedAt)}
                caption={student.updatedByAdmin?.name}
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack direction="row" spacing={2}>
            <DocumentThumb label={<FormattedMessage {...messages.photo} />} asset={student.photoAsset} />
            <DocumentThumb
              label={<FormattedMessage {...messages.identityProof} />}
              asset={student.identityProofAsset}
            />
          </Stack>
        </Grid>
      </Grid>
    </SectionCard>
  );
}
