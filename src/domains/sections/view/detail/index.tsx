'use client';

import { useMemo, useState } from 'react';

import { useIntl } from 'react-intl';

import Link from 'next/link';

import {
  Edit as EditIcon,
  Groups as TeachersIcon,
  Lock as CloseIcon,
  LockOpen as ReopenIcon,
  MoveDown as MoveIcon,
  PersonAdd as PlaceIcon,
  PersonRemove as TakeOutIcon,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  FormControlLabel,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import { GridColDef, GridPaginationModel, GridRowSelectionModel } from '@mui/x-data-grid';

import { Field } from '@/domains/students/components/Field';
import { SectionCard } from '@/domains/students/components/SectionCard';
import { ConfirmDialog } from '@/domains/students/dialogs/ConfirmDialog';
import { admissionStatusColor, admissionStatusMessage, cardStyle } from '@/domains/students/utils';

import { DataNotFound } from '@/components/DataNotFound';
import { DataTable } from '@/components/DataTable';
import { DetailSkeleton } from '@/components/Skeleton/DetailSkeleton';

import { Section, SectionAdmission } from '@/providers/service/app.schemas';
import { useBranchControllerFindAll } from '@/providers/service/branch/branch';
import {
  useSectionControllerActivate,
  useSectionControllerAssign,
  useSectionControllerDeactivate,
  useSectionControllerFindOne,
  useSectionControllerListAdmissions,
  useSectionControllerListUnassigned,
  useSectionControllerUnassign,
} from '@/providers/service/section/section';
import { useSessionControllerFindAll } from '@/providers/service/session/session';

import { FormattedMessage, useFormattedMessage } from '@/theme/FormattedMessage';

import { routes } from '@/router/routes';

import { extractNetworkError } from '@/utils/extractNetworkError';

import { MoveDialog } from '../../dialogs/MoveDialog';
import { SectionDialog } from '../../dialogs/SectionDialog';
import { TeachersDialog } from '../../dialogs/TeachersDialog';
import { useSectionActions } from '../../hooks/useSectionActions';
import { useClassLevels } from '../../hooks/useSectionData';
import messages from '../../messages';

const emptySelection = (): GridRowSelectionModel => ({ type: 'include', ids: new Set() });

/** One section: its teachers, its students (move or take out), and the unplaced students of its class */
export function SectionDetailView({ id }: { id: string }) {
  const notFound = useFormattedMessage(messages.notFound);
  const { data, isLoading, error } = useSectionControllerFindOne(id, { query: { enabled: !!id } });
  const section = data?.data;

  if (isLoading) return <DetailSkeleton />;
  if (!section) {
    // @ts-expect-error error shape comes from the API
    if (!error || error?.statusCode === 404) return <DataNotFound notFoundMessage={notFound} />;
    return (
      <Alert severity="error" sx={{ borderRadius: 3 }}>
        <FormattedMessage {...messages.loadError} />: {extractNetworkError(error)}
      </Alert>
    );
  }
  return <SectionDetail section={section} />;
}

function SectionDetail({ section }: { section: Section }) {
  const [dialog, setDialog] = useState<'edit' | 'teachers' | 'close' | null>(null);
  const close = () => setDialog(null);
  const { byId } = useClassLevels();
  const { data: sessions } = useSessionControllerFindAll({ take: 100 });
  const { data: branches } = useBranchControllerFindAll({ take: 100 });
  const deactivate = useSectionControllerDeactivate();
  const activate = useSectionControllerActivate();
  const { onSuccess, onError } = useSectionActions();

  const level = byId.get(section.classLevelId);
  const sessionName = sessions?.data.find((s) => s.id === section.sessionId)?.name ?? section.sessionId;
  const branchName = branches?.data.find((b) => b.id === section.branchId)?.name ?? section.branchCode;

  const handleActive = () => {
    const mutation = section.isActive ? deactivate : activate;
    mutation.mutate(
      { id: section.id },
      {
        onSuccess: async () => {
          await onSuccess();
          close();
        },
        onError,
      },
    );
  };

  return (
    <Stack spacing={2.5}>
      {!section.isActive && (
        <Alert severity="warning" sx={{ borderRadius: 3 }}>
          <FormattedMessage {...messages.closedBanner} />
        </Alert>
      )}

      <Card sx={cardStyle}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems={{ md: 'flex-start' }}>
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: 2,
                bgcolor: 'primary.main',
                color: 'common.white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 36,
                flexShrink: 0,
              }}
            >
              {section.letter}
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {section.displayName}
                </Typography>
                {!section.isActive && <Chip size="small" label={<FormattedMessage {...messages.inactive} />} />}
              </Stack>
              <Grid container spacing={2} sx={{ mt: 1.5 }}>
                <Grid size={{ xs: 6, md: 3 }}>
                  <Field
                    label={<FormattedMessage {...messages.classLevel} />}
                    value={level?.name ?? section.classLevelCode}
                  />
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <Field label={<FormattedMessage {...messages.branch} />} value={branchName} />
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <Field label={<FormattedMessage {...messages.session} />} value={sessionName} />
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <Field label={<FormattedMessage {...messages.studentCount} />} value={String(section.studentCount)} />
                </Grid>
              </Grid>
            </Box>
            <Stack spacing={1} sx={{ flexShrink: 0, minWidth: 200 }}>
              <Button
                variant="contained"
                size="small"
                startIcon={<TeachersIcon />}
                onClick={() => setDialog('teachers')}
              >
                <FormattedMessage {...messages.editTeachers} />
              </Button>
              <Button variant="outlined" size="small" startIcon={<EditIcon />} onClick={() => setDialog('edit')}>
                <FormattedMessage {...messages.edit} />
              </Button>
              <Button
                variant="outlined"
                size="small"
                color={section.isActive ? 'warning' : 'primary'}
                startIcon={section.isActive ? <CloseIcon /> : <ReopenIcon />}
                onClick={() => setDialog('close')}
              >
                <FormattedMessage {...(section.isActive ? messages.close : messages.reopen)} />
              </Button>
              <Button
                size="small"
                component={Link}
                href={`${routes.sections.listing}?sessionId=${section.sessionId}&branchId=${section.branchId}`}
              >
                <FormattedMessage {...messages.overviewTitle} />
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <SectionCard title={<FormattedMessage {...messages.teachers} />}>
        {section.teachers.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            <FormattedMessage {...messages.noTeacher} />
          </Typography>
        ) : (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {section.teachers.map((t) => (
              <Chip
                key={t.staffUserId}
                variant={t.role === 'CLASS_TEACHER' ? 'filled' : 'outlined'}
                color={t.isActive ? 'primary' : 'default'}
                label={
                  <>
                    {t.name} · {t.staffId} · <FormattedMessage {...messages[`role${t.role}`]} />
                  </>
                }
              />
            ))}
          </Stack>
        )}
      </SectionCard>

      <PlacedStudents section={section} />
      {section.isActive && <UnplacedStudents section={section} levelName={level?.name ?? section.classLevelCode} />}

      <SectionDialog
        open={dialog === 'edit'}
        sessionId={section.sessionId}
        branchId={section.branchId}
        section={section}
        onClose={close}
      />
      <TeachersDialog open={dialog === 'teachers'} section={section} onClose={close} />
      <ConfirmDialog
        open={dialog === 'close'}
        title={<FormattedMessage {...(section.isActive ? messages.close : messages.reopen)} />}
        message={
          section.isActive && section.studentCount > 0 ? (
            <FormattedMessage {...messages.closeNeedsEmpty} />
          ) : (
            <FormattedMessage
              {...(section.isActive ? messages.closeConfirm : messages.reopenConfirm)}
              values={{ name: section.displayName }}
            />
          )
        }
        confirmLabel={<FormattedMessage {...messages.confirm} />}
        confirmColor={section.isActive ? 'warning' : 'primary'}
        isSubmitting={deactivate.isPending || activate.isPending}
        onConfirm={section.isActive && section.studentCount > 0 ? close : handleActive}
        onClose={close}
      />
    </Stack>
  );
}

