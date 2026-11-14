import { useMemo } from 'react';

import { usePermissions } from '@/hooks/usePermissions';

import type { ModuleKey } from './module-registry';
import { MODULE_REGISTRY } from './module-registry';
import type { NavItemConfig } from './types';

const NAV_ORDER: ModuleKey[] = [
  'home',
  'adminUsers',
  'adminPermissions',
  'branches',
  'van',
  'admission',
  'students',
  'studentMerge',
  'staffUsers',
  'sections',
  'syncReview',
  'results',
  'auditLog',
  'questionSets',
  'printing',
  'interactionReport',
  'trainings',
  'resultRules',
];

const toNavItem = (moduleKey: ModuleKey): NavItemConfig => {
  const entry: {
    title: NavItemConfig['title'];
    href: string;
    icon: string;
    permissions?: NavItemConfig['permissions'];
    superAdminOnly?: boolean;
  } = MODULE_REGISTRY[moduleKey];
  const { title, href, icon, permissions, superAdminOnly } = entry;
  return { key: moduleKey, title, href, icon, permissions, superAdminOnly };
};

export const navItems: NavItemConfig[] = NAV_ORDER.map(toNavItem);

/** The nav items the signed-in admin may open (items with permissions are hidden without one of them) */
export function useNavItems(): NavItemConfig[] {
  const { has, isSuperAdmin } = usePermissions();
  return useMemo(
    () =>
      navItems.filter(
        (item) => (!item.permissions || has(...item.permissions)) && (!item.superAdminOnly || isSuperAdmin),
      ),
    [has, isSuperAdmin],
  );
}
