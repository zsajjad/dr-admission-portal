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

import { CatalogTraining, useActivateCatalogTraining, useCatalog, useDeactivateCatalogTraining } from '../../api/setup';
import { ActionDialog } from '../../components/ActionDialog';
import { useNotify } from '../../components/useNotify';
import common from '../../messages';
import { useTrainingsAccess } from '../../permissions';
import { sortBands } from '../../rules';
import { cardStyle, formatAmount } from '../../utils';

import messages from './messages';
import { SettingsForm } from './SettingsForm';

/** The training catalog, by required age, and the settings every training shares */
export function CatalogList() {
  const { canConfigure } = useTrainingsAccess();
  const { data, isLoading, error } = useCatalog();
  const activate = useActivateCatalogTraining();
  const deactivate = useDeactivateCatalogTraining();
  const notify = useNotify();
  const [confirm, setConfirm] = useState<CatalogTraining | null>(null);

  const trainings = [...(data?.data ?? [])].sort(
    (a, b) => a.requiredFromAge - b.requiredFromAge || a.sortOrder - b.sortOrder,
  );

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
      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
        <Typography variant="body2" color="text.secondary">
          <FormattedMessage {...messages.help} />
        </Typography>
        {canConfigure && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            component={Link}
            href={routes.trainings.catalogCreate}
            sx={{ flexShrink: 0 }}
          >
            <FormattedMessage {...messages.newTraining} />
          </Button>
        )}
      </Stack>

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
                <FormattedMessage {...messages.requiredFromAge} />
              </TableCell>
              <TableCell>
                <FormattedMessage {...messages.gender} />
              </TableCell>
              <TableCell align="right">
                <FormattedMessage {...messages.marks} />
              </TableCell>
              <TableCell>
                <FormattedMessage {...messages.payout} />
              </TableCell>
              <TableCell>
                <FormattedMessage {...messages.stepSkill} />
              </TableCell>
              <TableCell>
                <FormattedMessage {...messages.status} />
              </TableCell>
              <TableCell />
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
            {!isLoading && trainings.length === 0 && (
              <TableRow>
                <TableCell colSpan={9}>
                  <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                    <FormattedMessage {...messages.noTrainings} />
                  </Typography>
                </TableCell>
              </TableRow>
            )}
            {trainings.map((t) => {
              const busy =
                (activate.isPending && activate.variables?.id === t.id) ||
                (deactivate.isPending && deactivate.variables?.id === t.id);
              return (
                <TableRow key={t.id} hover sx={{ opacity: t.isActive ? 1 : 0.6 }}>
                  <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{t.code}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {t.name}
                    </Typography>
                    {t.nameUr && (
                      <Typography variant="caption" color="text.secondary" className="font-urdu" dir="rtl">
                        {t.nameUr}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <FormattedMessage {...messages.fromAge} values={{ age: String(t.requiredFromAge) }} />
                  </TableCell>
                  <TableCell>
                    <FormattedMessage
                      {...(t.gender === 'MALE' ? common.boys : t.gender === 'FEMALE' ? common.girls : common.both)}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {t.passMarks} / {t.maxMarks}
                  </TableCell>
                  <TableCell>
                    {formatAmount(t.payoutFloor)} – {formatAmount(sortBands(t.bands)[0]?.amount)}
                  </TableCell>
                  <TableCell>{t.stepSkill ? <FormattedMessage {...messages[`step_${t.stepSkill}`]} /> : ''}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      color={t.isActive ? 'success' : 'default'}
                      label={<FormattedMessage {...(t.isActive ? common.active : common.inactive)} />}
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                    <Button size="small" component={Link} href={routes.trainings.catalogTraining(t.id)}>
                      <FormattedMessage {...(canConfigure ? common.edit : messages.open)} />
                    </Button>
                    {canConfigure &&
                      (t.isActive ? (
                        <Button size="small" color="error" disabled={busy} onClick={() => setConfirm(t)}>
                          <FormattedMessage {...common.deactivate} />
                        </Button>
                      ) : (
                        <Button
                          size="small"
                          color="success"
                          disabled={busy}
                          onClick={() =>
                            activate.mutate({ id: t.id }, { onSuccess: () => notify.success(), onError: notify.error })
                          }
                        >
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

      <SettingsForm />

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
