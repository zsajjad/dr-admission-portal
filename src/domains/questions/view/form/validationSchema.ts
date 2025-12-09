import * as Yup from 'yup';

interface ValidationArgs {
  validationMessages: Record<string, string>;
}

export const getQuestionSetValidationSchema = ({ validationMessages }: ValidationArgs) => {
  return Yup.object().shape({
    title: Yup.string().required(validationMessages.titleRequired),
    sessionId: Yup.string().required(validationMessages.sessionRequired),
    classLevelId: Yup.string().required(validationMessages.classLevelRequired),
    questions: Yup.array()
      .of(
        Yup.object().shape({
          prompt: Yup.string().required(validationMessages.promptRequired),
          sortOrder: Yup.number(),
        }),
      )
      .min(1, validationMessages.questionsRequired),
  });
};
