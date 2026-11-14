import { ReactNode } from 'react';

import { Permission } from '@/providers/service/app.schemas';

import { navIcons } from './NavIcons';

export interface NavItemConfig {
  key: string;
  title?: string | ReactNode;
  disabled?: boolean;
  external?: boolean;
  label?: string;
  icon?: keyof typeof navIcons;
  href: string;
  /** Shown only to admins with this permission (the API enforces it too). */
  permission?: Permission;
  items?: NavItemConfig[];
  // Matcher cannot be a function in order
  // to be able to use it on the server.
  // If you need to match multiple paths,
  // can extend it to accept multiple matchers.
  matcher?: { type: 'startsWith' | 'equals'; href: string };
}
