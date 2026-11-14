// Run with `pnpm test` (node --test; Node strips the types, so no build is needed).
import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';

import { QueryClient } from '@tanstack/react-query';

import {
  DEFAULT_STALE_TIME_MS,
  REFERENCE_STALE_TIME_MS,
  applyReferenceDataDefaults,
  markAllStale,
} from './cachePolicy.ts';

const clients: QueryClient[] = [];

function client(): QueryClient {
  const qc = new QueryClient({ defaultOptions: { queries: { staleTime: DEFAULT_STALE_TIME_MS } } });
  applyReferenceDataDefaults(qc);
  clients.push(qc);
  return qc;
}

// Clearing removes the queries and their garbage-collection timers, which would keep Node running.
afterEach(() => {
  for (const qc of clients.splice(0)) qc.clear();
});

describe('cache policy', () => {
  it('keeps reference lists fresh for 10 minutes, with or without params', () => {
    const qc = client();
    assert.equal(qc.getQueryDefaults(['/session']).staleTime, REFERENCE_STALE_TIME_MS);
    assert.equal(qc.getQueryDefaults(['/branch', { page: 1 }]).staleTime, REFERENCE_STALE_TIME_MS);
  });

  it('leaves other queries, including one session by id, on the default', () => {
    const qc = client();
    assert.equal(qc.getQueryDefaults(['/admissions']).staleTime, undefined);
    assert.equal(qc.getQueryDefaults(['/session/abc']).staleTime, undefined);
    assert.equal(qc.getDefaultOptions().queries?.staleTime, DEFAULT_STALE_TIME_MS);
  });

  it('markAllStale invalidates every cached query without refetching it', async () => {
    const qc = client();
    qc.setQueryData(['/session'], [{ id: 's1' }]);
    qc.setQueryData(['/admissions', { page: 1 }], []);
    let fetched = 0;
    qc.getQueryCache().subscribe((event) => {
      if (event.type === 'updated' && event.action.type === 'fetch') fetched += 1;
    });
    await markAllStale(qc);
    for (const query of qc.getQueryCache().getAll()) assert.equal(query.state.isInvalidated, true);
    assert.equal(fetched, 0);
  });
});
