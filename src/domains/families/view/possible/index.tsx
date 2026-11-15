'use client';

import { useEffect, useMemo, useState } from 'react';

import { useIntl } from 'react-intl';

import { useRouter } from 'next/navigation';

import { Alert, Box, Button, Stack } from '@mui/material';

import { useSessions } from '@/domains/trainings/components/useCurrentSession';

import { DataNotFound } from '@/components/DataNotFound';
import { DetailSkeleton } from '@/components/Skeleton/DetailSkeleton';

import { FamilyStudent, SiblingSuggestion } from '@/providers/service/app.schemas';

import { routes } from '@/router/routes';

import { useChildSessions, useStudentFamily } from '../../api';
import { ChildEntry } from '../../components/ChildrenSchoolsTable';
import { OutcomeText, ReasonsText, StrengthChip } from '../../components/chips';
import { FamilyBody } from '../../components/FamilyBody';
import { DuplicateCue } from '../../components/StudentFamilyCard';
import { ConfirmSiblingDialog, NotSiblingsDialog, PairStudent } from '../../dialogs/SiblingDialogs';
import messages from '../../messages';
import { useFamiliesAccess } from '../../permissions';
import { byBirthOrder } from '../../rules';

const toPair = (s: FamilyStudent): PairStudent => ({
  id: s.id,
  name: s.name,
  grNumber: s.grNumber,
  fatherName: s.fatherName,
});

/**
 * A household that isn't confirmed yet (UX spec, "Possible family"): the student and their strong and medium
 * possible siblings, with the same tables and a Confirm on each. The first confirm makes the family.
 */
export function PossibleFamily({ studentId }: { studentId: string }) {
  const intl = useIntl();
  const router = useRouter();
  const access = useFamiliesAccess();
  const { current: currentSession } = useSessions();
  const { data, isLoading } = useStudentFamily(studentId);
  const [showWeak, setShowWeak] = useState(false);
  const [confirming, setConfirming] = useState<SiblingSuggestion | null>(null);
  const [rejecting, setRejecting] = useState<SiblingSuggestion | null>(null);

  const entity = data?.data;
  useEffect(() => {
    if (entity?.family) router.replace(routes.families.detail(entity.family.id));
  }, [entity?.family, router]);

  const suggestions = useMemo(
    () => (entity?.suggestions ?? []).filter((s) => showWeak || s.level !== 'WEAK'),
    [entity?.suggestions, showWeak],
  );
  const weakCount = (entity?.suggestions ?? []).filter((s) => s.level === 'WEAK').length;
  const ids = useMemo(
    () => (entity ? [entity.student.id, ...suggestions.map((s) => s.student.id)] : []),
    [entity, suggestions],
  );
  const childSessions = useChildSessions(ids);

  if (isLoading || entity?.family) return <DetailSkeleton />;
  if (!entity) return <DataNotFound notFoundMessage={intl.formatMessage(messages.notFound)} />;

  const me = entity.student;
  const byStudent = new Map(suggestions.map((s) => [s.student.id, s]));
  const entries: ChildEntry[] = [me, ...suggestions.map((s) => s.student)].sort(byBirthOrder).map((s) => {
    const suggestion = byStudent.get(s.id);
    return {
      ...s,
      isThis: s.id === me.id,
      dashed: !!suggestion,
      admission: s.admission,
      extra: suggestion ? (
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <StrengthChip level={suggestion.level} />
          <ReasonsText reasons={suggestion.reasons} fatherScore={suggestion.fatherScore} />
          <Box sx={{ flex: 1 }} />
          <OutcomeText outcome={suggestion.outcome} />
        </Stack>
      ) : undefined,
      actions:
        suggestion && access.canManage && s.isActive ? (
          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
            <Button size="small" variant="contained" onClick={() => setConfirming(suggestion)}>
              {intl.formatMessage(messages.confirmSibling)}
            </Button>
            <Button size="small" onClick={() => setRejecting(suggestion)}>
              {intl.formatMessage(messages.notSiblings)}
            </Button>
          </Stack>
        ) : undefined,
    };
  });

  return (
    <Stack spacing={2}>
      <FamilyBody
        possible
        entries={entries}
        childSessions={childSessions}
        current={currentSession ? { id: currentSession.id, name: currentSession.name, isCurrent: true } : undefined}
        banner={
          <Stack spacing={1}>
            <Alert severity="warning" variant="outlined" sx={{ borderStyle: 'dashed' }}>
              {intl.formatMessage(messages.notConfirmedBanner, { name: me.name })}
            </Alert>
            {entity.possibleDuplicates.map((d) => (
              <DuplicateCue key={d.student.id} studentId={me.id} duplicate={d} canMerge={access.canMerge} />
            ))}
            {weakCount > 0 && (
              <Box>
                <Button size="small" onClick={() => setShowWeak((v) => !v)}>
                  {showWeak
                    ? intl.formatMessage(messages.hideWeak)
                    : intl.formatMessage(messages.showWeak, { count: weakCount })}
                </Button>
              </Box>
            )}
          </Stack>
        }
      />
      <ConfirmSiblingDialog
        open={!!confirming}
        a={toPair(me)}
        b={confirming ? toPair(confirming.student) : null}
        pair={confirming ?? undefined}
        canMerge={access.canMerge}
        onClose={() => setConfirming(null)}
        onConfirmed={(result) => router.push(routes.families.detail(result.family.id))}
      />
      <NotSiblingsDialog
        open={!!rejecting}
        a={toPair(me)}
        b={rejecting ? toPair(rejecting.student) : null}
        onClose={() => setRejecting(null)}
      />
    </Stack>
  );
}
