import { useFormattedMessage } from '@/theme/FormattedMessage';

import messages from '../messages';

import { ValidationMessages } from './validation';

export function useValidationMessages(grGenderDigit: string = '1'): ValidationMessages {
  return {
    required: useFormattedMessage(messages.required),
    reasonTooShort: useFormattedMessage(messages.reasonTooShort),
    grInvalid: useFormattedMessage(messages.grInvalid),
    grGenderMismatch: useFormattedMessage({ ...messages.grGenderMismatch, values: { digit: grGenderDigit } }),
    phoneInvalid: useFormattedMessage(messages.phoneInvalid),
  };
}
