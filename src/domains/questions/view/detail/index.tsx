'use client';

import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import {
  Card,
  CardContent,
  Stack,
  Typography,
  Box,
  Chip,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';

import { DetailHeader } from '@/components/DetailHeader';
import headerMessages from '@/components/DetailHeader/messages';
import { DetailNotFound } from '@/components/DetailNotFound';
import { DetailSkeleton } from '@/components/Skeleton/DetailSkeleton';

import { KEYS } from '@/providers/constants/key';
import { QuestionSet } from '@/providers/service/app.schemas';
import {
  useQuestionSetControllerActivate,
  useQuestionSetControllerDeactivate,
  useQuestionSetControllerFindOne,
} from '@/providers/service/question-set/question-set';

import FormattedMessage, { useFormattedMessage } from '@/theme/FormattedMessage';

import { useActivationHandlers } from '@/hooks/useActivationHandlers';
import { useEntityDetailHandler } from '@/hooks/useEntityDetailHandler';
import { useMutationHandlers } from '@/hooks/useMutationHandlers';

import { routes } from '@/router/routes';
import { useQueryParams } from '@/router/useQueryParams';

import messages from './messages';

export function QuestionSetDetail({ questionSetId }: { questionSetId: string }) {
  const { route } = useQueryParams();
  const activateQuestionSet = useQuestionSetControllerActivate();
  const deactivateQuestionSet = useQuestionSetControllerDeactivate();
  const {
    data: { data: questionSet } = {},
    isLoading,
    isFetching,
    error,
  } = useQuestionSetControllerFindOne(
    questionSetId,
    {
      includeInActive: true,
    },
    {
      query: {
        queryKey: [KEYS.QUESTION_SET_DETAIL, questionSetId],
      },
    },
  );

  const formattedMessages = {
    failToFetch: useFormattedMessage(messages.failToFetch),
    notFound: useFormattedMessage(messages.notFound),
    activate: useFormattedMessage(messages.activate),
    deActivate: useFormattedMessage(messages.deactivate),
    successUpdate: useFormattedMessage(messages.successUpdate),
    errorUpdate: useFormattedMessage(messages.errorUpdate),
    noQuestions: useFormattedMessage(messages.noQuestions),
  };

  const { onSuccess, onError } = useMutationHandlers({
    queryKey: [KEYS.QUESTION_SET_DETAIL, questionSetId],
    messages: {
      successUpdate: formattedMessages.successUpdate,
      errorUpdate: formattedMessages.errorUpdate,
    },
  });

  const { handleActivate, handleDeactivate } = useActivationHandlers<QuestionSet>(
    activateQuestionSet,
    deactivateQuestionSet,
    onSuccess,
    onError,
  );

  useEntityDetailHandler({
    data: questionSet,
    isLoading: isLoading || isFetching,
    notFoundMessage: formattedMessages.failToFetch,
    isEnabled: true,
    // @ts-expect-error error type is unknown
    error: error?.statusCode,
  });

  if (isLoading) return <DetailSkeleton />;

  if (!questionSet) {
    return <DetailNotFound notFoundMessage={formattedMessages.notFound} />;
  }

  const sortedQuestions = [...(questionSet?.questions || [])].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <Stack spacing={2}>
      <DetailHeader
        title={questionSet.title}
        isActive={questionSet.isActive}
        fields={[
          {
            key: 'class',
            label: <FormattedMessage {...messages.classLevelLabel} />,
            value: questionSet.classLevel?.name,
          },
          { key: 'session', label: <FormattedMessage {...messages.sessionLabel} />, value: questionSet.session?.name },
          {
            key: 'questions',
            label: <FormattedMessage {...messages.questionsCountLabel} />,
            value: questionSet.questions?.length || 0,
          },
        ]}
        createdAt={questionSet.createdAt}
        updatedAt={questionSet.updatedAt}
        onEdit={() => route({ url: routes.questions.edit(questionSet.id) })}
        onToggleActive={() => (questionSet.isActive ? handleDeactivate(questionSet) : handleActivate(questionSet))}
        isToggling={activateQuestionSet.isPending || deactivateQuestionSet.isPending || isFetching}
      />

      {/* Questions Section */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <FormattedMessage {...messages.questionsLabel} />
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {sortedQuestions.length > 0 ? (
            <List>
              {sortedQuestions.map((question) => (
                <Paper key={question.id} variant="outlined" sx={{ mb: 1, borderRadius: 3 }}>
                  <ListItem>
                    <ListItemIcon>
                      <Chip label={question.sortOrder} size="small" color="primary" sx={{ minWidth: 32 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={question.prompt}
                      secondary={
                        <Box component="span" sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                          <Chip
                            label={
                              <FormattedMessage
                                {...(question.isActive ? headerMessages.active : headerMessages.deactivated)}
                              />
                            }
                            size="small"
                            color={question.isActive ? 'success' : 'default'}
                            variant="outlined"
                          />
                        </Box>
                      }
                    />
                  </ListItem>
                </Paper>
              ))}
            </List>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <QuestionMarkIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
              <Typography color="text.secondary">{formattedMessages.noQuestions}</Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}
