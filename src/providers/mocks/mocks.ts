import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface MockTranslation {
  languageCode: string;
  question: string;
  answer: string;
  tag?: string;
}

export interface Mock {
  id: number;
  key: string;
  order: number;
  isActive: boolean;
  translations: MockTranslation[];
  createdAt?: string;
  updatedAt?: string;
  createdBy?: { name?: string };
  updatedBy?: { name?: string };
}

export type ExtendedMock = Mock;

export interface MockListResponse {
  data: Mock[];
  count: number;
}

export type MockControllerFindAllSortBy = 'order' | 'key';

interface ListArgs {
  languageCode?: string;
  sortBy?: MockControllerFindAllSortBy;
  sortOrder?: 'asc' | 'desc';
  skip?: number;
  take?: number;
  includeInActive?: boolean;
  id?: number;
  question?: string;
  answer?: string;
  tag?: string;
  key?: string;
}

let mockStore: Mock[] = [
  {
    id: 1,
    key: 'getting-started',
    order: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    translations: [
      {
        languageCode: 'en',
        question: 'How do I sign in?',
        answer: 'Use the sign-in page with your username and password.',
        tag: 'auth',
      },
    ],
  },
  {
    id: 2,
    key: 'forgot-password',
    order: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    translations: [
      {
        languageCode: 'en',
        question: 'How do I reset my password?',
        answer: 'Click on “Forgot password” and follow the instructions.',
        tag: 'auth',
      },
    ],
  },
];

function applyFilters(listArgs: ListArgs): MockListResponse {
  const { skip = 0, take = 10, includeInActive, id, question, answer, tag, key } = listArgs;
  let data = [...mockStore];

  if (!includeInActive) {
    data = data.filter((mock) => mock.isActive);
  }

  if (typeof id === 'number') {
    data = data.filter((mock) => mock.id === id);
  }

  if (key) {
    data = data.filter((mock) => mock.key.toLowerCase().includes(key.toLowerCase()));
  }

  if (question) {
    data = data.filter((mock) =>
      mock.translations.some((t) => t.question.toLowerCase().includes(question.toLowerCase())),
    );
  }

  if (answer) {
    data = data.filter((mock) => mock.translations.some((t) => t.answer.toLowerCase().includes(answer.toLowerCase())));
  }

  if (tag) {
    data = data.filter((mock) =>
      mock.translations.some((t) => (t.tag ?? '').toLowerCase().includes(tag.toLowerCase())),
    );
  }

  const count = data.length;
  const paged = data.slice(skip, skip + take);
  return { data: paged, count };
}

export function useMockControllerFindAll(
  args: ListArgs = {},
  options?: { query?: { enabled?: boolean; queryKey?: any[] } },
) {
  const { query } = options ?? {};
  const enabled = query?.enabled ?? true;
  const queryKey = query?.queryKey ?? ['mock-mocks', args];
  return useQuery({
    queryKey,
    enabled,
    queryFn: async () => applyFilters(args),
  });
}

export function useMockControllerFindOne(
  id: string | number,
  _params?: unknown,
  options?: { query?: { queryKey?: any[] } },
) {
  const queryKey = options?.query?.queryKey ?? ['mock-mock', id];
  return useQuery({
    queryKey,
    enabled: !!id,
    queryFn: async () => {
      const mock = mockStore.find((item) => item.id === Number(id));
      if (!mock) throw Object.assign(new Error('Not found'), { statusCode: 404 });
      return { data: mock };
    },
  });
}

export function useMockControllerCreate() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ data }: { data: Partial<Mock> }) => {
      if (!data.key) throw new Error('Key is required');
      const id = mockStore.length ? Math.max(...mockStore.map((f) => f.id)) + 1 : 1;
      const newMock: Mock = {
        id,
        key: data.key,
        order: data.order ?? 0,
        isActive: true,
        translations: data.translations || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockStore = [...mockStore, newMock];
      return { data: newMock, message: 'Mock created' };
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['mock-mocks'] });
    },
  });
}

export function useMockControllerUpdate() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Mock> }) => {
      const idx = mockStore.findIndex((mock) => mock.id === Number(id));
      if (idx === -1) throw new Error('Mock not found');
      const updated: Mock = {
        ...mockStore[idx],
        ...data,
        translations: data.translations ?? mockStore[idx].translations,
        updatedAt: new Date().toISOString(),
      };
      mockStore = mockStore.map((mock) => (mock.id === Number(id) ? updated : mock));
      return { data: updated, message: 'Mock updated' };
    },
    onSuccess: (_, variables) => {
      client.invalidateQueries({ queryKey: ['mock-mocks'] });
      client.invalidateQueries({ queryKey: ['mock-mock', variables.id] });
    },
  });
}

export function useMockControllerActivate() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const numericId = Number(id);
      mockStore = mockStore.map((mock) => (mock.id === numericId ? { ...mock, isActive: true } : mock));
      return { message: 'Mock activated' };
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['mock-mocks'] });
    },
  });
}

export function useMockControllerDeactivate() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const numericId = Number(id);
      mockStore = mockStore.map((mock) => (mock.id === numericId ? { ...mock, isActive: false } : mock));
      return { message: 'Mock deactivated' };
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['mock-mocks'] });
    },
  });
}

export function useMockControllerExportExcel(_args?: unknown, options?: { query?: { enabled?: boolean } }) {
  const enabled = options?.query?.enabled ?? false;
  return useQuery({
    queryKey: ['mock-mock-export'],
    enabled,
    queryFn: async () => {
      const blob = new Blob([JSON.stringify(mockStore, null, 2)], { type: 'application/json' });
      return blob;
    },
    staleTime: Infinity,
  });
}

export function useMockControllerImportExcel() {
  const client = useQueryClient();
  return useMutation({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    mutationFn: async (_payload: { data: { file: File } }) => {
      // In boilerplate mode we do not parse the file; pretend it succeeded.
      return { message: 'Mock import processed (mocked)' };
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['mock-mocks'] });
    },
  });
}
