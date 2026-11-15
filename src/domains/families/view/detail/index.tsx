'use client';

import { useMemo, useState } from 'react';

import { useIntl } from 'react-intl';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Add as AddIcon } from '@mui/icons-material';
import { Alert, Button, Chip, Stack } from '@mui/material';

import { useNotify } from '@/domains/schools/components/common';
import { formatDate } from '@/domains/students/utils';

import { DataNotFound } from '@/components/DataNotFound';
import { RowMenu } from '@/components/RowMenu';
import { DetailSkeleton } from '@/components/Skeleton/DetailSkeleton';

import { FamilyEntity, FamilyMemberEntity } from '@/providers/service/app.schemas';
import { useFamiliesControllerFindOne } from '@/providers/service/families/families';

import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi';

import { routes } from '@/router/routes';

import { extractNetworkError } from '@/utils/extractNetworkError';

import { useChildSessions } from '../../api';
import { ChildEntry } from '../../components/ChildrenSchoolsTable';
import { FamilyBody } from '../../components/FamilyBody';
import { HouseholdHistory } from '../../components/HouseholdHistory';
import { MatrixChild } from '../../components/ResultsMatrix';
import { AddChildDialog, EndMembershipDialog, MembershipDialog } from '../../dialogs/MembershipDialogs';
import messages from '../../messages';
import { useFamiliesAccess } from '../../permissions';
import { byBirthOrder } from '../../rules';

type Editing =
  | { kind: 'relation' | 'since'; member: FamilyMemberEntity }
  | { kind: 'MOVED_OUT' | 'LINKED_IN_ERROR'; member: FamilyMemberEntity };

/** A confirmed household (UX spec, screen 3) */
export function FamilyDetail({ id }: { id: string }) {
  const intl = useIntl();
  const router = useRouter();
  const notify = useNotify();
  const access = useFamiliesAccess();
  const { isAuthenticated } = useAuthenticatedApi();
  const { data, isLoading, error } = useFamiliesControllerFindOne(id, undefined, {
    query: { enabled: isAuthenticated && !!id },
  });
  const family = data?.data;
  const [editing, setEditing] = useState<Editing | null>(null);
  const [adding, setAdding] = useState(false);

  const members = useMemo(() => [...(family?.members ?? [])].sort(byBirthOrder), [family?.members]);
  // Everyone who was ever a member, for names in the history and rows in the results
  const everyone = useMemo(
    () => [...new Set([...members.map((m) => m.id), ...(family?.history ?? []).map((h) => h.studentId)])],
    [members, family?.history],
  );
  const childSessions = useChildSessions(everyone);

  if (isLoading) return <DetailSkeleton />;
  if (!family) {
    // @ts-expect-error error shape comes from the API
    if (!error || error?.statusCode === 404)
      return <DataNotFound notFoundMessage={intl.formatMessage(messages.notFound)} />;
    return (
      <Alert severity="error">
        {intl.formatMessage(messages.loadError)}: {extractNetworkError(error)}
      </Alert>
    );
  }

  const canEdit = access.canManage && family.isActive;
  const current = { id: family.session.id, name: family.session.name, isCurrent: !family.asOf };

  const entries: ChildEntry[] = members.map((m) => ({
    ...m,
    admission: m.admission,
    note: m.validFrom ? intl.formatMessage(messages.inFamilySince, { date: formatDate(m.validFrom) }) : undefined,
    actions: canEdit ? (
      <RowMenu
        items={[
          {
            key: 'relation',
            label: intl.formatMessage(messages.changeRelation),
            onClick: () => setEditing({ kind: 'relation', member: m }),
          },
          {
            key: 'since',
            label: intl.formatMessage(messages.changeSince),
            onClick: () => setEditing({ kind: 'since', member: m }),
          },
          {
            key: 'moved',
            label: intl.formatMessage(messages.movedOut),
            onClick: () => setEditing({ kind: 'MOVED_OUT', member: m }),
          },
          {
            key: 'error',
            label: intl.formatMessage(messages.linkedInError),
            onClick: () => setEditing({ kind: 'LINKED_IN_ERROR', member: m }),
          },
        ]}
      />
    ) : undefined,
  }));

  // Results: every child who was ever a member (not linked in error), those who left muted
  const currentIds = new Set(members.map((m) => m.id));
  const left = new Map<string, string>();
  const errorOnly = new Set<string>();
  for (const h of family.history ?? []) {
    if (h.endReason === 'LINKED_IN_ERROR') errorOnly.add(h.studentId);
    else if (h.validTo && !currentIds.has(h.studentId)) left.set(h.studentId, h.validTo);
  }
  for (const h of family.history ?? []) if (h.endReason !== 'LINKED_IN_ERROR') errorOnly.delete(h.studentId);
  const matrixRows: MatrixChild[] = everyone
    .filter((sid) => !errorOnly.has(sid))
    .map((sid) => childSessions.byId.get(sid))
    .filter((c): c is NonNullable<typeof c> => !!c)
    .filter((c, i, all) => all.findIndex((x) => x.id === c.id) === i)
    .sort(byBirthOrder)
    .map((child) => ({ child, leftAt: currentIds.has(child.id) ? undefined : left.get(child.id) }));

  const names = new Map<string, string>([
    ...members.map((m) => [m.id, m.name] as [string, string]),
    ...childSessions.students.map((s) => [s.requestedId, s.name] as [string, string]),
  ]);

  const onEnded = (after: FamilyEntity) => {
    if (!after.isActive) {
      notify.success(intl.formatMessage(messages.nowClosed));
      router.push(routes.families.listing);
    }
  };

  return (
    <Stack spacing={2}>
      <FamilyBody
        entries={entries}
        childSessions={childSessions}
        current={current}
        schooling={family.schooling}
        createdAt={family.createdAt}
        chips={
          !family.isActive ? (
            <Chip
              size="small"
              color="default"
              label={intl.formatMessage(family.mergedIntoFamilyId ? messages.mergedInto : messages.closed)}
            />
          ) : undefined
        }
        actions={
          canEdit ? (
            <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setAdding(true)}>
              {intl.formatMessage(messages.addChild)}
            </Button>
          ) : undefined
        }
        banner={
          !family.isActive ? (
            <Alert
              severity="warning"
              action={
                family.mergedIntoFamilyId ? (
                  <Button
                    size="small"
                    color="inherit"
                    component={Link}
                    href={routes.families.detail(family.mergedIntoFamilyId)}
                  >
                    {intl.formatMessage(messages.openMergedInto)}
                  </Button>
                ) : undefined
              }
            >
              {intl.formatMessage(messages.closedBanner)}
            </Alert>
          ) : undefined
        }
        matrixRows={matrixRows}
        history={<HouseholdHistory family={family} names={names} />}
      />

      {editing && (editing.kind === 'relation' || editing.kind === 'since') && (
        <MembershipDialog
          open
          mode={editing.kind}
          familyId={family.id}
          member={editing.member}
          onClose={() => setEditing(null)}
        />
      )}
      {editing && (editing.kind === 'MOVED_OUT' || editing.kind === 'LINKED_IN_ERROR') && (
        <EndMembershipDialog
          open
          reason={editing.kind}
          familyId={family.id}
          member={editing.member}
          onClose={() => setEditing(null)}
          onEnded={onEnded}
        />
      )}
      {canEdit && (
        <AddChildDialog open={adding} family={family} canMerge={access.canMerge} onClose={() => setAdding(false)} />
      )}
    </Stack>
  );
}
