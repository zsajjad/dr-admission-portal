import { ReactNode } from 'react';

import { SchoolsShell } from '@/domains/schools/components/SchoolsShell';

export default function SchoolsLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <SchoolsShell>{children}</SchoolsShell>;
}
