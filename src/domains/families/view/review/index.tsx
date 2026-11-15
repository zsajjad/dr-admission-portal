'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useIntl } from 'react-intl';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Link as MuiLink,
  MenuItem,
  Pagination,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { cardStyle, useNotify } from '@/domains/schools/components/common';

import { BranchFilter } from '@/components/BranchFilter';
import { SessionFilter } from '@/components/SessionFilter';

import {
  BulkConfirmFilterDto,
  ConfirmSiblingsBulkResult,
  FamilyStudent,
  SiblingLevel,
  SuggestionPair,
} from '@/providers/service/app.schemas';
import {
  familiesControllerConfirm,
  familiesControllerConfirmBulk,
  familiesControllerReject,
  useFamiliesControllerSuggestions,
} from '@/providers/service/families/families';

import { useAuthenticatedApi } from '@/hooks/useAuthenticatedApi';
import { useListingFilters } from '@/hooks/useListingFilters';

import { routes } from '@/router/routes';

import { extractNetworkError } from '@/utils/extractNetworkError';

import { useRefreshFamilies } from '../../api';
import { OutcomeText, ReasonsText, StrengthChip } from '../../components/chips';
import { ConfirmSiblingDialog, PairStudent } from '../../dialogs/SiblingDialogs';
import messages from '../../messages';
import { useFamiliesAccess } from '../../permissions';
import { ageOn, errorCode, pairKey } from '../../rules';

const EMPTY_SHOWS = { select: { displayEmpty: true }, inputLabel: { shrink: true } } as const;
const PAGE_SIZE = 25;

interface QueueFilters {
  sessionId?: string;
  branchId?: string;
  minLevel?: string;
  admittedOnly?: string;
}

const toPair = (s: FamilyStudent): PairStudent => ({
  id: s.id,
  name: s.name,
  grNumber: s.grNumber,
  fatherName: s.fatherName,
});

function Side({ s }: { s: FamilyStudent }) {
  const age = ageOn(s.dateOfBirth);
  const a = s.admission;
  return (
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <MuiLink
        component={Link}
        href={routes.students.profile(s.id)}
        underline="hover"
        color="inherit"
        sx={{ fontWeight: 600 }}
        onClick={(e) => e.stopPropagation()}
      >
        {s.name}
      </MuiLink>
      <Typography variant="caption" color="text.secondary" component="div">
        <span dir="ltr" style={{ fontFamily: 'monospace' }}>
          {s.grNumber}
        </span>
        {age !== undefined ? ` · ${age}` : ''}
        {a ? ` · ${a.branch.code} · ${a.classLevel.name}${a.section ? ` ${a.section.letter}` : ''}` : ''}
      </Typography>
      <Typography variant="caption" color="text.secondary" component="div">
        {s.fatherName}
      </Typography>
    </Box>
  );
}

/**
 * The review queue: unconfirmed pairs across all students, strongest first, for confirming 2026's households.
 * Keyboard: J and K move, C confirms, N marks not siblings, O opens the first student. "Confirm all strong"
 * confirms every strong pair under the filters (POST /admin/families/confirm-bulk), after a dry run shows the count.
 */
