export const routes = {
  home: '/',
  adminUsers: {
    listing: '/admin-users',
    create: '/admin-users?create=true',
    edit: (key: string) => `/admin-users?edit=${key}`,
  },
  adminPermissions: {
    listing: '/admin-permissions',
    user: (adminUserId: string) => `/admin-permissions?user=${adminUserId}`,
  },
  branches: {
    listing: '/branches?includeInActive=true',
    create: '/branches/create',
    edit: (id: string) => `/branches/edit/${id}`,
    detail: (id: string) => `/branches/${id}`,
  },
  van: {
    listing: '/van?includeInActive=true',
    create: '/van/create',
    edit: (id: string) => `/van/edit/${id}`,
    detail: (id: string) => `/van/${id}`,
  },
  admission: {
    listing: '/admission',
    create: '/admission/create',
    fromLegacy: '/admission/from-legacy',
    edit: (id: string) => `/admission/edit/${id}`,
    detail: (id: string) => `/admission/${id}`,
  },
  students: {
    listing: '/students',
    profile: (id: string) => `/students/${id}`,
  },
  studentMerge: {
    listing: '/students/merge',
    withRecord: (studentId: string) => `/students/merge?a=${studentId}`,
    history: '/students/merge?tab=history',
  },
  staffUsers: {
    listing: '/staff-users',
    detail: (id: string) => `/staff-users/${id}`,
    cards: (ids?: string[]) => (ids?.length ? `/staff-users/cards?ids=${ids.join(',')}` : '/staff-users/cards'),
  },
  sections: {
    listing: '/sections',
    detail: (id: string) => `/sections/${id}`,
    classOverride: '/sections/class-override',
  },
  syncReview: {
    listing: '/sync-review',
  },
  results: {
    listing: '/results',
  },
  auditLog: {
    listing: '/audit-log',
    record: (entityType: string, entityId: string) =>
      `/audit-log?entityType=${encodeURIComponent(entityType)}&entityId=${encodeURIComponent(entityId)}`,
  },
  questions: {
    listing: '/questions?includeInActive=true',
    create: '/questions/create',
    edit: (id: string) => `/questions/edit/${id}`,
    detail: (id: string) => `/questions/${id}`,
  },
  printing: {
    listing: '/printing',
  },
  interactionReport: {
    listing: '/interactions/report',
  },
  trainings: {
    home: '/trainings',
    enrollments: '/trainings/enrollments',
    enrollment: (id: string) => `/trainings/enrollments/${id}`,
    student: (studentId: string) => `/trainings/students/${studentId}`,
    grades: '/trainings/grades',
    catalog: '/trainings/catalog',
    catalogCreate: '/trainings/catalog/new',
    catalogTraining: (id: string) => `/trainings/catalog/${id}`,
    windows: '/trainings/windows',
    ledger: '/trainings/ledger',
    reports: '/trainings/reports',
  },
  auth: {
    signIn: '/auth/sign-in',
    signUp: '/auth/sign-up',
    resetPassword: '/auth/reset-password',
    createPassword: '/auth/create-password',
    forgotPassword: '/auth/forgot-password',
    changePassword: '/auth/change-password',
  },
};
