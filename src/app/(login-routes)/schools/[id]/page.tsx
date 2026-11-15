'use client';

import * as React from 'react';

import { SchoolDetail } from '@/domains/schools/view/SchoolDetail';

export default function SchoolDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  return <SchoolDetail id={id} />;
}
