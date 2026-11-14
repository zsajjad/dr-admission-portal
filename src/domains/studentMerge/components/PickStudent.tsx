'use client';

import { useEffect, useState } from 'react';

import { useIntl } from 'react-intl';

import { Autocomplete, CircularProgress, TextField, Typography } from '@mui/material';

import { StudentListItem } from '@/providers/service/app.schemas';
import { studentsControllerFindAll } from '@/providers/service/students/students';

import messages from '../messages';

interface PickStudentProps {
  label: string;
  onPick: (student: StudentListItem) => void;
}

/** Search students by GR (old GRs too), name or phone, and pick one. */
export function PickStudent({ label, onPick }: PickStudentProps) {
  const intl = useIntl();
  const [input, setInput] = useState('');
  const [options, setOptions] = useState<StudentListItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = input.trim();
    if (q.length < 3) {
      setOptions([]);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await studentsControllerFindAll({ search: q, take: 10 }, controller.signal);
        setOptions(res.data);
      } catch {
        // a newer search replaced this one, or it failed; keep the old options
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [input]);

  return (
    <Autocomplete<StudentListItem, false>
      size="small"
      fullWidth
      options={options}
      filterOptions={(x) => x}
      loading={loading}
      inputValue={input}
      onInputChange={(_, v) => setInput(v)}
      onChange={(_, v) => v && onPick(v)}
      getOptionLabel={(o) => `${o.grNumber} · ${o.name}`}
      isOptionEqualToValue={(a, b) => a.id === b.id}
      noOptionsText={intl.formatMessage(messages.searchHint)}
      renderOption={(props, o) => (
        <li {...props} key={o.id}>
          <div>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {o.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {o.grNumber} · {o.fatherName}
            </Typography>
          </div>
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={intl.formatMessage(messages.search)}
          slotProps={{
            input: {
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? <CircularProgress size={16} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            },
          }}
        />
      )}
    />
  );
}
