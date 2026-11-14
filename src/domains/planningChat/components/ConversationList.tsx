'use client';

import * as React from 'react';

import AddIcon from '@mui/icons-material/Add';
import {
  Box,
  Button,
  FormControlLabel,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Skeleton,
  Switch,
  Typography,
} from '@mui/material';

import { ReportChatConversationScope, type ReportChatConversation } from '@/providers/service/app.schemas';
import { useReportChatControllerListConversations } from '@/providers/service/reports-chat/reports-chat';

import { FormattedMessage } from '@/theme/FormattedMessage';

import messages from '../messages';

interface Props {
  selectedId?: string;
  onSelect: (id: string) => void;
  onNew: () => void;
  canSeeEveryone: boolean;
}

export function ConversationList({ selectedId, onSelect, onNew, canSeeEveryone }: Props) {
  const [everyone, setEveryone] = React.useState(false);
  const { data, isLoading } = useReportChatControllerListConversations({
    take: 100,
    scope: everyone ? ReportChatConversationScope.all : ReportChatConversationScope.mine,
  });
  const conversations: ReportChatConversation[] = data?.data ?? [];

  return (
    <Paper variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Box sx={{ p: 1.5, borderBottom: 1, borderColor: 'divider' }}>
        <Button fullWidth variant="contained" startIcon={<AddIcon />} onClick={onNew}>
          <FormattedMessage {...messages.newConversation} />
        </Button>
        {canSeeEveryone ? (
          <FormControlLabel
            sx={{ mt: 1, ml: 0 }}
            control={<Switch size="small" checked={everyone} onChange={(e) => setEveryone(e.target.checked)} />}
            label={
              <Typography variant="body2">
                <FormattedMessage {...messages.everyone} />
              </Typography>
            }
          />
        ) : null}
      </Box>
      <Box sx={{ flex: 1, overflowY: 'auto' }}>
        {isLoading ? (
          <Box sx={{ p: 1.5 }}>
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} height={48} />
            ))}
          </Box>
        ) : conversations.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
            <FormattedMessage {...messages.noConversations} />
          </Typography>
        ) : (
          <List dense disablePadding>
            {conversations.map((c) => (
              <ListItemButton key={c.id} selected={c.id === selectedId} onClick={() => onSelect(c.id)}>
                <ListItemText
                  primary={c.title}
                  primaryTypographyProps={{ noWrap: true, dir: 'auto' }}
                  secondary={
                    <>
                      {everyone && c.adminUserName ? `${c.adminUserName} · ` : ''}
                      {new Date(c.updatedAt).toLocaleDateString()} ·{' '}
                      <FormattedMessage {...messages.questionsCount} values={{ count: String(c.questions) }} />
                    </>
                  }
                />
              </ListItemButton>
            ))}
          </List>
        )}
      </Box>
    </Paper>
  );
}
