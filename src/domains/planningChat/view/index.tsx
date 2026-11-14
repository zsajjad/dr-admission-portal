'use client';

import * as React from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { useRouter, useSearchParams } from 'next/navigation';

import KeyIcon from '@mui/icons-material/VpnKeyOutlined';
import { Alert, Box, Button, Chip, Paper, Skeleton, Stack, Typography } from '@mui/material';

import { Permission, RoleName } from '@/providers/service/app.schemas';
import {
  getReportChatControllerGetConversationQueryKey,
  getReportChatControllerListConversationsQueryKey,
  getReportChatControllerUsageQueryKey,
  useReportChatControllerGetConversation,
  useReportChatControllerUsage,
} from '@/providers/service/reports-chat/reports-chat';

import { FormattedMessage } from '@/theme/FormattedMessage';

import { usePermissions } from '@/hooks/usePermissions';

import { routes } from '@/router/routes';

import { ChatTurn } from '../components/ChatTurn';
import { Composer } from '../components/Composer';
import { ConversationList } from '../components/ConversationList';
import { ServiceTokensDialog } from '../components/ServiceTokensDialog';
import { ChatError, useChatStream } from '../hooks/useChatStream';
import messages from '../messages';

const EXAMPLES = [messages.example1, messages.example2, messages.example3, messages.example4];

