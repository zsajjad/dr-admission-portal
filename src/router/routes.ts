export const routes = {
  home: '/',
  adminUsers: {
    listing: '/admin-users',
    create: '/admin-users?create=true',
    edit: (key: string) => `/admin-users?edit=${key}`,
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
    edit: (id: string) => `/admission/edit/${id}`,
    detail: (id: string) => `/admission/${id}`,
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
  auth: {
    signIn: '/auth/sign-in',
    signUp: '/auth/sign-up',
    resetPassword: '/auth/reset-password',
    createPassword: '/auth/create-password',
    forgotPassword: '/auth/forgot-password',
    changePassword: '/auth/change-password',
  },
};
