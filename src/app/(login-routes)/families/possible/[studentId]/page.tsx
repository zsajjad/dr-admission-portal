'use client';

import * as React from 'react';

import { PossibleFamily } from '@/domains/families/view/possible';

export default function PossibleFamilyPage({ params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = React.use(params);
  return <PossibleFamily studentId={studentId} />;
}
