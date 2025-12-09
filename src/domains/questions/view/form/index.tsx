'use client';

import React from 'react';

import { FieldArray, FormikProvider, useFormik } from 'formik';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { FormSkeleton } from '@/components/Skeleton/FormSkeleton';
import { SubmitButton } from '@/components/SubmitButton';

import { QuestionSet, CreateQuestionSetQuestionDto } from '@/providers/service/app.schemas';
import { useClassLevelControllerFindAll } from '@/providers/service/class-level/class-level';
import {
  useQuestionSetControllerCreate,
  useQuestionSetControllerUpdate,
} from '@/providers/service/question-set/question-set';
import { useSessionControllerFindAll } from '@/providers/service/session/session';

import FormattedMessage, { useFormattedMessage } from '@/theme/FormattedMessage';

import { useEntityDetailHandler } from '@/hooks/useEntityDetailHandler';
import { useMutationHandlers } from '@/hooks/useMutationHandlers';

import { routes } from '@/router/routes';

import messages from './messages';
import { getQuestionSetValidationSchema } from './validationSchema';

interface QuestionSetFormProps {
  editItem?: QuestionSet;
  isLoading?: boolean;
  isEditMode?: boolean;
}

interface QuestionFormValue {
  prompt: string;
  sortOrder?: number;
}

interface FormValues {
  title: string;
  sessionId: string;
  classLevelId: string;
  questions: QuestionFormValue[];
}

