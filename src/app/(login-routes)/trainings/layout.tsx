import { ReactNode } from 'react';

import { TrainingsShell } from '@/domains/trainings/components/TrainingsShell';

export default function TrainingsLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <TrainingsShell>{children}</TrainingsShell>;
}
