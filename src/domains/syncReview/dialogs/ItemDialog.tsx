'use client';

import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Stack,
  Typography,
} from '@mui/material';

import { Field } from '@/domains/students/components/Field';
import { formatDateTime } from '@/domains/students/utils';

import { StaffSyncReviewItem } from '@/providers/service/app.schemas';

import { FormattedMessage } from '@/theme/FormattedMessage';

import { useDescribeItem } from '../hooks/useDescribeItem';
import messages from '../messages';

/** Everything about one flagged item, including what the phone sent */
export function ItemDialog({ item, onClose }: { item: StaffSyncReviewItem | null; onClose: () => void }) {
  const describe = useDescribeItem();
  return (
    <Dialog open={!!item} onClose={onClose} fullWidth maxWidth="md">
      {item && (
        <>
          <DialogTitle sx={{ fontWeight: 600 }}>
            <Stack direction="row" spacing={1} alignItems="center">
              <span>
                <FormattedMessage {...messages.detailTitle} />
              </span>
              <Chip
                size="small"
                variant="outlined"
                label={<FormattedMessage {...messages[`reason${item.flagReason}`]} />}
              />
            </Stack>
          </DialogTitle>
          <DialogContent dividers>
            <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
              {describe(item)}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              <FormattedMessage {...messages[`reason${item.flagReason}Hint`]} />
            </Typography>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid size={{ xs: 6, md: 4 }}>
                <Field
                  label={<FormattedMessage {...messages.colWho} />}
                  value={`${item.staffUser.name} · ${item.staffUser.staffId}`}
                />
              </Grid>
              <Grid size={{ xs: 6, md: 4 }}>
                <Field
                  label={<FormattedMessage {...messages.colPhone} />}
                  value={item.device?.label}
                  caption={
                    item.device?.revokedAt ? (
                      <FormattedMessage
                        {...messages.phoneLoggedOut}
                        values={{ date: formatDateTime(item.device.revokedAt) }}
                      />
                    ) : undefined
                  }
                />
              </Grid>
              <Grid size={{ xs: 6, md: 4 }}>
                <Field label={<FormattedMessage {...messages.appVersion} />} value={item.appVersion} />
              </Grid>
              <Grid size={{ xs: 6, md: 4 }}>
                <Field label={<FormattedMessage {...messages.colMadeAt} />} value={formatDateTime(item.clientTime)} />
              </Grid>
              <Grid size={{ xs: 6, md: 4 }}>
                <Field label={<FormattedMessage {...messages.colReceived} />} value={formatDateTime(item.receivedAt)} />
              </Grid>
              <Grid size={{ xs: 6, md: 4 }}>
                <Field label={<FormattedMessage {...messages.itemId} />} value={item.id} dir="ltr" />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Field label={<FormattedMessage {...messages.noteToPhone} />} value={item.reason} />
              </Grid>
              {item.reviewedAt && (
                <Grid size={{ xs: 12 }}>
                  <Field
                    label={<FormattedMessage {...messages.colReviewed} />}
                    value={
                      <FormattedMessage
                        {...messages.reviewedBy}
                        values={{ name: item.reviewedBy?.name ?? '?', date: formatDateTime(item.reviewedAt) }}
                      />
                    }
                    caption={item.reviewNote}
                  />
                </Grid>
              )}
            </Grid>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
              <FormattedMessage {...messages.payload} />
            </Typography>
            <Box
              component="pre"
              dir="ltr"
              sx={{
                m: 0,
                p: 1.5,
                borderRadius: 2,
                bgcolor: 'grey.100',
                fontSize: 13,
                overflowX: 'auto',
                maxHeight: 280,
              }}
            >
              {JSON.stringify(item.payload, null, 2)}
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 1.5 }}>
            <Button onClick={onClose}>
              <FormattedMessage {...messages.close} />
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}
