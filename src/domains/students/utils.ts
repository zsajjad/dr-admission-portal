import { differenceInYears, format } from 'date-fns';

import {
  AdmissionStatus,
  AnnouncementRecipientStatus,
  CardPrintRequestStatus,
  StudentProfileVanEligibility,
} from '@/providers/service/app.schemas';

import messages from './messages';

type ChipColor = 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';

/** Keeps dates left-to-right inside Urdu (RTL) text */
const ltr = (text: string) => `\u2066${text}\u2069`;

export function formatDate(value?: string | Date | null): string {
  if (!value) return '--';
  return ltr(format(new Date(value), 'd MMM yyyy'));
}

export function formatDateTime(value?: string | Date | null): string {
  if (!value) return '--';
  return ltr(format(new Date(value), 'd MMM yyyy, h:mm a'));
}

/** Birth dates are stored at midnight UTC; show them as that calendar date. */
export function formatBirthDate(value?: string | null): string {
  if (!value) return '--';
  return ltr(value.slice(0, 10).split('-').reverse().join('/'));
}

export function ageInYears(dateOfBirth?: string | null): number | undefined {
  if (!dateOfBirth) return undefined;
  return differenceInYears(new Date(), new Date(dateOfBirth));
}

export function admissionStatusColor(status?: AdmissionStatus): ChipColor {
  switch (status) {
    case AdmissionStatus.VERIFIED:
    case AdmissionStatus.CONFIRMED:
      return 'success';
    case AdmissionStatus.REJECTED:
      return 'error';
    case AdmissionStatus.MANUAL_VERIFICATION_REQUIRED:
    case AdmissionStatus.DUPLICATE_MERGED:
      return 'warning';
    default:
      return 'default';
  }
}

export const admissionStatusMessage = (status: AdmissionStatus) => messages[`status${status}`];

export function cardStatusColor(status: CardPrintRequestStatus): ChipColor {
  if (status === CardPrintRequestStatus.COMPLETED) return 'success';
  if (status === CardPrintRequestStatus.CANCELLED) return 'default';
  return 'warning';
}

export const cardStatusMessage = (status: CardPrintRequestStatus) => messages[`card${status}`];

export function messageStatusColor(status: AnnouncementRecipientStatus): ChipColor {
  switch (status) {
    case AnnouncementRecipientStatus.READ:
      return 'success';
    case AnnouncementRecipientStatus.DELIVERED:
    case AnnouncementRecipientStatus.SENT:
      return 'info';
    case AnnouncementRecipientStatus.FAILED:
      return 'error';
    default:
      return 'default';
  }
}

export const messageStatusMessage = (status: AnnouncementRecipientStatus) => messages[`msg${status}`];

export const vanEligibilityMessage = (eligibility: StudentProfileVanEligibility) => {
  switch (eligibility) {
    case StudentProfileVanEligibility.TIFLAN:
      return messages.vanTiflan;
    case StudentProfileVanEligibility.NO_VAN_IN_AREA:
      return messages.vanNoVanInArea;
    case StudentProfileVanEligibility.NO_BOYS_VAN:
      return messages.vanNoBoysVan;
    default:
      return messages.vanNotAssigned;
  }
};

/** Black or white text for a coloured chip */
export function contrastText(hex: string): string {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return '#000';
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 150 ? '#000' : '#fff';
}

export const GR_NUMBER_PATTERN = /^9221-[01]-\d{1,4}-\d{6,}$/;
export const PHONE_PATTERN = /^\+?[0-9][0-9 -]{6,19}$/;

export const cardStyle = {
  borderRadius: 3,
  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
};
