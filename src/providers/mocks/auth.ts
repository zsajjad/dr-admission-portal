import { useMutation, useQuery } from '@tanstack/react-query';

// Simple mock auth responses used when backend services are not available.
export interface MockLoginPayload {
  email: string;
  password: string;
  captchaToken?: string;
}

export interface MockAuthResponse {
  accessToken: string;
  refreshToken: string;
  requiresPasswordChange?: boolean;
  message?: string;
}

export interface MockUserDetail {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  isActive?: boolean;
  avatar?: string;
}

const mockTokens: MockAuthResponse = {
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  requiresPasswordChange: false,
};

export async function mockLogin(payload: MockLoginPayload): Promise<MockAuthResponse> {
  const { email, password } = payload;
  if (!email || !password) {
    throw new Error('Invalid credentials');
  }

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 400));

  return { ...mockTokens };
}

export function useMockForgotPassword() {
  return useMutation({
    mutationFn: async ({ email }: { email: string; captchaToken?: string }) => {
      if (!email) throw new Error('Email is required');
      await new Promise((resolve) => setTimeout(resolve, 400));
      return { message: 'If an account exists, a reset link has been sent.' };
    },
  });
}

export function useMockChangePassword() {
  return useMutation({
    mutationFn: async ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) => {
      if (!currentPassword || !newPassword) throw new Error('Password is required');
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { message: 'Password updated successfully' };
    },
  });
}

export function useMockLogout() {
  return useMutation({
    mutationFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return { message: 'Logged out' };
    },
  });
}

export async function mockUserDetail(payload?: { id?: string; email?: string }): Promise<{ data: MockUserDetail }> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  const fallbackEmail = payload?.email ?? 'john.doe@example.com';
  const nameFromEmail = payload?.email ? payload.email.split('@')[0] : 'John Doe';
  const avatarName = encodeURIComponent(nameFromEmail || 'User');
  return {
    data: {
      id: payload?.id ?? '1',
      name: nameFromEmail,
      email: fallbackEmail,
      role: 'admin',
      isActive: true,
      avatar: `https://ui-avatars.com/api/?name=${avatarName}`,
    },
  };
}

export function useMockUserDetail({ id, email, enabled = true }: { id?: string; email?: string; enabled?: boolean }) {
  return useQuery({
    queryKey: ['mock-user-detail', { id, email }],
    enabled,
    queryFn: () => mockUserDetail({ id, email }),
  });
}
