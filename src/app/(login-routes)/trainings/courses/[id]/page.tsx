'use client';

import { use } from 'react';

import { CourseEditor } from '@/domains/trainings/view/courses/CourseEditor';

export default function TrainingCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <CourseEditor courseId={id} />;
}
