'use client';

import { Alert, Stack, Typography } from '@mui/material';

import { StudentTrainingsCard } from '@/domains/trainings/view/enrollments/StudentTrainingsView';

import { DataNotFound } from '@/components/DataNotFound';
import { DetailSkeleton } from '@/components/Skeleton/DetailSkeleton';

import { useStudentsControllerGetProfile } from '@/providers/service/students/students';

import { FormattedMessage, useFormattedMessage } from '@/theme/FormattedMessage';

import { extractNetworkError } from '@/utils/extractNetworkError';

import { AdmissionPanel } from '../../components/AdmissionPanel';
import { IdentitySection } from '../../components/IdentitySection';
import { ProfileHeader } from '../../components/ProfileHeader';
import { studentProfileKey } from '../../hooks/useProfileActions';
import messages from '../../messages';

/**
 * Everything about one student, from GET /students/:id/profile:
 * header with the most-used facts, identity and documents, then every admission.
 */
export function StudentProfileView({ studentId }: { studentId: string }) {
  const notFound = useFormattedMessage(messages.notFound);
  const { data, isLoading, error } = useStudentsControllerGetProfile(studentId, {
    query: { queryKey: studentProfileKey(studentId), enabled: !!studentId },
  });
  const profile = data?.data;

  if (isLoading) return <DetailSkeleton />;

  if (!profile) {
    // @ts-expect-error error shape comes from the API
    if (error?.statusCode === 404 || !error) return <DataNotFound notFoundMessage={notFound} />;
    return (
      <Alert severity="error" sx={{ borderRadius: 3 }}>
        <FormattedMessage {...messages.loadError} />: {extractNetworkError(error)}
      </Alert>
    );
  }

  return (
    <Stack spacing={2.5}>
      {!profile.student.isActive && (
        <Alert severity="warning" sx={{ borderRadius: 3 }}>
          <FormattedMessage {...messages.studentInactive} />
        </Alert>
      )}

      <ProfileHeader profile={profile} />
      <IdentitySection student={profile.student} />
      <StudentTrainingsCard studentId={profile.student.id} />

      <Stack spacing={1.5}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          <FormattedMessage {...messages.admissionsHeading} values={{ count: String(profile.admissions.length) }} />
        </Typography>
        {profile.admissions.length === 0 && (
          <Typography color="text.secondary">
            <FormattedMessage {...messages.noAdmissions} />
          </Typography>
        )}
        {profile.admissions.map((admission, index) => (
          <AdmissionPanel
            key={admission.id}
            studentId={profile.student.id}
            gender={profile.student.gender}
            admission={admission}
            isLatest={index === 0}
          />
        ))}
      </Stack>
    </Stack>
  );
}
