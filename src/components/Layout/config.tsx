import type { ModuleKey } from './module-registry';
import { MODULE_REGISTRY } from './module-registry';
import type { NavItemConfig } from './types';

const NAV_ORDER: ModuleKey[] = [
  'home',
  'adminUsers',
  'branches',
  'van',
  'admission',
  'questionSets',
  'printing',
  'interactionReport',
  'planningChat',
];

const toNavItem = (moduleKey: ModuleKey): NavItemConfig => {
  const entry = MODULE_REGISTRY[moduleKey];
  const { title, href, icon } = entry;
  const permission = 'permission' in entry ? entry.permission : undefined;
  return { key: moduleKey, title, href, icon, permission };
};

export const navItems: NavItemConfig[] = NAV_ORDER.map(toNavItem);
