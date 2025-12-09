import * as Yup from 'yup';

interface ValidationArgs {
  validationMessages: Record<string, string>;
}

export const getAdminUserValidationSchema = ({ validationMessages }: ValidationArgs) => {
  return Yup.object({
    name: Yup.string()
      .required(validationMessages.nameRequired)
      .min(2, validationMessages.nameMinLength)
      .max(50, validationMessages.nameMaxLength),

    email: Yup.string().required(validationMessages.emailRequired).email(validationMessages.emailInvalid),
  });
};
