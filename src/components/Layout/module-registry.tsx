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
  van: {
    title: <FormattedMessage {...messages.van} />,
    href: routes.van.listing,
    icon: 'van',
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
  printing: {
    title: <FormattedMessage {...messages.printing} />,
    href: routes.printing.listing,
    icon: 'printing',
  },
  interactionReport: {
    title: <FormattedMessage {...messages.interactionReport} />,
    href: routes.interactionReport.listing,
    icon: 'interactionReport',
  },
} as const;

export type ModuleKey = keyof typeof MODULE_REGISTRY;
