import * as Yup from 'yup';

type ValidationSchemaProps = {
  validationMessages: Record<string, string>;
  isCaptchaEnabled: boolean;
};

export const validationSchema = ({ validationMessages, isCaptchaEnabled }: ValidationSchemaProps) => {
  return Yup.object({
    email: Yup.string().email(validationMessages.invalidEmail).required(validationMessages.emailRequired),
    captchaToken: Yup.string().when([], {
      is: function () {
        return isCaptchaEnabled;
      },
      then: () => Yup.string().required(validationMessages.captchaRequired),
      otherwise: () => Yup.string().notRequired(),
    }),
    captchaResetKey: Yup.number().when([], {
      is: function () {
        return isCaptchaEnabled;
      },
      then: () => Yup.number().required(validationMessages.captchaResetKeyRequired),
      otherwise: () => Yup.number().notRequired(),
    }),
  });
};
