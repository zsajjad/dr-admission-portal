import { useMemo } from 'react';

import { usePermissions } from '@/hooks/usePermissions';

import type { ModuleKey } from './module-registry';
import { MODULE_REGISTRY } from './module-registry';
import type { NavItemConfig } from './types';

const NAV_ORDER: ModuleKey[] = [
  'home',
  'adminUsers',
  'branches',
  'van',
  'admission',
  'students',
  'staffUsers',
  'sections',
  'syncReview',
  'questionSets',
  'printing',
  'interactionReport',
];

const toNavItem = (moduleKey: ModuleKey): NavItemConfig => {
  const entry: {
    title: NavItemConfig['title'];
    href: string;
    icon: string;
    permissions?: NavItemConfig['permissions'];
  } = MODULE_REGISTRY[moduleKey];
  const { title, href, icon, permissions } = entry;
  return { key: moduleKey, title, href, icon, permissions };
};

export const navItems: NavItemConfig[] = NAV_ORDER.map(toNavItem);

/** The nav items the signed-in admin may open (items with permissions are hidden without one of them) */
export function useNavItems(): NavItemConfig[] {
  const { has } = usePermissions();
  return useMemo(() => navItems.filter((item) => !item.permissions || has(...item.permissions)), [has]);
}