function useStudentColumns(): GridColDef<SectionAdmission>[] {
  const text = {
    grNumber: useFormattedMessage(messages.grNumber),
    name: useFormattedMessage(messages.name),
    fatherName: useFormattedMessage(messages.fatherName),
    status: useFormattedMessage(messages.status),
    fee: useFormattedMessage(messages.fee),
  };
  return useMemo(
    () => [
      {
        field: 'grNumber',
        headerName: text.grNumber,
        width: 190,
        sortable: false,
        renderCell: ({ row }) => (
          <Link href={routes.students.profile(row.studentId)} onClick={(e) => e.stopPropagation()}>
            {row.grNumber}
          </Link>
        ),
      },
      { field: 'name', headerName: text.name, flex: 1, minWidth: 150, sortable: false },
      { field: 'fatherName', headerName: text.fatherName, flex: 1, minWidth: 150, sortable: false },
      {
        field: 'status',
        headerName: text.status,
        width: 140,
        sortable: false,
        renderCell: ({ row }) => (
          <Chip
            size="small"
            color={admissionStatusColor(row.status)}
            label={<FormattedMessage {...admissionStatusMessage(row.status)} />}
          />
        ),
      },
      {
        field: 'isFeePaid',
        headerName: text.fee,
        width: 100,
        sortable: false,
        renderCell: ({ row }) => <FormattedMessage {...(row.isFeePaid ? messages.feePaid : messages.feeUnpaid)} />,
      },
    ],
    [text.grNumber, text.name, text.fatherName, text.status, text.fee],
  );
}

