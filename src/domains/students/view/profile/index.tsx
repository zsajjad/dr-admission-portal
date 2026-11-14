'use client';

import { useMemo, useState } from 'react';

import { Alert, Grid, Stack, Typography } from '@mui/material';

import { useSessions } from '@/domains/trainings/components/useCurrentSession';
import { useTrainingsAccess } from '@/domains/trainings/permissions';
import { StudentSessionTrainingsCard } from '@/domains/trainings/view/enrollments/StudentTrainingsView';

import { DataNotFound } from '@/components/DataNotFound';
import { DetailSkeleton } from '@/components/Skeleton/DetailSkeleton';

import { useStudentsControllerGetProfile } from '@/providers/service/students/students';

import { FormattedMessage, useFormattedMessage } from '@/theme/FormattedMessage';

import { extractNetworkError } from '@/utils/extractNetworkError';

import { AdmissionPanel, admissionPanelId } from '../../components/AdmissionPanel';
import { AdmissionSnapshot } from '../../components/AdmissionSnapshot';
import { IdentitySection } from '../../components/IdentitySection';
import { ProfileHeader } from '../../components/ProfileHeader';
import { SessionAttendance } from '../../components/SessionAttendance';
import { studentProfileKey } from '../../hooks/useProfileActions';
import messages from '../../messages';

/**
 * Everything about one student, from GET /students/:id/profile, ordered for the days classes run:
 * who they are and where they sit this session, this session's attendance and Fiqh trainings,
 * the last two admissions side by side, every admission in full, then identity and documents.
 */
export function StudentProfileView({ studentId }: { studentId: string }) {
  const notFound = useFormattedMessage(messages.notFound);
  const { data, isLoading, error } = useStudentsControllerGetProfile(studentId, {
    query: { queryKey: studentProfileKey(studentId), enabled: !!studentId },
  });
  const profile = data?.data;
  const { current: currentSession } = useSessions();
  const { canRead: canReadTrainings } = useTrainingsAccess();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const current = useMemo(() => {
    const inSession = (profile?.admissions ?? []).filter((a) =>
      currentSession ? a.session.id === currentSession.id : a.session.isActive,
    );
    return inSession.find((a) => a.isActive) ?? inSession[0];
  }, [profile?.admissions, currentSession]);

  const setPanel = (id: string, open: boolean) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (open) next.add(id);
      else next.delete(id);
      return next;
    });

  const showDetails = (id: string) => {
    setPanel(id, true);
    requestAnimationFrame(() =>
      document.getElementById(admissionPanelId(id))?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
    );
  };

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

  const recent = profile.admissions.slice(0, 2);

  return (
    <Stack spacing={2.5}>
      {!profile.student.isActive && (
        <Alert severity="warning" sx={{ borderRadius: 3 }}>
          <FormattedMessage {...messages.studentInactive} />
        </Alert>
      )}

      <ProfileHeader profile={profile} current={current} />

      {/* This session */}
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: canReadTrainings ? 7 : 12 }}>
          <SessionAttendance studentId={profile.student.id} admission={current} sessionName={currentSession?.name} />
        </Grid>
        {canReadTrainings && (
          <Grid size={{ xs: 12, lg: 5 }}>
            <StudentSessionTrainingsCard
              studentId={profile.student.id}
              sessionId={current?.session.id ?? currentSession?.id}
            />
          </Grid>
        )}
      </Grid>

      {/* The last two admissions, side by side */}
      {recent.length > 0 && (
        <Stack spacing={1.5}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            <FormattedMessage {...messages.recentAdmissions} />
          </Typography>
          <Grid container spacing={2.5}>
            {recent.map((a) => (
              <Grid key={a.id} size={{ xs: 12, lg: 6 }}>
                <AdmissionSnapshot
                  admission={a}
                  isCurrent={a.id === current?.id}
                  onShowDetails={() => showDetails(a.id)}
                />
              </Grid>
            ))}
          </Grid>
        </Stack>
      )}

      {/* Every admission in full, with its actions */}
      <Stack spacing={1.5}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          <FormattedMessage {...messages.admissionsHeading} values={{ count: String(profile.admissions.length) }} />
        </Typography>
        {profile.admissions.length === 0 && (
          <Typography color="text.secondary">
            <FormattedMessage {...messages.noAdmissions} />
          </Typography>
        )}
        {profile.admissions.map((admission) => (
          <AdmissionPanel
            key={admission.id}
            studentId={profile.student.id}
            gender={profile.student.gender}
            admission={admission}
            isCurrent={admission.id === current?.id}
            expanded={expanded.has(admission.id)}
            onExpandedChange={(open) => setPanel(admission.id, open)}
            hideAttendance={admission.id === current?.id}
          />
        ))}
      </Stack>

      <IdentitySection student={profile.student} />
    </Stack>
  );
}
