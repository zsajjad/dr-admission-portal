import { ReactNode } from 'react';

import { TRAININGS_READ } from '@/domains/trainings/permissions';

import { Permission } from '@/providers/service/app.schemas';

import { FormattedMessage } from '@/theme/FormattedMessage';

import { routes } from '@/router/routes';

import messages from './messages';

// module-registry.ts
interface ModuleConfig {
  title: ReactNode;
  href: string;
  icon: string;
  key?: string;
  /** Shown only to admins with at least one of these */
  permissions?: Permission[];
  /** Shown only to super admins */
  superAdminOnly?: boolean;
}

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
  adminPermissions: {
    title: <FormattedMessage {...messages.adminPermissions} />,
    href: routes.adminPermissions.listing,
    icon: 'adminPermissions',
    superAdminOnly: true,
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
  students: {
    title: <FormattedMessage {...messages.students} />,
    href: routes.students.listing,
    icon: 'students',
  },
  studentMerge: {
    title: <FormattedMessage {...messages.studentMerge} />,
    href: routes.studentMerge.listing,
    icon: 'studentMerge',
    permissions: [Permission.studentsmerge],
  },
  staffUsers: {
    title: <FormattedMessage {...messages.staffUsers} />,
    href: routes.staffUsers.listing,
    icon: 'staffUsers',
    permissions: [Permission.staffmanage],
  },
  sections: {
    title: <FormattedMessage {...messages.sections} />,
    href: routes.sections.listing,
    icon: 'sections',
    permissions: [Permission.sectionsmanage],
  },
  syncReview: {
    title: <FormattedMessage {...messages.syncReview} />,
    href: routes.syncReview.listing,
    icon: 'syncReview',
    permissions: [Permission.staffreview],
  },
  results: {
    title: <FormattedMessage {...messages.results} />,
    href: routes.results.listing,
    icon: 'results',
    permissions: [Permission.reportsview, Permission.resultsenter],
  },
  auditLog: {
    title: <FormattedMessage {...messages.auditLog} />,
    href: routes.auditLog.listing,
    icon: 'auditLog',
    permissions: [Permission.auditview],
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
  trainings: {
    title: <FormattedMessage {...messages.trainings} />,
    href: routes.trainings.home,
    icon: 'trainings',
    permissions: TRAININGS_READ,
  },
  resultRules: {
    title: <FormattedMessage {...messages.resultRules} />,
    href: routes.results.passMarks,
    icon: 'resultRules',
  },
} satisfies Record<string, ModuleConfig>;

export type ModuleKey = keyof typeof MODULE_REGISTRY;
