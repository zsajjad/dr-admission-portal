'use client';

import { useCallback, useMemo } from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import BadgeIcon from '@mui/icons-material/Badge';
import EventSeatIcon from '@mui/icons-material/EventSeat';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import QueueIcon from '@mui/icons-material/Queue';
import TableChartIcon from '@mui/icons-material/TableChart';
import { Box, Tab, Tabs } from '@mui/material';

import { useFormattedMessage } from '@/theme/FormattedMessage';

import componentMessages from '../components/messages';

import { AttendanceSheetsTab, CardRequestsTab, IdCardsTab, SittingSlipsTab, VerificationSlipsTab } from './tabs';

const TAB_KEYS = ['id-cards', 'sitting-slips', 'attendance-sheets', 'verification-slips', 'card-requests'] as const;
type TabKey = (typeof TAB_KEYS)[number];

type TabLabelKey = 'idCards' | 'sittingSlips' | 'attendanceSheets' | 'verificationSlips' | 'cardRequests';

interface TabConfig {
  key: TabKey;
  icon: React.ReactElement;
  labelKey: TabLabelKey;
}

const TABS: TabConfig[] = [
  { key: 'id-cards', icon: <BadgeIcon fontSize="small" />, labelKey: 'idCards' },
  { key: 'sitting-slips', icon: <EventSeatIcon fontSize="small" />, labelKey: 'sittingSlips' },
  { key: 'attendance-sheets', icon: <TableChartIcon fontSize="small" />, labelKey: 'attendanceSheets' },
  { key: 'verification-slips', icon: <FactCheckIcon fontSize="small" />, labelKey: 'verificationSlips' },
  { key: 'card-requests', icon: <QueueIcon fontSize="small" />, labelKey: 'cardRequests' },
];

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
    <Box sx={{ width: '100%' }}>
      {/* The same underline tabs as the rest of the portal (theme/Components/tab.tsx) */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={currentTab}
          onChange={(_, value: TabKey) => handleTabChange(value)}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="printing tabs"
        >
          {TABS.map((tab) => (
            <Tab
              key={tab.key}
              value={tab.key}
              id={`printing-tab-${tab.key}`}
              aria-controls={`printing-tabpanel-${tab.key}`}
              icon={tab.icon}
              iconPosition="start"
              label={formattedMessages[tab.labelKey]}
            />
          ))}
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <Box
        sx={{
          mt: 2,
          p: 3,
          bgcolor: 'background.paper',
          borderRadius: 4,
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
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
