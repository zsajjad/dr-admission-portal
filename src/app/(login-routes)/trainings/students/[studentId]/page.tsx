'use client';

import { use } from 'react';

import { StudentTrainingsView } from '@/domains/trainings/view/enrollments/StudentTrainingsView';

export default function StudentTrainingsPage({ params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = use(params);
  return <StudentTrainingsView studentId={studentId} />;
}
