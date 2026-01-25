import * as Yup from 'yup';

interface ValidationArgs {
  validationMessages: Record<string, string>;
}

export const getVanValidationSchema = ({ validationMessages }: ValidationArgs) => {
  return Yup.object().shape({
    branchId: Yup.string().required(validationMessages.branchRequired),
    code: Yup.string().required(validationMessages.codeRequired),
    name: Yup.string().required(validationMessages.nameRequired),
    colorName: Yup.string().required(validationMessages.colorNameRequired),
    colorHex: Yup.string()
      .required(validationMessages.colorHexRequired)
      .matches(/^#[0-9A-Fa-f]{6}$/, validationMessages.colorHexInvalid),
    areaIds: Yup.array().of(Yup.string()),
  });
};
