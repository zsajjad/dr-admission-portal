'use client';

import { useMemo, useState } from 'react';

import { useIntl } from 'react-intl';

import Link from 'next/link';

import {
  Alert,
  Box,
  Button,
  Chip,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import { SectionCard } from '@/domains/students/components/SectionCard';
import { useSessions } from '@/domains/trainings/components/useCurrentSession';

import { KhatamStar } from '@/components/Ornament';

import { DuplicateSuggestion, FamilyStudent, SiblingSuggestion } from '@/providers/service/app.schemas';

import { routes } from '@/router/routes';

import { useChildSessions, latestOf, useStudentFamily } from '../api';
import { ConfirmSiblingDialog, NotSiblingsDialog, PairStudent } from '../dialogs/SiblingDialogs';
import messages from '../messages';
import { useFamiliesAccess } from '../permissions';
import { byBirthOrder } from '../rules';

import { AgeGender, ChildName, ClassText, LatestResult } from './ChildBits';
import { OutcomeText, ReasonsText, StrengthChip } from './chips';
import { SchoolCell } from './SchoolAttributes';

const toPair = (s: FamilyStudent): PairStudent => ({
  id: s.id,
  name: s.name,
  grNumber: s.grNumber,
  fatherName: s.fatherName,
});

/** "Possibly the same child as …", with the merge page for admins who can merge */
export function DuplicateCue({
  studentId,
  duplicate,
  canMerge,
}: {
  studentId: string;
  duplicate: DuplicateSuggestion;
  canMerge: boolean;
}) {
  const intl = useIntl();
  const reasons = duplicate.reasons
    .map((r) => {
      const msg = (messages as Record<string, { id: string; defaultMessage: string }>)[`dup${r}`];
      return msg ? intl.formatMessage(msg) : r;
    })
    .join(', ');
  return (
    <Alert
      severity="warning"
      sx={{ py: 0.25 }}
      action={
        canMerge ? (
          <Button
            size="small"
            color="inherit"
            component={Link}
            href={routes.studentMerge.compare(studentId, duplicate.student.id)}
          >
            {intl.formatMessage(messages.compareInMerge)}
          </Button>
        ) : undefined
      }
    >
      {intl.formatMessage(messages.duplicateCue, {
        name: duplicate.student.name,
        gr: `⁦${duplicate.student.grNumber}⁩`,
        reasons,
      })}
      {!canMerge && ` ${intl.formatMessage(messages.askMerge)}`}
    </Alert>
  );
}

/** One possible sibling: dashed, muted, with its strength, reasons, what confirming does and the two buttons */
export function SuggestionRow({
  suggestion,
  sessionName,
  canManage,
  onConfirm,
  onReject,
}: {
  suggestion: SiblingSuggestion;
  sessionName?: string;
  canManage: boolean;
  onConfirm: () => void;
  onReject: () => void;
}) {
  const intl = useIntl();
  const s = suggestion.student;
  return (
    <Box sx={{ p: 1.5, border: '1px dashed', borderColor: 'divider', borderRadius: 2 }}>
      <Stack spacing={1}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 0.5, md: 2 }} alignItems={{ md: 'flex-start' }}>
          <Box sx={{ flex: 1.4, minWidth: 0 }}>
            <ChildName student={s} />
          </Box>
          <Box sx={{ width: 56 }}>
            <AgeGender dateOfBirth={s.dateOfBirth} gender={s.gender} />
          </Box>
          <Box sx={{ flex: 1.4, minWidth: 0, color: 'text.secondary' }}>
            <ClassText admission={s.admission} sessionName={sessionName} chips={false} />
          </Box>
          <Box sx={{ flex: 1.2, minWidth: 0 }}>
            <SchoolCell
              school={s.admission?.school ? { ...s.admission.school } : null}
              canOpenSchools={false}
              chips={false}
            />
          </Box>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <StrengthChip level={suggestion.level} />
          <ReasonsText reasons={suggestion.reasons} fatherScore={suggestion.fatherScore} />
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
          <Box sx={{ flex: 1 }}>
            <OutcomeText outcome={suggestion.outcome} />
          </Box>
          {canManage && s.isActive && (
            <>
              <Button size="small" variant="contained" onClick={onConfirm}>
                {intl.formatMessage(messages.confirmSibling)}
              </Button>
              <Button size="small" onClick={onReject}>
                {intl.formatMessage(messages.notSiblings)}
              </Button>
            </>
          )}
        </Stack>
      </Stack>
    </Box>
  );
}