export function PlanningChat(): React.JSX.Element {
  const { has, role, isLoading: permissionsLoading } = usePermissions();
  const canChat = has(Permission.reportschat);
  const isSuperAdmin = role === RoleName.SUPER_ADMIN;
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversationId = searchParams.get('c') ?? undefined;
  const queryClient = useQueryClient();
  const [tokensOpen, setTokensOpen] = React.useState(false);
  const [requestError, setRequestError] = React.useState<string | null>(null);
  const threadRef = React.useRef<HTMLDivElement>(null);

  const usage = useReportChatControllerUsage({ query: { enabled: canChat, refetchOnWindowFocus: true } });
  const detail = useReportChatControllerGetConversation(conversationId ?? '', {
    query: { enabled: canChat && !!conversationId },
  });
  const { state, ask, stop, reset } = useChatStream();

  const usageData = usage.data?.data;
  const conversation = conversationId ? detail.data?.data : undefined;
  const turns = (conversation?.turns ?? []).filter((t) => !(state.question && t.status === 'pending'));

  // Keep the newest answer in view by scrolling the thread itself (scrollIntoView would also scroll
  // the page and push the heading away).
  React.useEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [turns.length, state.text, state.lookups.length, state.question]);

  const select = (id?: string) => {
    if (state.streaming) return;
    reset();
    setRequestError(null);
    router.replace(id ? routes.planningChat.conversation(id) : routes.planningChat.listing);
  };

  const refresh = async (id: string) => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: getReportChatControllerGetConversationQueryKey(id) }),
      queryClient.invalidateQueries({ queryKey: getReportChatControllerListConversationsQueryKey().slice(0, 1) }),
      queryClient.invalidateQueries({ queryKey: getReportChatControllerUsageQueryKey() }),
    ]);
    reset();
  };

  const send = async (question: string) => {
    setRequestError(null);
    try {
      await ask({
        question,
        conversationId,
        onConversation: (id) => {
          if (id !== conversationId) router.replace(routes.planningChat.conversation(id));
        },
        onDone: (id) => void refresh(id),
      });
    } catch (e) {
      reset();
      setRequestError((e as ChatError)?.message ?? 'Request failed');
    }
  };

  if (permissionsLoading) return <Skeleton height={200} />;
  if (!canChat) {
    return (
      <Alert severity="info">
        <FormattedMessage {...messages.noPermission} />
      </Alert>
    );
  }

  const readOnly = Boolean(conversation && !conversation.canContinue);
  const readOnlyMessage = conversation && conversation.questions >= 20 ? messages.conversationFull : messages.notYours;
  const blocked =
    !usageData?.enabled || (usageData?.remainingToday ?? 0) <= 0 || usageData?.monthlyCapReached || readOnly;

  return (
    <Stack spacing={2} sx={{ height: 'calc(100vh - 120px)', minHeight: 520 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
        <Box>
          <Typography variant="h4">
            <FormattedMessage {...messages.pageTitle} />
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <FormattedMessage {...messages.subtitle} />
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          {usageData ? (
            <Chip
              color={usageData.remainingToday > 0 ? 'default' : 'warning'}
              label={
                <FormattedMessage
                  {...messages.remaining}
                  values={{ remaining: String(usageData.remainingToday), limit: String(usageData.dailyLimit) }}
                />
              }
            />
          ) : null}
          {isSuperAdmin ? (
            <Button size="small" variant="outlined" startIcon={<KeyIcon />} onClick={() => setTokensOpen(true)}>
              <FormattedMessage {...messages.serviceTokens} />
            </Button>
          ) : null}
        </Stack>
      </Stack>

      {usageData && !usageData.enabled ? (
        <Alert severity="warning">
          <FormattedMessage {...messages.notEnabled} />
        </Alert>
      ) : null}
      {usageData?.monthlyCapReached ? (
        <Alert severity="warning">
          <FormattedMessage {...messages.monthlyCapReached} />
        </Alert>
      ) : null}

      {/* Side by side from md up; stacked below, with a short conversation list so the box to ask in stays on screen. */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ flex: 1, minHeight: 0 }}>
        <Box sx={{ width: { md: '25%' }, flexShrink: 0, height: { xs: 160, md: '100%' } }}>
          <ConversationList
            selectedId={conversationId}
            onSelect={(id) => select(id)}
            onNew={() => select(undefined)}
            canSeeEveryone={isSuperAdmin}
          />
        </Box>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, minWidth: 0 }}>
          <Box ref={threadRef} sx={{ flex: 1, overflowY: 'auto', pr: 1, pb: 2 }}>
            {conversationId && detail.isLoading ? <Skeleton height={160} /> : null}
            {!conversationId && !state.question ? (
              <Paper variant="outlined" sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  <FormattedMessage {...messages.emptyTitle} />
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {EXAMPLES.map((m) => (
                    <Chip
                      key={m.id}
                      variant="outlined"
                      clickable
                      disabled={blocked}
                      label={<FormattedMessage {...m} />}
                      onClick={() => void send(String(m.defaultMessage))}
                    />
                  ))}
                </Stack>
              </Paper>
            ) : null}
            <Stack spacing={3}>
              {turns.map((t) => (
                <ChatTurn
                  key={t.id}
                  question={t.question}
                  answer={t.answer}
                  status={t.status}
                  lookups={t.lookups}
                  usage={{
                    tokens: t.inputTokens + t.outputTokens + t.cacheReadTokens + t.cacheWriteTokens,
                    costUsd: t.costUsd,
                  }}
                />
              ))}
              {state.question ? (
                <ChatTurn
                  question={state.question}
                  answer={state.text}
                  status={state.status}
                  error={state.error}
                  lookups={state.lookups}
                  streaming={state.streaming}
                />
              ) : null}
            </Stack>
          </Box>
          {requestError ? (
            <Alert severity="error" sx={{ mb: 1 }} onClose={() => setRequestError(null)}>
              {requestError}
            </Alert>
          ) : null}
          {readOnly ? (
            <Alert severity="info" sx={{ mb: 1 }}>
              <FormattedMessage {...readOnlyMessage} />
            </Alert>
          ) : null}
          <Composer
            disabled={Boolean(blocked)}
            streaming={state.streaming}
            onSend={(q) => void send(q)}
            onStop={stop}
          />
        </Box>
      </Stack>
      <ServiceTokensDialog open={tokensOpen} onClose={() => setTokensOpen(false)} />
    </Stack>
  );
}
