'use client';

import { useState } from 'react';

import Link from 'next/link';

import { Add as AddIcon } from '@mui/icons-material';
import {
  Alert,
  Button,
  Card,
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

import { FormattedMessage } from '@/theme/FormattedMessage';

import { routes } from '@/router/routes';

import { extractNetworkError } from '@/utils/extractNetworkError';

import { TrainingCourse, useActivateCourse, useCourses, useDeactivateCourse } from '../../api/setup';
import { ActionDialog } from '../../components/ActionDialog';
import { useNotify } from '../../components/useNotify';
import common from '../../messages';
import { useTrainingsAccess } from '../../permissions';
import { sortBands } from '../../rules';
import { cardStyle, formatAmount, formatPct } from '../../utils';

import messages from './messages';

/** Every course with its main rules; admins with trainings.configure can add, edit and (de)activate */
export function CourseList() {
  const { canConfigure } = useTrainingsAccess();
  const { data, isLoading, error } = useCourses();
  const activate = useActivateCourse();
  const deactivate = useDeactivateCourse();
  const notify = useNotify();
  const [confirm, setConfirm] = useState<TrainingCourse | null>(null);

  const courses = data?.data ?? [];

  const handleActivate = (course: TrainingCourse) =>
    activate.mutate({ id: course.id }, { onSuccess: () => notify.success(), onError: notify.error });

  const handleDeactivate = () => {
    if (!confirm) return;
    deactivate.mutate(
      { id: confirm.id },
      {
        onSuccess: () => {
          notify.success();
          setConfirm(null);
        },
        onError: notify.error,
      },
    );
  };

  return (
    <Stack spacing={2}>
      {canConfigure && (
        <Stack direction="row" justifyContent="flex-end">
          <Button variant="contained" startIcon={<AddIcon />} component={Link} href={routes.trainings.courseCreate}>
            <FormattedMessage {...messages.newCourse} />
          </Button>
        </Stack>
      )}

      {!!error && (
        <Alert severity="error">
          <FormattedMessage {...common.loadError} />: {extractNetworkError(error)}
        </Alert>
      )}

      <Card sx={{ ...cardStyle, overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 900 }}>
          <TableHead>
            <TableRow>
              <TableCell>
                <FormattedMessage {...messages.code} />
              </TableCell>
              <TableCell>
                <FormattedMessage {...messages.name} />
              </TableCell>
              <TableCell>
                <FormattedMessage {...messages.trainings} />
              </TableCell>
              <TableCell>
                <FormattedMessage {...messages.retrainThresholdPct} />
              </TableCell>
              <TableCell align="right">
                <FormattedMessage {...messages.attempts} />
              </TableCell>
              <TableCell align="right">
                <FormattedMessage {...messages.autoClose} />
              </TableCell>
              <TableCell>
                <FormattedMessage {...messages.payoutRange} />
              </TableCell>
              <TableCell>
                <FormattedMessage {...messages.status} />
              </TableCell>
              <TableCell align="right" />
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading &&
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={9}>
                    <Skeleton height={28} />
                  </TableCell>
                </TableRow>
              ))}
            {!isLoading && courses.length === 0 && (
              <TableRow>
                <TableCell colSpan={9}>
                  <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                    <FormattedMessage {...messages.noCourses} />
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {courses.map((course) => {
              const active = course.trainings.filter((t) => t.isActive);
              const top = sortBands(course.bands)[0];
              const busy =
                (activate.isPending && activate.variables?.id === course.id) ||
                (deactivate.isPending && deactivate.variables?.id === course.id);
              return (
                <TableRow key={course.id} hover sx={{ opacity: course.isActive ? 1 : 0.6 }}>
                  <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{course.code}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {course.name}
                    </Typography>
                    {course.nameUr && (
                      <Typography variant="caption" color="text.secondary" className="font-urdu" dir="rtl">
                        {course.nameUr}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      <FormattedMessage {...messages.trainingsCount} values={{ count: String(active.length) }} />
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {active.map((t) => `${t.code} ${formatPct(t.weightPct)}`).join(' · ')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <FormattedMessage
                      {...messages.passRule}
                      values={{ pct: String(Number(course.retrainThresholdPct)) }}
                    />
                  </TableCell>
                  <TableCell align="right">{course.maxAttempts}</TableCell>
                  <TableCell align="right">
                    <FormattedMessage {...messages.days} values={{ days: String(course.autoCloseDays) }} />
                  </TableCell>
                  <TableCell>
                    {formatAmount(course.payoutFloor)} – {formatAmount(top?.amount)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      color={course.isActive ? 'success' : 'default'}
                      label={<FormattedMessage {...(course.isActive ? common.active : common.inactive)} />}
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    <Button size="small" component={Link} href={routes.trainings.course(course.id)}>
                      <FormattedMessage {...(canConfigure ? common.edit : messages.open)} />
                    </Button>
                    {canConfigure &&
                      (course.isActive ? (
                        <Button size="small" color="error" disabled={busy} onClick={() => setConfirm(course)}>
                          <FormattedMessage {...common.deactivate} />
                        </Button>
                      ) : (
                        <Button size="small" color="success" disabled={busy} onClick={() => handleActivate(course)}>
                          <FormattedMessage {...common.activate} />
                        </Button>
                      ))}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      <ActionDialog
        open={!!confirm}
        title={<FormattedMessage {...common.deactivate} />}
        onClose={() => setConfirm(null)}
        onSubmit={handleDeactivate}
        isSubmitting={deactivate.isPending}
        submitLabel={<FormattedMessage {...common.deactivate} />}
        submitColor="error"
        maxWidth="xs"
      >
        <Typography>
          <FormattedMessage {...messages.deactivateConfirm} values={{ name: confirm?.name ?? '' }} />
        </Typography>
      </ActionDialog>
    </Stack>
  );
}
