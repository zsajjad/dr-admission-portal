'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

import { endOfDay, startOfDay } from 'date-fns';
import { DateRange, DayPicker } from 'react-day-picker';

import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import { Button, Typography } from '@mui/material';

import 'react-day-picker/style.css';

import { colorSchemes } from '@/theme/color-schemes';
import { FormattedMessage } from '@/theme/FormattedMessage';

import { formattedDate } from '@/utils';

import messages from './messages';
import * as Styled from './Styled';

type Props = {
  value?: { startDate?: string; endDate?: string };
  onChange: (range: { startDate?: string; endDate?: string }) => void;
};

export function DateRangePicker({ value, onChange }: Props) {
  const [selected, setSelected] = useState<DateRange>({
    from: value?.startDate ? new Date(value.startDate) : undefined,
    to: value?.endDate ? new Date(value.endDate) : undefined,
  });
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  const { light } = colorSchemes;
  const { palette } = light;

  const handleDateChange = useCallback((date?: DateRange) => {
    setSelected(date || { from: undefined, to: undefined });
  }, []);

  // Sync with parent value
  useEffect(() => {
    setSelected({
      from: value?.startDate ? new Date(value.startDate) : undefined,
      to: value?.endDate ? new Date(value.endDate) : undefined,
    });
  }, [value?.startDate, value?.endDate]);

  // Outside click to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current?.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div>
      <Styled.DateInputWrapper onClick={() => setShowCalendar(true)}>
        <Styled.LabelChip>
          <Typography color="textPrimary" variant="body2">
            <FormattedMessage {...messages.date} />
          </Typography>
        </Styled.LabelChip>
        <Styled.ValueWrapper variant="body2" color="common.black">
          {selected.from ? formattedDate(selected.from.toString()) : <FormattedMessage {...messages.format} />}
          <Typography component={'span'}>-</Typography>
          {selected.to ? formattedDate(selected.to.toString()) : <FormattedMessage {...messages.format} />}
        </Styled.ValueWrapper>
        <CalendarMonthOutlinedIcon fontSize="medium" sx={{ color: palette.common.black }} />
        {showCalendar ? (
          <Styled.CalendarWrapper ref={calendarRef}>
            <DayPicker
              selected={selected}
              onSelect={handleDateChange}
              defaultMonth={selected.from}
              animate
              mode="range"
              disabled={{ after: new Date() }}
            />
            <Styled.Footer>
              <Button
                onClick={() => {
                  setSelected({ from: undefined, to: undefined });
                  onChange({ startDate: undefined, endDate: undefined });
                }}
              >
                <Typography textTransform="capitalize" variant="body2" color="grey.900">
                  <FormattedMessage {...messages.clear} />
                </Typography>
              </Button>
              <Styled.RightButton>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCalendar(false);
                  }}
                >
                  <Typography textTransform="capitalize" variant="body2" color="grey.900">
                    <FormattedMessage {...messages.cancel} />
                  </Typography>
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (selected.from && selected.to) {
                      onChange({
                        startDate: startOfDay(selected.from).toISOString(),
                        endDate: endOfDay(selected.to).toISOString(),
                      });
                    }
                    setShowCalendar(false);
                  }}
                >
                  <Typography textTransform="capitalize" variant="body2" color="grey.900">
                    <FormattedMessage {...messages.ok} />
                  </Typography>
                </Button>
              </Styled.RightButton>
            </Styled.Footer>
          </Styled.CalendarWrapper>
        ) : null}
      </Styled.DateInputWrapper>
    </div>
  );
}
