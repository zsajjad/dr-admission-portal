import { Chip, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography } from '@mui/material';

import { StudentProfileMessage } from '@/providers/service/app.schemas';

import { FormattedMessage } from '@/theme/FormattedMessage';

import messages from '../messages';
import { formatDateTime, messageStatusColor, messageStatusMessage } from '../utils';

import { SectionCard } from './SectionCard';

export function MessageHistory({ items }: { items: StudentProfileMessage[] }) {
  return (
    <SectionCard title={<FormattedMessage {...messages.whatsapp} />}>
      {items.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          <FormattedMessage {...messages.noMessages} />
        </Typography>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                <FormattedMessage {...messages.messageTitle} />
              </TableCell>
              <TableCell>
                <FormattedMessage {...messages.sentTo} />
              </TableCell>
              <TableCell>
                <FormattedMessage {...messages.sentAt} />
              </TableCell>
              <TableCell>
                <FormattedMessage {...messages.status} />
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((m) => (
              <TableRow key={m.id}>
                <TableCell>
                  {m.announcementTitle}
                  <Typography variant="caption" color="text.secondary" component="div">
                    {m.templateName}
                  </Typography>
                </TableCell>
                <TableCell dir="ltr">{m.phone}</TableCell>
                <TableCell>{formatDateTime(m.sentAt || m.createdAt)}</TableCell>
                <TableCell>
                  <Tooltip title={m.errorMessage || (m.readAt ? formatDateTime(m.readAt) : '')}>
                    <Chip
                      size="small"
                      color={messageStatusColor(m.status)}
                      label={<FormattedMessage {...messageStatusMessage(m.status)} />}
                    />
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </SectionCard>
  );
}
