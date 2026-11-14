import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Chip, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography } from '@mui/material';

import { StudentProfileCardPrint } from '@/providers/service/app.schemas';

import { FormattedMessage, useFormattedMessage } from '@/theme/FormattedMessage';

import messages from '../messages';
import { cardStatusColor, cardStatusMessage, formatDateTime } from '../utils';

import { SectionCard } from './SectionCard';

export function CardPrintHistory({ cardPrints }: { cardPrints: StudentProfileCardPrint[] }) {
  const note = useFormattedMessage(messages.cardPrintsNote);
  return (
    <SectionCard
      title={<FormattedMessage {...messages.cardPrints} />}
      summary={
        <Tooltip title={note}>
          <InfoOutlinedIcon fontSize="small" color="action" />
        </Tooltip>
      }
    >
      {cardPrints.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          <FormattedMessage {...messages.noCardPrints} />
        </Typography>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                <FormattedMessage {...messages.status} />
              </TableCell>
              <TableCell>
                <FormattedMessage {...messages.requested} />
              </TableCell>
              <TableCell>
                <FormattedMessage {...messages.printed} />
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cardPrints.map((c) => (
              <TableRow key={c.id}>
                <TableCell>
                  <Chip
                    size="small"
                    color={cardStatusColor(c.status)}
                    label={<FormattedMessage {...cardStatusMessage(c.status)} />}
                  />
                </TableCell>
                <TableCell>
                  {formatDateTime(c.requestedAt)}
                  {c.requestedBy && (
                    <Typography variant="caption" color="text.secondary" component="div">
                      {c.requestedBy.name}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {formatDateTime(c.completedAt)}
                  {c.completedBy && (
                    <Typography variant="caption" color="text.secondary" component="div">
                      {c.completedBy.name}
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </SectionCard>
  );
}
