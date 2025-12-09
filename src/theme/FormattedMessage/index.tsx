'use client';

/**
 *
 * FormattedMessage
 *
 */

import { useIntl } from 'react-intl';

import { useLocale } from '@/contexts/LocaleContext';

import messages from '@/translations/en.json';
import urMessages from '@/translations/ur.json';

// Available locales and their message files
const availableLocales: Record<string, Record<string, string>> = {
  en: messages,
  ur: urMessages,
};

export interface FormattedMessageProps {
  id: string;
  values?: Record<string, string>;
  defaultMessage: string;
  locale?: string; // Optional locale override
}

export function useFormattedMessage(props: FormattedMessageProps): string {
  const { id, values = {}, defaultMessage, locale: propLocale } = props || {};
  const intl = useIntl();
  const { locale: contextLocale } = useLocale();

  if (!id) {
    return '';
  }

  // Use prop locale if provided, otherwise use context locale
  const currentLocale = propLocale || contextLocale;

  // If a specific locale is requested and it's different from the current intl locale
  if (propLocale && propLocale !== intl.locale) {
    // Get messages for the requested locale
    const localeMessages = availableLocales[currentLocale];

    if (localeMessages && localeMessages[id]) {
      // If we have the message in the requested locale, format it with values
      let message = localeMessages[id];

      // Simple value interpolation for the specific locale
      if (values && Object.keys(values).length > 0) {
        Object.entries(values).forEach(([key, value]) => {
          message = message.replace(new RegExp(`{${key}}`, 'g'), value);
        });
      }

      return message;
    }
  }

  // Fallback to the current intl context
  return intl.formatMessage({ id, defaultMessage }, values);
}

export const FormattedMessage = ({ id, defaultMessage, values, locale }: FormattedMessageProps) => {
  return useFormattedMessage({ id, defaultMessage, values, locale });
};

export default FormattedMessage;
