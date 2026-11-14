import { Alert, Stack, Typography } from '@mui/material';

import { cardStyle } from '@/domains/students/utils';

import { FormattedMessage } from '@/theme/FormattedMessage';

import messages from '../messages';
import { fmt } from '../utils';

interface RuleCardProps {
  passMark: number | null;
  trainingsConnected: boolean;
}

/** The session result rule, in plain words, with this class's pass mark. */
export function RuleCard({ passMark, trainingsConnected }: RuleCardProps) {
  return (
    <Stack spacing={1} sx={{ ...cardStyle, bgcolor: 'background.paper', px: 2, py: 1.5, mb: 2 }}>
      <Typography variant="subtitle2">
        <FormattedMessage {...messages.ruleTitle} />
      </Typography>
      <Typography variant="body2">
        <FormattedMessage {...messages.rulePass} />
      </Typography>
      <Typography variant="body2">
        <FormattedMessage {...messages.rulePosition} />
      </Typography>
      {passMark !== null ? (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          <FormattedMessage {...messages.passMark} values={{ marks: fmt(passMark) }} />
        </Typography>
      ) : (
        <Alert severity="warning" sx={{ py: 0 }}>
          <FormattedMessage {...messages.passMarkNotSet} />
        </Alert>
      )}
      {!trainingsConnected && (
        <Alert severity="info" sx={{ py: 0 }}>
          <FormattedMessage {...messages.trainingsNotYet} />
        </Alert>
      )}
    </Stack>
  );
}
