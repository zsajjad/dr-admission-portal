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
  auth: {
    signIn: '/auth/sign-in',
    signUp: '/auth/sign-up',
    resetPassword: '/auth/reset-password',
    createPassword: '/auth/create-password',
    forgotPassword: '/auth/forgot-password',
    changePassword: '/auth/change-password',
  },
};
