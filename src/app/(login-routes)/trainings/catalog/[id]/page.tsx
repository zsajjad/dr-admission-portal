'use client';

import { use } from 'react';

import { CatalogEditor } from '@/domains/trainings/view/catalog/CatalogEditor';

export default function CatalogTrainingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <CatalogEditor trainingId={id} />;
}
