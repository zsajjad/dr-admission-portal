import { ResetPasswordForm } from '@/domains/auth/reset-password';

export const metadata = {
  title: 'Reset Password',
  description: 'Reset Password',
};

export default function ForgotPasswordPage() {
  return <ResetPasswordForm />;
}