/**
 * The Family card on the student page (UX spec, screen 1), under the profile header. With a confirmed household:
 * every member eldest first, this student highlighted, then possible siblings. With none (households start empty):
 * one line that opens the possible siblings in place, so running-day profiles don't open with dashed rows.
 */
export function StudentFamilyCard({ studentId }: { studentId: string }) {
  const intl = useIntl();
  const access = useFamiliesAccess();
  const { current: currentSession } = useSessions();
  const { data, isLoading } = useStudentFamily(studentId, access.canRead);
  const [expanded, setExpanded] = useState(false);
  const [showWeak, setShowWeak] = useState(false);
  const [confirming, setConfirming] = useState<SiblingSuggestion | null>(null);
  const [rejecting, setRejecting] = useState<SiblingSuggestion | null>(null);

  const entity = data?.data;
  const family = entity?.family;
  const members = useMemo(() => [...(family?.members ?? [])].sort(byBirthOrder), [family?.members]);
  const suggestions = entity?.suggestions ?? [];
  const strongOrMedium = suggestions.filter((s) => s.level !== 'WEAK');
  const weak = suggestions.filter((s) => s.level === 'WEAK');
  const strongCount = suggestions.filter((s) => s.level === 'STRONG').length;

  // Members' sessions, for the latest class, school and result (one call)
  const ids = useMemo(() => members.map((m) => m.id), [members]);
  const childSessions = useChildSessions(ids);

  if (!access.canRead) return null;
  if (isLoading) return <Skeleton variant="rounded" height={72} sx={{ borderRadius: 3 }} />;
  if (!entity) return null;

  const me = entity.student;
  const sessionName = family?.session.name ?? currentSession?.name;
  const duplicates = entity.possibleDuplicates.map((d) => (
    <DuplicateCue key={d.student.id} studentId={me.id} duplicate={d} canMerge={access.canMerge} />
  ));

  const suggestionList = (
    <Stack spacing={1}>
      {strongOrMedium.map((s) => (
        <SuggestionRow
          key={s.student.id}
          suggestion={s}
          sessionName={sessionName}
          canManage={access.canManage}
          onConfirm={() => setConfirming(s)}
          onReject={() => setRejecting(s)}
        />
      ))}
      {weak.length > 0 && (
        <Box>
          <Button size="small" onClick={() => setShowWeak((v) => !v)}>
            {showWeak
              ? intl.formatMessage(messages.hideWeak)
              : intl.formatMessage(messages.showWeak, { count: weak.length })}
          </Button>
        </Box>
      )}
      {showWeak &&
        weak.map((s) => (
          <SuggestionRow
            key={s.student.id}
            suggestion={s}
            sessionName={sessionName}
            canManage={access.canManage}
            onConfirm={() => setConfirming(s)}
            onReject={() => setRejecting(s)}
          />
        ))}
    </Stack>
  );

  const dialogs = (
    <>
      <ConfirmSiblingDialog
        open={!!confirming}
        a={toPair(me)}
        b={confirming ? toPair(confirming.student) : null}
        pair={confirming ?? undefined}
        canMerge={access.canMerge}
        onClose={() => setConfirming(null)}
      />
      <NotSiblingsDialog
        open={!!rejecting}
        a={toPair(me)}
        b={rejecting ? toPair(rejecting.student) : null}
        onClose={() => setRejecting(null)}
      />
    </>
  );

  // No household yet: one line, opened in place
  if (!family) {
    if (!suggestions.length && !duplicates.length) {
      return (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ px: 0.5, color: 'text.secondary' }}>
          <KhatamStar size={12} color="var(--mui-palette-brand-gold)" />
          <Typography variant="body2" color="text.secondary">
            {intl.formatMessage(messages.nothingFound)}
          </Typography>
        </Stack>
      );
    }
    return (
      <SectionCard
        title={intl.formatMessage(messages.cardTitle)}
        actions={
          strongOrMedium.length > 0 ? (
            <Button size="small" component={Link} href={routes.families.possible(me.id)}>
              {intl.formatMessage(messages.seePossibleFamily)}
            </Button>
          ) : undefined
        }
      >
        <Stack spacing={1}>
          {duplicates}
          {suggestions.length > 0 && (
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              <Typography variant="body2" color="text.secondary">
                {intl.formatMessage(messages.possibleLine, { count: suggestions.length, strong: strongCount })}
              </Typography>
              <Button size="small" onClick={() => setExpanded((v) => !v)}>
                {intl.formatMessage(expanded ? messages.hide : messages.show)}
              </Button>
            </Stack>
          )}
          {expanded && suggestionList}
        </Stack>
        {dialogs}
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title={intl.formatMessage(messages.cardTitle)}
      summary={
        <Chip
          size="small"
          variant="outlined"
          label={intl.formatMessage(messages.cardSummary, {
            children: members.length,
            attending: family.childrenAttending,
            session: sessionName ?? '',
          })}
        />
      }
      actions={
        <Button size="small" component={Link} href={routes.families.detail(family.id)}>
          {intl.formatMessage(messages.openFamily)}
        </Button>
      }
    >
      <Stack spacing={1.5}>
        {duplicates}
        <Box sx={{ overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: 720 }}>
            <TableHead>
              <TableRow>
                <TableCell>{intl.formatMessage(messages.colChild)}</TableCell>
                <TableCell>{intl.formatMessage(messages.colAge)}</TableCell>
                <TableCell>{sessionName ?? intl.formatMessage(messages.colLatestClass)}</TableCell>
                <TableCell>{intl.formatMessage(messages.colSchool)}</TableCell>
                <TableCell>{intl.formatMessage(messages.colResult)}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {members.map((m) => {
                const isThis = m.id === me.id;
                const child = childSessions.byId.get(m.id);
                return (
                  <TableRow
                    key={m.membershipId}
                    sx={
                      isThis
                        ? {
                            bgcolor: 'var(--mui-palette-brand-goldSoft)',
                            '& > td:first-of-type': { boxShadow: 'inset 3px 0 0 var(--mui-palette-brand-gold)' },
                          }
                        : undefined
                    }
                  >
                    <TableCell sx={{ verticalAlign: 'top' }}>
                      <ChildName student={m} relation={m.relation} isThis={isThis} />
                    </TableCell>
                    <TableCell sx={{ verticalAlign: 'top' }}>
                      <AgeGender dateOfBirth={m.dateOfBirth} gender={m.gender} />
                    </TableCell>
                    <TableCell sx={{ verticalAlign: 'top' }}>
                      <ClassText admission={m.admission} latest={latestOf(child)} sessionName={sessionName} />
                    </TableCell>
                    <TableCell sx={{ verticalAlign: 'top' }}>
                      <SchoolCell
                        school={latestOf(child)?.school ?? m.admission?.school}
                        canOpenSchools={access.canOpenSchools}
                        chips={false}
                      />
                    </TableCell>
                    <TableCell sx={{ verticalAlign: 'top' }}>
                      <LatestResult child={child} visible={childSessions.resultsVisible} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
        {members.length === 1 && (
          <Typography variant="body2" color="text.secondary">
            {intl.formatMessage(messages.onlyChild)}
          </Typography>
        )}
        {suggestions.length > 0 && (
          <>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, pt: 0.5 }}>
              {intl.formatMessage(messages.possibleSiblings, { count: suggestions.length })}
            </Typography>
            {suggestionList}
          </>
        )}
      </Stack>
      {dialogs}
    </SectionCard>
  );
}