export default function QuestionSetForm({
  editItem,
  isLoading,
  isEditMode = false,
}: QuestionSetFormProps): React.JSX.Element {
  const questionSetCreate = useQuestionSetControllerCreate();
  const questionSetUpdate = useQuestionSetControllerUpdate();

  // Fetch sessions and class levels for dropdowns
  const { data: sessionsData, isLoading: isLoadingSessions } = useSessionControllerFindAll({
    take: 100,
  });

  const { data: classLevelsData, isLoading: isLoadingClassLevels } = useClassLevelControllerFindAll({
    take: 100,
  });

  const sessions = sessionsData?.data || [];
  const classLevels = classLevelsData?.data || [];

  const validationMessages = {
    titleRequired: useFormattedMessage(messages.titleError),
    sessionRequired: useFormattedMessage(messages.sessionError),
    classLevelRequired: useFormattedMessage(messages.classLevelError),
    questionsRequired: useFormattedMessage(messages.questionsError),
    promptRequired: useFormattedMessage(messages.promptError),
  };

  const generalMessages = {
    saveError: useFormattedMessage(messages.saveError),
    saveSuccess: useFormattedMessage(messages.saveSuccess),
    failedToFetch: useFormattedMessage(messages.failedToFetch),
  };

  // Transform existing questions to form format
  const existingQuestions: QuestionFormValue[] =
    editItem?.questions?.map((q, index) => ({
      prompt: q.prompt,
      sortOrder: q.sortOrder ?? index,
    })) || [];

  const initialValues: FormValues = {
    title: editItem?.title || '',
    sessionId: editItem?.session?.id || '',
    classLevelId: editItem?.classLevel?.id || '',
    questions: existingQuestions.length > 0 ? existingQuestions : [{ prompt: '', sortOrder: 0 }],
  };

  const formik = useFormik<FormValues>({
    initialValues,
    enableReinitialize: true,
    validationSchema: getQuestionSetValidationSchema({ validationMessages }),
    onSubmit: (values, { setStatus }) => {
      setStatus(null);

      const questionsPayload: CreateQuestionSetQuestionDto[] = values.questions.map((q, index) => ({
        prompt: q.prompt,
        sortOrder: q.sortOrder ?? index,
      }));

      if (editItem) {
        questionSetUpdate.mutate(
          {
            id: editItem.id.toString(),
            data: {
              title: values.title,
              sessionId: values.sessionId,
              classLevelId: values.classLevelId,
              questions: questionsPayload,
            },
          },
          { onSuccess, onError },
        );
      } else {
        questionSetCreate.mutate(
          {
            data: {
              title: values.title,
              sessionId: values.sessionId,
              classLevelId: values.classLevelId,
              questions: questionsPayload,
            },
          },
          { onSuccess, onError },
        );
      }
    },
  });

  const { onSuccess, onError } = useMutationHandlers({
    messages: {
      successUpdate: generalMessages.saveSuccess,
      errorUpdate: generalMessages.saveError,
    },
    setStatus: formik.setStatus,
    redirectTo: routes.questions.listing,
    setSubmitting: formik.setSubmitting,
  });

  const { values, handleChange, handleBlur, handleSubmit, errors, touched, isSubmitting, setFieldValue } = formik;

  useEntityDetailHandler({
    data: editItem,
    isLoading: isLoading ?? false,
    notFoundMessage: generalMessages.failedToFetch,
    isEnabled: isEditMode,
  });

  if (isLoading || isLoadingSessions || isLoadingClassLevels) return <FormSkeleton />;

  const selectedSession = sessions.find((s) => s.id === values.sessionId) || null;
  const selectedClassLevel = classLevels.find((c) => c.id === values.classLevelId) || null;

  return (
    <FormikProvider value={formik}>
      <Stack component="form" onSubmit={handleSubmit} sx={{ paddingBlockEnd: 2 }} spacing={2}>
        {formik.status && typeof formik.status === 'string' && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {formik.status}
          </Alert>
        )}

        {/* Basic Information */}
        <Card>
          <CardContent>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  name="title"
                  label={<FormattedMessage {...messages.titleLabel} />}
                  placeholder={messages.titlePlaceholder.defaultMessage}
                  value={values.title}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.title && Boolean(errors.title)}
                  helperText={touched.title && errors.title}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Autocomplete
                  options={sessions}
                  getOptionLabel={(option) => option.name || ''}
                  value={selectedSession}
                  onChange={(_, newValue) => {
                    setFieldValue('sessionId', newValue?.id || '');
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={<FormattedMessage {...messages.sessionLabel} />}
                      placeholder={messages.sessionPlaceholder.defaultMessage}
                      error={touched.sessionId && Boolean(errors.sessionId)}
                      helperText={touched.sessionId && errors.sessionId}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Autocomplete
                  options={classLevels}
                  getOptionLabel={(option) => option.name || ''}
                  value={selectedClassLevel}
                  onChange={(_, newValue) => {
                    setFieldValue('classLevelId', newValue?.id || '');
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={<FormattedMessage {...messages.classLevelLabel} />}
                      placeholder={messages.classLevelPlaceholder.defaultMessage}
                      error={touched.classLevelId && Boolean(errors.classLevelId)}
                      helperText={touched.classLevelId && errors.classLevelId}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Questions Section */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                <FormattedMessage {...messages.questionsLabel} />
              </Typography>
            </Box>

            <FieldArray name="questions">
              {({ push, remove }) => (
                <Stack spacing={2}>
                  {values.questions.map((question, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        gap: 2,
                        alignItems: 'flex-start',
                        p: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', pt: 1 }}>
                        <DragIndicatorIcon color="disabled" />
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 1, minWidth: 24 }}>
                          {index + 1}.
                        </Typography>
                      </Box>
                      <TextField
                        fullWidth
                        name={`questions.${index}.prompt`}
                        label={<FormattedMessage {...messages.promptLabel} />}
                        placeholder={messages.promptPlaceholder.defaultMessage}
                        value={question.prompt}
                        onChange={(e) => {
                          setFieldValue(`questions.${index}.prompt`, e.target.value);
                          setFieldValue(`questions.${index}.sortOrder`, index);
                        }}
                        onBlur={handleBlur}
                        error={
                          touched.questions?.[index] &&
                          Boolean((errors.questions?.[index] as { prompt?: string })?.prompt)
                        }
                        helperText={
                          touched.questions?.[index] && (errors.questions?.[index] as { prompt?: string })?.prompt
                        }
                        multiline
                        rows={2}
                      />
                      <IconButton
                        color="error"
                        onClick={() => remove(index)}
                        disabled={values.questions.length === 1}
                        sx={{ mt: 1 }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ))}

                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => push({ prompt: '', sortOrder: values.questions.length })}
                    sx={{ alignSelf: 'flex-start' }}
                  >
                    <FormattedMessage {...messages.addQuestion} />
                  </Button>

                  {typeof errors.questions === 'string' && touched.questions && (
                    <Alert severity="error">{errors.questions}</Alert>
                  )}
                </Stack>
              )}
            </FieldArray>
          </CardContent>
        </Card>

        <SubmitButton
          isSubmitting={isSubmitting}
          disabled={!formik.dirty}
          isEdit={!!editItem}
          messages={{
            create: messages.create,
            update: messages.update,
            saving: messages.saving,
          }}
        />
      </Stack>
    </FormikProvider>
  );
}
