'use client';

import { Tabs, Tab, Box } from '@mui/material';

export interface TabOption<T extends string | number = string> {
  value: T;
  label: string;
}

interface TabsComponentProps<T extends string | number = string> {
  value: T;
  onChange: (value: T) => void;
  options: TabOption<T>[];
  isLoading?: boolean;
}

export function TabsComponent<T extends string | number>({
  value,
  onChange,
  options,
  isLoading,
}: TabsComponentProps<T>) {
  return (
    <Box sx={{ mb: 2 }}>
      <Tabs
        value={value}
        onChange={(_, newValue) => onChange(newValue)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          '& .MuiTabs-indicator': {
            display: 'none',
          },
        }}
      >
        {options.map((option) => (
          <Tab key={option.value} value={option.value} label={option.label} disabled={isLoading} />
        ))}
      </Tabs>
    </Box>
  );
}
