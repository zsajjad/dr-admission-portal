import { StaffDeviceEntity, StaffLoginCodeStatus, StaffRole } from '@/providers/service/app.schemas';

import messages from './messages';

export const STAFF_ROLES: StaffRole[] = [StaffRole.TEACHER, StaffRole.TRAINER, StaffRole.TESTER, StaffRole.FEE_DESK];

export const roleMessage = (role: StaffRole) => messages[`role${role}`];
export const roleHintMessage = (role: StaffRole) => messages[`role${role}Hint`];
export const codeStatusMessage = (status: StaffLoginCodeStatus) => messages[`code${status}`];

export const codeStatusColor = (status: StaffLoginCodeStatus): 'default' | 'success' | 'info' | 'warning' | 'error' => {
  switch (status) {
    case StaffLoginCodeStatus.OPEN:
      return 'info';
    case StaffLoginCodeStatus.USED:
      return 'success';
    case StaffLoginCodeStatus.LOCKED:
      return 'error';
    case StaffLoginCodeStatus.EXPIRED:
      return 'warning';
    default:
      return 'default';
  }
};

export type DeviceState = 'loggedIn' | 'draining' | 'loggedOut' | 'discarded';

/** Where a phone stands: logged in, logged out but still sending unsent work, logged out, or wiped */
export function deviceState(device: StaffDeviceEntity, now = Date.now()): DeviceState {
  if (!device.revokedAt) return 'loggedIn';
  if (device.discardUnsent) return 'discarded';
  if (device.drainUntil && new Date(device.drainUntil).getTime() > now) return 'draining';
  return 'loggedOut';
}

/** Split a 6-digit code in two, so it's easier to read out: 042 917 */
export const formatLoginCode = (code: string) => (code.length === 6 ? `${code.slice(0, 3)} ${code.slice(3)}` : code);

export const STAFF_PHONE_PATTERN = /^\+?[0-9 -]{7,20}$/;

/** Keep a date or number left-to-right inside an Urdu sentence (Unicode isolates) */
export const ltr = (text: string) => `\u2066${text}\u2069`;
