'use client';

import { useMemo, useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Add as AddIcon, SwapHoriz as OverrideIcon } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Checkbox,
  Chip,
  FormControlLabel,
  Grid,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';

import { cardStyle } from '@/domains/students/utils';

import { BranchFilter } from '@/components/BranchFilter';
import { PageHeading } from '@/components/PageHeading';
import { SessionFilter } from '@/components/SessionFilter';

import { ClassLevel, Section } from '@/providers/service/app.schemas';
import { useSectionControllerUnassignedSummary } from '@/providers/service/section/section';

import { FormattedMessage } from '@/theme/FormattedMessage';

import { routes } from '@/router/routes';

import { extractNetworkError } from '@/utils/extractNetworkError';

import { SectionDialog } from '../../dialogs/SectionDialog';
import { classNumberOf, useAllSections, useClassLevels, useSessionBranchFilters } from '../../hooks/useSectionData';
import messages from '../../messages';

/**
 * The sections of one session and branch, grouped by class: each class level's sections with
 * their teachers and student counts, and how many of its students aren't placed yet.
 */
export function SectionsOverview() {
  const router = useRouter();
  const { sessionId, branchId } = useSessionBranchFilters();
  const [showClosed, setShowClosed] = useState(false);
  const [adding, setAdding] = useState<{ classLevelId?: string } | null>(null);

  const ready = !!sessionId && !!branchId;
  const { levels } = useClassLevels();
  const { data: sections, isLoading, isError, error } = useAllSections({ sessionId, branchId });
  const { data: summary } = useSectionControllerUnassignedSummary(
    { sessionId: sessionId ?? '', branchId },
    { query: { enabled: ready } },
  );

  // One row per class level that has sections or unplaced students
  const rows = useMemo(() => {
    const unplaced = new Map((summary?.data || []).map((u) => [u.classLevelId, u.count]));
    const byLevel = new Map<string, Section[]>();
    for (const s of sections || []) {
      if (!showClosed && !s.isActive) continue;
      byLevel.set(s.classLevelId, [...(byLevel.get(s.classLevelId) || []), s]);
    }
    return levels
      .filter((l) => byLevel.has(l.id) || unplaced.has(l.id))
      .map((level) => ({ level, sections: byLevel.get(level.id) || [], unplaced: unplaced.get(level.id) ?? 0 }));
  }, [levels, sections, summary?.data, showClosed]);

  // Group the gendered class levels by class number, so a class's letters read together
  const groups = useMemo(() => {
    const out = new Map<string, typeof rows>();
    for (const r of rows) {
      const key = classNumberOf(r.level.code);
      out.set(key, [...(out.get(key) || []), r]);
    }
    return [...out.entries()];
  }, [rows]);

  return (
    <Stack>
      <PageHeading
        heading={messages.overviewTitle}
        onAddPress={ready ? () => setAdding({}) : undefined}
        rightActions={
          <Button
            variant="outlined"
            startIcon={<OverrideIcon />}
            component={Link}
            href={routes.sections.classOverride}
            sx={{ borderRadius: '999px', textTransform: 'none', fontWeight: 600 }}
          >
            <FormattedMessage {...messages.bulkOverride} />
          </Button>
        }
      />

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        alignItems={{ md: 'center' }}
        sx={{ ...cardStyle, bgcolor: 'background.paper', p: 2, mb: 2 }}
      >
        <SessionFilter />
        <BranchFilter />
        <FormControlLabel
          control={<Checkbox checked={showClosed} onChange={(e) => setShowClosed(e.target.checked)} />}
          label={<FormattedMessage {...messages.showClosed} />}
        />
      </Stack>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        <FormattedMessage {...messages.lettersNote} />
      </Typography>

      {!ready && (
        <Alert severity="info" sx={{ borderRadius: 3 }}>
          <FormattedMessage {...messages.pickSessionBranch} />
        </Alert>
      )}
      {isError && <Alert severity="error">{extractNetworkError(error)}</Alert>}
      {ready && isLoading && <Skeleton variant="rounded" height={240} sx={{ borderRadius: 3 }} />}
      {ready && !isLoading && groups.length === 0 && (
        <Alert severity="info" sx={{ borderRadius: 3 }}>
          <FormattedMessage {...messages.noClasses} />
        </Alert>
      )}

      <Stack spacing={2}>
        {groups.map(([classNumber, levelRows]) => (
          <Card key={classNumber} sx={cardStyle}>
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5 }}>
                {classNumber}
              </Typography>
              <Stack spacing={2}>
                {levelRows.map(({ level, sections: levelSections, unplaced }) => (
                  <LevelRow
                    key={level.id}
                    level={level}
                    sections={levelSections}
                    unplaced={unplaced}
                    onAdd={() => setAdding({ classLevelId: level.id })}
                    onOpen={(s) => router.push(routes.sections.detail(s.id))}
                  />
                ))}
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {sessionId && branchId && (
        <SectionDialog
          open={!!adding}
          sessionId={sessionId}
          branchId={branchId}
          classLevelId={adding?.classLevelId}
          onClose={() => setAdding(null)}
        />
      )}
    </Stack>
  );
}

interface LevelRowProps {
  level: ClassLevel;
  sections: Section[];
  unplaced: number;
  onAdd: () => void;
  onOpen: (section: Section) => void;
}

function LevelRow({ level, sections, unplaced, onAdd, onOpen }: LevelRowProps) {
  return (
    <Box>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {level.name}
        </Typography>
        <Chip
          size="small"
          color={unplaced ? 'warning' : 'success'}
          variant="outlined"
          label={
            unplaced ? (
              <FormattedMessage {...messages.unplaced} values={{ count: String(unplaced) }} />
            ) : (
              <FormattedMessage {...messages.allPlaced} />
            )
          }
        />
        <Box sx={{ flex: 1 }} />
        <Button size="small" startIcon={<AddIcon />} onClick={onAdd}>
          <FormattedMessage {...messages.addSection} />
        </Button>
      </Stack>
      {sections.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          <FormattedMessage {...messages.noSections} />
        </Typography>
      ) : (
        <Grid container spacing={1.5}>
          {sections.map((s) => (
            <Grid key={s.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Card variant="outlined" sx={{ borderRadius: 2, opacity: s.isActive ? 1 : 0.6, height: '100%' }}>
                <CardActionArea onClick={() => onOpen(s)} sx={{ height: '100%' }}>
                  <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: 1.5,
                          bgcolor: 'primary.main',
                          color: 'common.white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: 18,
                          flexShrink: 0,
                        }}
                      >
                        {s.letter}
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                          {s.displayName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          <FormattedMessage {...messages.students} values={{ count: String(s.studentCount) }} />
                          {!s.isActive && (
                            <>
                              {' · '}
                              <FormattedMessage {...messages.inactive} />
                            </>
                          )}
                        </Typography>
                      </Box>
                    </Stack>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }} noWrap>
                      {s.teachers.length ? (
                        s.teachers.map((t) => t.name).join(', ')
                      ) : (
                        <FormattedMessage {...messages.noTeacher} />
                      )}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
