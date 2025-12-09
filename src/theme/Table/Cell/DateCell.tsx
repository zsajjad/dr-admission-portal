import { format } from 'date-fns';

import { dateTime, monthDate } from '@/constants/configs';

export interface DateCellProps {
  date: string | Date;
  includeTime?: boolean;
}

export function DateCell({ date, includeTime = false }: DateCellProps) {
  if (!date) return '--';

  const formattedDate = format(date, includeTime ? dateTime : monthDate);
  return <div>{formattedDate}</div>;
}
