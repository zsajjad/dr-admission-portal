import * as Yup from 'yup';

type ValidationSchemaProps = {
  validationMessages: Record<string, string>;
  isCaptchaEnabled: boolean;
};

export const validationSchema = ({ validationMessages, isCaptchaEnabled }: ValidationSchemaProps) => {
  return Yup.object({
    currentPassword: Yup.string().required(validationMessages.currentPasswordRequired),
    newPassword: Yup.string()
      .required(validationMessages.newPasswordRequired)
      .min(8, validationMessages.passwordMinCharacters)
      .matches(/[A-Z]/, validationMessages.passwordUppercase)
      .matches(/[0-9]/, validationMessages.passwordNumber)
      .matches(/[@$!%*?&#^()_+\-={}\[\]|:;"'<>,./]/, validationMessages.passwordSpecialCharacter)
      .notOneOf([Yup.ref('currentPassword')], validationMessages.passwordNotSame),
    confirmPassword: Yup.string()
      .required(validationMessages.confirmPasswordRequired)
      .oneOf([Yup.ref('newPassword')], validationMessages.passwordNotMatch),
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
