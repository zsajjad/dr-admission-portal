'use client';

import { use } from 'react';

import { EnrollmentDetailView } from '@/domains/trainings/view/enrollments/EnrollmentDetailView';

export default function TrainingEnrollmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <EnrollmentDetailView enrollmentId={id} />;
}
