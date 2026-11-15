import { useMemo } from 'react';

import { usePermissions } from '@/hooks/usePermissions';

import type { ModuleKey } from './module-registry';
import { MODULE_REGISTRY } from './module-registry';
import navMessages from './NavItems/messages';
import type { NavItemConfig } from './types';

/** A heading's message (from defineMessages). */
interface NavHeading {
  id: string;
  defaultMessage: string;
}

interface NavGroupConfig {
  key: string;
  /** The group's heading; the first group has none. */
  heading?: NavHeading;
  items: ModuleKey[];
}

/** The side nav, in groups, in the order an admin meets them in a season. */
const NAV_GROUPS: NavGroupConfig[] = [
  { key: 'general', items: ['home', 'planningChat'] },
  {
    key: 'admissions',
    heading: navMessages.admissions,
    items: ['admission', 'students', 'studentMerge', 'printing', 'interactionReport'],
  },
  {
    key: 'session',
    heading: navMessages.session,
    items: ['sections', 'questionSets', 'results', 'resultRules', 'trainings', 'syncReview'],
  },
  { key: 'staff', heading: navMessages.staff, items: ['staffUsers', 'adminUsers', 'adminPermissions'] },
  { key: 'setup', heading: navMessages.setup, items: ['branches', 'van', 'schools', 'auditLog'] },
];

const toNavItem = (moduleKey: ModuleKey): NavItemConfig => {
  const entry: {
    title: NavItemConfig['title'];
    href: string;
    icon: string;
    permissions?: NavItemConfig['permissions'];
    superAdminOnly?: boolean;
    adminOnly?: boolean;
  } = MODULE_REGISTRY[moduleKey];
  const { title, href, icon, permissions, superAdminOnly, adminOnly } = entry;
  return { key: moduleKey, title, href, icon, permissions, superAdminOnly, adminOnly };
};

/** Every nav item, flat, in the side nav's order (e.g. to find the current page's title). */
export const navItems: NavItemConfig[] = NAV_GROUPS.flatMap((group) => group.items).map(toNavItem);

export interface NavGroup {
  key: string;
  heading?: NavHeading;
  items: NavItemConfig[];
}

/**
 * The nav groups with the items the signed-in admin may open (items with permissions are hidden
 * without one of them). Groups left empty are dropped.
 */
export function useNavGroups(): NavGroup[] {
  const { has, isSuperAdmin, isAdmin } = usePermissions();
  return useMemo(
    () =>
      NAV_GROUPS.map((group) => ({
        key: group.key,
        heading: group.heading,
        items: group.items
          .map(toNavItem)
          .filter(
            (item) =>
              (!item.permissions || has(...item.permissions)) &&
              (!item.superAdminOnly || isSuperAdmin) &&
              (!item.adminOnly || isAdmin),
          ),
      })).filter((group) => group.items.length > 0),
    [has, isSuperAdmin, isAdmin],
  );
}
