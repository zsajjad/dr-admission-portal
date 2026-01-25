'use client';

import { useCallback, useMemo } from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import BadgeIcon from '@mui/icons-material/Badge';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import QueueIcon from '@mui/icons-material/Queue';
import TableChartIcon from '@mui/icons-material/TableChart';
import { Box, Stack, Typography } from '@mui/material';

import { useFormattedMessage } from '@/theme/FormattedMessage';

import componentMessages from '../components/messages';

import { AttendanceSheetsTab, CardRequestsTab, IdCardsTab, SittingSlipsTab, VerificationSlipsTab } from './tabs';

const TAB_KEYS = ['id-cards', 'sitting-slips', 'attendance-sheets', 'verification-slips', 'card-requests'] as const;
type TabKey = (typeof TAB_KEYS)[number];

type TabLabelKey = 'idCards' | 'sittingSlips' | 'attendanceSheets' | 'verificationSlips' | 'cardRequests';

interface TabConfig {
  key: TabKey;
  icon: React.ReactNode;
  labelKey: TabLabelKey;
}

const TABS: TabConfig[] = [
  { key: 'id-cards', icon: <BadgeIcon fontSize="small" />, labelKey: 'idCards' },
  { key: 'sitting-slips', icon: <EventSeatIcon fontSize="small" />, labelKey: 'sittingSlips' },
  { key: 'attendance-sheets', icon: <TableChartIcon fontSize="small" />, labelKey: 'attendanceSheets' },
  { key: 'verification-slips', icon: <FactCheckIcon fontSize="small" />, labelKey: 'verificationSlips' },
  { key: 'card-requests', icon: <QueueIcon fontSize="small" />, labelKey: 'cardRequests' },
];

interface PillTabProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function PillTab({ icon, label, isActive, onClick }: PillTabProps) {
  return (
    <Box
      onClick={onClick}
      role="tab"
      aria-selected={isActive}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 3,
        py: 1.5,
        borderRadius: '999px',
        cursor: 'pointer',
        transition: 'all 0.2s ease-in-out',
        userSelect: 'none',
        whiteSpace: 'nowrap',
        ...(isActive
          ? {
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
              transform: 'translateY(-1px)',
              '& .MuiSvgIcon-root': {
                color: 'inherit',
              },
            }
          : {
              bgcolor: 'action.hover',
              color: 'text.secondary',
              '&:hover': {
                bgcolor: 'action.selected',
                color: 'text.primary',
              },
            }),
      }}
    >
      {icon}
      <Typography
        variant="body2"
        sx={{
          fontWeight: isActive ? 600 : 500,
          fontSize: '0.9rem',
          letterSpacing: '0.01em',
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}

interface TabPanelProps {
  children?: React.ReactNode;
  tabKey: TabKey;
  value: TabKey;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, tabKey, ...other } = props;

  if (value !== tabKey) return null;

  return (
    <div role="tabpanel" id={`printing-tabpanel-${tabKey}`} aria-labelledby={`printing-tab-${tabKey}`} {...other}>
      {children}
    </div>
  );
}

export function PrintingView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get tab from URL or default to first tab
  const currentTab = useMemo(() => {
    const tabParam = searchParams.get('tab') as TabKey | null;
    return tabParam && TAB_KEYS.includes(tabParam) ? tabParam : TAB_KEYS[0];
  }, [searchParams]);

  const formattedMessages = {
    idCards: useFormattedMessage(componentMessages.idCards),
    sittingSlips: useFormattedMessage(componentMessages.sittingSlips),
    attendanceSheets: useFormattedMessage(componentMessages.attendanceSheets),
    verificationSlips: useFormattedMessage(componentMessages.verificationSlips),
    cardRequests: useFormattedMessage(componentMessages.cardRequests),
  };

  const handleTabChange = useCallback(
    (newValue: TabKey) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('tab', newValue);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  return (
    <Box sx={{ width: '100%', py: 1 }}>
      {/* Pill Tabs */}
      <Stack
        direction="row"
        spacing={1.5}
        sx={{
          p: 2,
          bgcolor: 'background.paper',
          borderRadius: 4,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)',
          overflowX: 'auto',
          '&::-webkit-scrollbar': {
            height: 6,
          },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: 'action.disabled',
            borderRadius: 3,
          },
        }}
        role="tablist"
        aria-label="printing tabs"
      >
        {TABS.map((tab) => (
          <PillTab
            key={tab.key}
            icon={tab.icon}
            label={formattedMessages[tab.labelKey]}
            isActive={currentTab === tab.key}
            onClick={() => handleTabChange(tab.key)}
          />
        ))}
      </Stack>

      {/* Tab Panels */}
      <Box
        sx={{
          mt: 3,
          p: 4,
          bgcolor: 'background.paper',
          borderRadius: 4,
          boxShadow: '0 4px 24px rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.04)',
          minHeight: 450,
        }}
      >
        <TabPanel value={currentTab} tabKey="id-cards">
          <IdCardsTab />
        </TabPanel>
        <TabPanel value={currentTab} tabKey="sitting-slips">
          <SittingSlipsTab />
        </TabPanel>
        <TabPanel value={currentTab} tabKey="attendance-sheets">
          <AttendanceSheetsTab />
        </TabPanel>
        <TabPanel value={currentTab} tabKey="verification-slips">
          <VerificationSlipsTab />
        </TabPanel>
        <TabPanel value={currentTab} tabKey="card-requests">
          <CardRequestsTab />
        </TabPanel>
      </Box>
    </Box>
  );
}
