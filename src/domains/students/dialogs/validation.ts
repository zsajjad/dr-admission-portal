import * as Yup from 'yup';

import { GR_NUMBER_PATTERN, PHONE_PATTERN } from '../utils';

export interface ValidationMessages {
  required: string;
  reasonTooShort: string;
  grInvalid: string;
  grGenderMismatch: string;
  phoneInvalid: string;
}

export const getIdentitySchema = (m: ValidationMessages, grGenderDigit: '0' | '1') =>
  Yup.object({
    name: Yup.string().trim().min(2).max(150).required(m.required),
    fatherName: Yup.string().trim().min(2).max(150).required(m.required),
    dateOfBirth: Yup.string().required(m.required),
    identityNumber: Yup.string().trim().max(30),
    grNumber: Yup.string()
      .trim()
      .required(m.required)
      .matches(GR_NUMBER_PATTERN, m.grInvalid)
      .test('gender-digit', m.grGenderMismatch, (v) => !v || v.split('-')[1] === grGenderDigit),
    reason: Yup.string().trim().min(5, m.reasonTooShort).max(500).required(m.required),
  });

export const getContactSchema = (m: ValidationMessages) =>
  Yup.object({
    phone: Yup.string().trim().required(m.required).matches(PHONE_PATTERN, m.phoneInvalid),
    alternatePhone: Yup.string()
      .trim()
      .test('phone', m.phoneInvalid, (v) => !v || PHONE_PATTERN.test(v)),
    address: Yup.string().trim().max(500),
    reason: Yup.string().trim().max(500),
  });
