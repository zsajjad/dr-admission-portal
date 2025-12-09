import type { ModuleKey } from './module-registry';
import { MODULE_REGISTRY } from './module-registry';
import type { NavItemConfig } from './types';

const NAV_ORDER: ModuleKey[] = ['home', 'adminUsers', 'branches', 'admission', 'questionSets'];

const toNavItem = (moduleKey: ModuleKey): NavItemConfig => {
  const { title, href, icon } = MODULE_REGISTRY[moduleKey];
  return { key: moduleKey, title, href, icon };
};

export const navItems: NavItemConfig[] = NAV_ORDER.map(toNavItem);
