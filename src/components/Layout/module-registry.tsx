import { FormattedMessage } from '@/theme/FormattedMessage';

import { routes } from '@/router/routes';

import messages from './messages';

// module-registry.ts
export const MODULE_REGISTRY = {
  home: {
    title: <FormattedMessage {...messages.home} />,
    href: routes.home,
    icon: 'home',
    key: 'home',
  },
  adminUsers: {
    title: <FormattedMessage {...messages.adminUsers} />,
    href: routes.adminUsers.listing,
    icon: 'adminUsers',
  },
  branches: {
    title: <FormattedMessage {...messages.branches} />,
    href: routes.branches.listing,
    icon: 'branches',
  },
  admission: {
    title: <FormattedMessage {...messages.admissions} />,
    href: routes.admission.listing,
    icon: 'admissions',
  },
  questionSets: {
    title: <FormattedMessage {...messages.questionSets} />,
    href: routes.questions.listing,
    icon: 'questionSets',
  },
} as const;

export type ModuleKey = keyof typeof MODULE_REGISTRY;
