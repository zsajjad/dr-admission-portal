import * as Yup from 'yup';

interface ValidationArgs {
  validationMessages: Record<string, string>;
}

export const getAdmissionValidationSchema = ({ validationMessages }: ValidationArgs) => {
  return Yup.object({
    name: Yup.string().required(validationMessages.nameRequiredError),
    fatherName: Yup.string().required(validationMessages.fatherNameRequiredError),
    phone: Yup.string().required(validationMessages.phoneRequiredError),
    alternatePhone: Yup.string().optional(),
    dateOfBirth: Yup.string().required(validationMessages.dateOfBirthRequiredError),
    gender: Yup.string().required(validationMessages.genderRequiredError),
    address: Yup.string().optional(),
    identityNumber: Yup.string().optional(),
    branchId: Yup.string().required(validationMessages.branchRequiredError),
    areaId: Yup.string().required(validationMessages.areaRequiredError),
    schoolName: Yup.string().optional(),
    schoolClass: Yup.string().optional(),
    lastYearClass: Yup.string().optional(),
    vanRequired: Yup.boolean().optional(),
    isMarried: Yup.boolean().optional(),
    isWorking: Yup.boolean().optional(),
  });
};
