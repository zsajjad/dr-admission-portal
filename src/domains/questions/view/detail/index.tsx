'use client';

import { useCallback, useMemo } from 'react';

import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import {
  Card,
  CardContent,
  CircularProgress,
  FormControlLabel,
  Grid,
  Stack,
  Switch,
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

import InfoTooltip from '@/components/DataTable/InfoTooltipColumn/Tooltip';
import { DetailItem } from '@/components/DetailItem';
import { DetailNotFound } from '@/components/DetailNotFound';
import { DetailTooltipWrapper } from '@/components/DetailTooltipWrapper';
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

import messages from './messages';

export function QuestionSetDetail({ questionSetId }: { questionSetId: string }) {
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

  const questionSetDetailFields: { label: keyof typeof messages; value?: string | number }[] = useMemo(() => {
    return [
      {
        label: 'idLabel',
        value: questionSet?.id,
      },
      {
        label: 'titleLabel',
        value: questionSet?.title,
      },
      {
        label: 'classLevelLabel',
        value: questionSet?.classLevel?.name,
      },
      {
        label: 'sessionLabel',
        value: questionSet?.session?.name,
      },
      {
        label: 'questionsCountLabel',
        value: questionSet?.questions?.length || 0,
      },
    ];
  }, [questionSet]);

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

  const handleCheck = useCallback(
    (checked: boolean) => {
      if (questionSet) {
        if (checked) {
          handleActivate(questionSet);
        } else handleDeactivate(questionSet);
      }
    },
    [handleActivate, handleDeactivate, questionSet],
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
      <Card>
        <CardContent>
          <DetailTooltipWrapper>
            <InfoTooltip
              createdAt={questionSet?.createdAt}
              updatedAt={questionSet?.updatedAt}
              isActive={questionSet?.isActive}
            />
          </DetailTooltipWrapper>
          <Grid container spacing={2}>
            {questionSetDetailFields?.map((field, idx) => (
              <DetailItem
                key={`question-set-${idx}`}
                label={<FormattedMessage {...messages?.[field.label]} />}
                value={field.value}
              />
            ))}

            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <FormControlLabel
                control={
                  activateQuestionSet.isPending || deactivateQuestionSet.isPending || isFetching || isLoading ? (
                    <CircularProgress size={26} sx={{ mr: 2 }} />
                  ) : (
                    <Switch checked={questionSet?.isActive || false} onChange={(e) => handleCheck(e.target.checked)} />
                  )
                }
                label={<FormattedMessage {...(questionSet?.isActive ? messages.deactivate : messages.activate)} />}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Questions Section */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <FormattedMessage {...messages.questionsLabel} />
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {sortedQuestions.length > 0 ? (
            <List>
              {sortedQuestions.map((question, index) => (
                <Paper key={question.id} elevation={1} sx={{ mb: 1 }}>
                  <ListItem>
                    <ListItemIcon>
                      <Chip label={question.sortOrder} size="small" color="primary" sx={{ minWidth: 32 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={question.prompt}
                      secondary={
                        <Box component="span" sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                          <Chip
                            label={question.isActive ? 'Active' : 'Inactive'}
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
