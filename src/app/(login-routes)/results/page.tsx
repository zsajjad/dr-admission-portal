'use client';

import { ResultsView } from '@/domains/results/view';

import { RequirePermission } from '@/components/RequirePermission';

import { Permission } from '@/providers/service/app.schemas';

export default function ResultsPage() {
  return (
    <RequirePermission anyOf={[Permission.reportsview, Permission.resultsenter]}>
      <ResultsView />
    </RequirePermission>
  );
}