function PlacedStudents({ section }: { section: Section }) {
  const [pagination, setPagination] = useState<GridPaginationModel>({ page: 0, pageSize: 50 });
  const [selection, setSelection] = useState<GridRowSelectionModel>(emptySelection);
  const [dialog, setDialog] = useState<'move' | 'takeOut' | null>(null);
  const columns = useStudentColumns();
  const noRows = useFormattedMessage(messages.noPlaced);
  const unassign = useSectionControllerUnassign();
  const { onSuccess, onError } = useSectionActions();
  const intl = useIntl();

  const { data, isLoading } = useSectionControllerListAdmissions(section.id, {
    skip: pagination.page * pagination.pageSize,
    take: pagination.pageSize,
  });
  const selected = [...selection.ids].map(String);

  const handleTakeOut = () =>
    unassign.mutate(
      { data: { admissionIds: selected } },
      {
        onSuccess: async (res) => {
          await onSuccess(intl.formatMessage(messages.takenOut, { count: res.unassigned }));
          setSelection(emptySelection());
          setDialog(null);
        },
        onError,
      },
    );

  return (
    <SectionCard
      title={<FormattedMessage {...messages.placedStudents} />}
      summary={<Chip size="small" label={String(data?.count ?? section.studentCount)} />}
      actions={
        selected.length > 0 && (
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" color="text.secondary">
              <FormattedMessage {...messages.selected} values={{ count: String(selected.length) }} />
            </Typography>
            <Button size="small" variant="outlined" startIcon={<MoveIcon />} onClick={() => setDialog('move')}>
              <FormattedMessage {...messages.moveTo} />
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="warning"
              startIcon={<TakeOutIcon />}
              onClick={() => setDialog('takeOut')}
            >
              <FormattedMessage {...messages.takeOut} />
            </Button>
          </Stack>
        )
      }
    >
      <DataTable<SectionAdmission>
        columns={columns}
        rows={data?.data || []}
        getRowId={(row) => row.admissionId}
        isLoading={isLoading}
        rowCount={data?.count ?? 0}
        paginationMode="server"
        paginationModel={pagination}
        onPaginationModelChange={setPagination}
        pageSizeOptions={[50, 100]}
        checkboxSelection
        keepNonExistentRowsSelected
        rowSelectionModel={selection}
        onRowSelectionModelChange={setSelection}
        noDataFound={noRows}
        disableColumnFilter
        showPointer={false}
      />
      <MoveDialog
        open={dialog === 'move'}
        section={section}
        admissionIds={selected}
        onClose={() => setDialog(null)}
        onDone={() => setSelection(emptySelection())}
      />
      <ConfirmDialog
        open={dialog === 'takeOut'}
        title={<FormattedMessage {...messages.takeOut} />}
        message={
          <FormattedMessage
            {...messages.takeOutConfirm}
            values={{ count: String(selected.length), name: section.displayName }}
          />
        }
        confirmLabel={<FormattedMessage {...messages.takeOut} />}
        confirmColor="warning"
        isSubmitting={unassign.isPending}
        onConfirm={handleTakeOut}
        onClose={() => setDialog(null)}
      />
    </SectionCard>
  );
}

