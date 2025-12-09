import { ForgotPasswordForm } from '@/domains/auth/forgot-password';

import { config } from '@/config';

export const metadata = {
  title: config.site.name,
  description: 'Forgot Password',
};
export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