export function ReviewQueue() {
  const intl = useIntl();
  const router = useRouter();
  const notify = useNotify();
  const refresh = useRefreshFamilies();
  const access = useFamiliesAccess();
  const { isAuthenticated } = useAuthenticatedApi();
  const { filters, setFilter } = useListingFilters<QueueFilters>();
  const admittedOnly = filters.admittedOnly !== 'false';
  const page = filters.page ?? 0;

  const { data, isLoading, isError, error, isFetching } = useFamiliesControllerSuggestions(
    {
      sessionId: filters.sessionId || undefined,
      branchId: filters.branchId || undefined,
      minLevel: (filters.minLevel as SiblingLevel) || undefined,
      admittedOnly,
      skip: page * PAGE_SIZE,
      take: PAGE_SIZE,
    },
    { query: { enabled: isAuthenticated } },
  );
  const pairs = useMemo(() => data?.data ?? [], [data]);
  const count = data?.count ?? 0;

  const [focus, setFocus] = useState(0);
  const [busy, setBusy] = useState<Set<string>>(new Set());
  const [duplicate, setDuplicate] = useState<SuggestionPair | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [preview, setPreview] = useState<ConfirmSiblingsBulkResult | null>(null);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    setFocus((f) => Math.min(f, Math.max(pairs.length - 1, 0)));
  }, [pairs.length]);
  useEffect(() => {
    rowRefs.current[focus]?.scrollIntoView({ block: 'nearest' });
  }, [focus]);

  const mark = (key: string, on: boolean) =>
    setBusy((prev) => {
      const next = new Set(prev);
      if (on) next.add(key);
      else next.delete(key);
      return next;
    });

  const confirm = useCallback(
    async (p: SuggestionPair) => {
      const key = pairKey(p.studentA.id, p.studentB.id);
      mark(key, true);
      try {
        await familiesControllerConfirm({ studentId: p.studentA.id, otherStudentId: p.studentB.id });
        await refresh();
      } catch (err) {
        if (errorCode(err) === 'POSSIBLE_DUPLICATE') setDuplicate(p);
        else notify.error(err);
      } finally {
        mark(key, false);
      }
    },
    [refresh, notify],
  );

  const reject = useCallback(
    async (p: SuggestionPair) => {
      const key = pairKey(p.studentA.id, p.studentB.id);
      mark(key, true);
      try {
        await familiesControllerReject({ studentId: p.studentA.id, otherStudentId: p.studentB.id });
        await refresh();
      } catch (err) {
        notify.error(err);
      } finally {
        mark(key, false);
      }
    },
    [refresh, notify],
  );

  // Keys work when nothing else has focus (not while typing in a filter or a dialog is open)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('input, textarea, [role="dialog"], [role="listbox"]') || e.metaKey || e.ctrlKey || e.altKey)
        return;
      const p = pairs[focus];
      const key = e.key.toLowerCase();
      if (key === 'j' || e.key === 'ArrowDown') {
        e.preventDefault();
        setFocus((f) => Math.min(f + 1, pairs.length - 1));
      } else if (key === 'k' || e.key === 'ArrowUp') {
        e.preventDefault();
        setFocus((f) => Math.max(f - 1, 0));
      } else if (key === 'c' && p && access.canManage) {
        e.preventDefault();
        void confirm(p);
      } else if (key === 'n' && p && access.canManage) {
        e.preventDefault();
        void reject(p);
      } else if (key === 'o' && p) {
        e.preventDefault();
        router.push(routes.students.profile(p.studentA.id));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pairs, focus, confirm, reject, router, access.canManage]);

  // The strong pairs of the whole queue under these filters (not only this page), at most 500 a run
  const bulkFilter: BulkConfirmFilterDto = {
    minLevel: 'STRONG',
    branchId: filters.branchId || undefined,
    sessionId: filters.sessionId || undefined,
    admittedOnly,
    limit: 500,
  };
  const wouldConfirm = preview?.results.filter((x) => x.status === 'WOULD_CONFIRM').length ?? 0;
  const codes = (rows: { code: string; pairs: number }[]) =>
    rows
      .map((x) => {
        const msg = (messages as Record<string, { id: string; defaultMessage: string }>)[`bulk${x.code}`];
        return `${msg ? intl.formatMessage(msg) : x.code} ${x.pairs}`;
      })
      .join(', ');

  // A dry run first: the dialog shows how many would be confirmed, and what would be skipped
  const openBulk = async () => {
    setPreview(null);
    setBulkOpen(true);
    setBulkBusy(true);
    try {
      const res = await familiesControllerConfirmBulk({ filter: bulkFilter, dryRun: true });
      setPreview(res.data);
    } catch (err) {
      notify.error(err);
      setBulkOpen(false);
    } finally {
      setBulkBusy(false);
    }
  };

  const confirmAllStrong = async () => {
    setBulkBusy(true);
    try {
      const res = await familiesControllerConfirmBulk({ filter: bulkFilter });
      const d = res.data;
      await refresh();
      setBulkOpen(false);
      const summary = intl.formatMessage(messages.bulkSummary, {
        confirmed: d.confirmed,
        skipped: d.skipped,
        refused: d.refused,
        reasons: d.reasons.length ? ` (${codes(d.reasons)})` : '',
        remaining: d.remaining,
      });
      if (d.refused) notify.error(summary);
      else notify.success(summary);
    } catch (err) {
      notify.error(err);
    } finally {
      setBulkBusy(false);
    }
  };

  return (
    <Stack spacing={2}>
      <Typography variant="body2" color="text.secondary">
        {intl.formatMessage(messages.reviewHelp)}
      </Typography>
      <Box sx={cardStyle}>
        <Box
          sx={{
            display: 'grid',
            gap: 1.5,
            alignItems: 'center',
            gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' },
          }}
        >
          <SessionFilter minWidth={0} defaultToActive />
          <BranchFilter minWidth={0} />
          <TextField
            select
            size="small"
            label={intl.formatMessage(messages.reviewLevel)}
            value={filters.minLevel ?? ''}
            onChange={(e) => setFilter({ minLevel: e.target.value || undefined, page: 0 })}
            slotProps={EMPTY_SHOWS}
          >
            <MenuItem value="">{intl.formatMessage(messages.levelMEDIUM)}</MenuItem>
            <MenuItem value="STRONG">{intl.formatMessage(messages.levelSTRONG)}</MenuItem>
            <MenuItem value="WEAK">{intl.formatMessage(messages.levelWEAK)}</MenuItem>
          </TextField>
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={admittedOnly}
                onChange={(e) => setFilter({ admittedOnly: e.target.checked ? undefined : 'false', page: 0 })}
              />
            }
            label={<Typography variant="body2">{intl.formatMessage(messages.reviewAdmittedOnly)}</Typography>}
          />
        </Box>
      </Box>

      <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap" useFlexGap>
        <Typography variant="subtitle2" color="text.secondary" sx={{ flex: 1 }}>
          {intl.formatMessage(messages.reviewPairs, { count })}
          {isFetching && !isLoading ? ' …' : ''}
        </Typography>
        {access.canManage && filters.minLevel !== 'WEAK' && pairs.some((p) => p.level === 'STRONG') && (
          <Button variant="contained" color="primary" onClick={openBulk}>
            {intl.formatMessage(messages.confirmAllStrong)}
          </Button>
        )}
      </Stack>

      {isError && <Alert severity="error">{extractNetworkError(error)}</Alert>}
      {isLoading && <Skeleton variant="rounded" height={240} sx={{ borderRadius: 3 }} />}
      {!isLoading && !isError && !pairs.length && (
        <Alert severity="info">{intl.formatMessage(messages.reviewEmpty)}</Alert>
      )}

      <Stack spacing={1}>
        {pairs.map((p, i) => {
          const key = pairKey(p.studentA.id, p.studentB.id);
          const working = busy.has(key);
          const focused = i === focus;
          return (
            <Box
              key={key}
              ref={(el: HTMLDivElement | null) => {
                rowRefs.current[i] = el;
              }}
              onClick={() => setFocus(i)}
              sx={{
                ...cardStyle,
                p: 1.5,
                opacity: working ? 0.5 : 1,
                outline: focused ? '2px solid' : 'none',
                outlineColor: 'primary.main',
                cursor: 'default',
              }}
            >
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ md: 'center' }}>
                <Side s={p.studentA} />
                <Side s={p.studentB} />
                <Stack spacing={0.5} sx={{ flex: 1.3, minWidth: 0 }}>
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                    <StrengthChip level={p.level} />
                    <ReasonsText reasons={p.reasons} fatherScore={p.fatherScore} />
                  </Stack>
                  <OutcomeText outcome={p.outcome} />
                </Stack>
                {access.canManage && (
                  <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
                    <Button
                      size="small"
                      variant="contained"
                      disabled={working || !p.studentA.isActive || !p.studentB.isActive}
                      onClick={() => confirm(p)}
                      startIcon={working ? <CircularProgress size={14} color="inherit" /> : undefined}
                    >
                      {intl.formatMessage(messages.confirmSibling)}
                    </Button>
                    <Button size="small" disabled={working} onClick={() => reject(p)}>
                      {intl.formatMessage(messages.notSiblings)}
                    </Button>
                  </Stack>
                )}
              </Stack>
            </Box>
          );
        })}
      </Stack>

      {count > PAGE_SIZE && (
        <Pagination
          count={Math.ceil(count / PAGE_SIZE)}
          page={page + 1}
          onChange={(_, v) => {
            setFilter({ page: v - 1 });
            setFocus(0);
          }}
        />
      )}

      <Dialog open={bulkOpen} onClose={bulkBusy ? undefined : () => setBulkOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>
          {preview
            ? intl.formatMessage(messages.confirmAllStrongTitle, { count: wouldConfirm })
            : intl.formatMessage(messages.confirmAllStrong)}
        </DialogTitle>
        <DialogContent dividers>
          {!preview ? (
            <Stack direction="row" spacing={1.5} alignItems="center">
              <CircularProgress size={18} />
              <Typography variant="body2">{intl.formatMessage(messages.bulkCounting)}</Typography>
            </Stack>
          ) : (
            <Stack spacing={1.5}>
              <Typography variant="body2">{intl.formatMessage(messages.confirmAllStrongBody)}</Typography>
              {preview.skipped + preview.refused > 0 && (
                <Alert severity="info">
                  {intl.formatMessage(messages.bulkWillSkip, {
                    count: preview.skipped + preview.refused,
                    reasons: codes(preview.reasons),
                  })}
                </Alert>
              )}
              {preview.remaining > 0 && (
                <Alert severity="info">
                  {intl.formatMessage(messages.bulkRemaining, { count: preview.remaining })}
                </Alert>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Button onClick={() => setBulkOpen(false)} disabled={bulkBusy && !!preview}>
            {intl.formatMessage(messages.cancel)}
          </Button>
          <Button
            variant="contained"
            onClick={confirmAllStrong}
            disabled={bulkBusy || !preview || wouldConfirm === 0}
            startIcon={bulkBusy && preview ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {intl.formatMessage(messages.confirmAllStrongButton, { count: wouldConfirm })}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmSiblingDialog
        open={!!duplicate}
        a={duplicate ? toPair(duplicate.studentA) : null}
        b={duplicate ? toPair(duplicate.studentB) : null}
        pair={duplicate ?? undefined}
        canMerge={access.canMerge}
        duplicateFirst
        onClose={() => setDuplicate(null)}
      />
    </Stack>
  );
}