function UnplacedStudents({ section, levelName }: { section: Section; levelName: string }) {
  const [pagination, setPagination] = useState<GridPaginationModel>({ page: 0, pageSize: 50 });
  const [selection, setSelection] = useState<GridRowSelectionModel>(emptySelection);
  const [onlyFeePaid, setOnlyFeePaid] = useState(false);
  const columns = useStudentColumns();
  const noRows = useFormattedMessage(messages.noUnplaced);
  const assign = useSectionControllerAssign();
  const { onSuccess, onError } = useSectionActions();
  const intl = useIntl();

  const { data, isLoading } = useSectionControllerListUnassigned({
    sessionId: section.sessionId,
    branchId: section.branchId,
    classLevelId: section.classLevelId,
    onlyFeePaid,
    skip: pagination.page * pagination.pageSize,
    take: pagination.pageSize,
  });
  const selected = [...selection.ids].map(String);

  const handlePlace = () =>
    assign.mutate(
      { id: section.id, data: { admissionIds: selected } },
      {
        onSuccess: async (res) => {
          await onSuccess(intl.formatMessage(messages.placed, { assigned: res.assigned, moved: res.moved }));
          setSelection(emptySelection());
        },
        onError,
      },
    );

  return (
    <SectionCard
      title={<FormattedMessage {...messages.unplacedStudents} values={{ classLevel: levelName }} />}
      summary={<Chip size="small" color={data?.count ? 'warning' : 'default'} label={String(data?.count ?? 0)} />}
      actions={
        <Stack direction="row" spacing={1} alignItems="center">
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={onlyFeePaid}
                onChange={(e) => {
                  setOnlyFeePaid(e.target.checked);
                  setPagination((p) => ({ ...p, page: 0 }));
                }}
              />
            }
            label={<FormattedMessage {...messages.onlyFeePaid} />}
          />
          <Button
            size="small"
            variant="contained"
            startIcon={<PlaceIcon />}
            disabled={!selected.length || assign.isPending}
            onClick={handlePlace}
          >
            <FormattedMessage {...messages.placeHere} />
            {selected.length > 0 && ` (${selected.length})`}
          </Button>
        </Stack>
      }
    >
      <DataTable<SectionAdmission>
        columns={columns}
        rows={data?.data || []}
        getRowId={(row) => row.admissionId}
        isLoading={isLoading}
        rowCount={data?.count ?? 0}
        paginationMode="server"
        paginationModel={pagination}
        onPaginationModelChange={setPagination}
        pageSizeOptions={[50, 100]}
        checkboxSelection
        keepNonExistentRowsSelected
        rowSelectionModel={selection}
        onRowSelectionModelChange={setSelection}
        noDataFound={noRows}
        disableColumnFilter
        showPointer={false}
      />
    </SectionCard>
  );
}
