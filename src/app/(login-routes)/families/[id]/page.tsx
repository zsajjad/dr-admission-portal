'use client';

import * as React from 'react';

import { FamilyDetail } from '@/domains/families/view/detail';

export default function FamilyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  return <FamilyDetail id={id} />;
}
