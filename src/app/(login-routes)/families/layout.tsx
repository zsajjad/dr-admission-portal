import { ReactNode } from 'react';

import { FamiliesShell } from '@/domains/families/components/FamiliesShell';

export default function FamiliesLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <FamiliesShell>{children}</FamiliesShell>;
}
