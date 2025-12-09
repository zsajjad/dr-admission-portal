'use client';

import type { JSX } from 'react';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider as Provider } from '@mui/x-date-pickers/LocalizationProvider';

export interface DatePickerProviderProps {
  children: React.ReactNode;
}

export function DatePickerProvider({ children }: DatePickerProviderProps): JSX.Element {
  return <Provider dateAdapter={AdapterDayjs}>{children}</Provider>;
}
