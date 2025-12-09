import * as Yup from 'yup';

interface ValidationArgs {
  validationMessages: Record<string, string>;
}

export const getBranchValidationSchema = ({ validationMessages }: ValidationArgs) => {
  return Yup.object().shape({
    code: Yup.string().required(validationMessages.codeRequired),
    name: Yup.string().required(validationMessages.nameRequired),
  });
};
