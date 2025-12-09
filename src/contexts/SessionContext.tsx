'use client';

import { ReactNode } from 'react';

import { SessionProvider } from 'next-auth/react';

interface SessionContextProps {
  children: ReactNode;
}

export function SessionContext({ children }: SessionContextProps) {
  return <SessionProvider>{children}</SessionProvider>;
}
