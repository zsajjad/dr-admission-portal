'use client';

import { useMemo } from 'react';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import {
  Alert,
  Box,
  Card,
  CardContent,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from '@mui/material';

import { useAdmissionsControllerGetDashboard } from '@/providers/service/admissions/admissions';
import {
  AdmissionsDashboardAreaStat,
  AdmissionsDashboardGenderStat,
  AdmissionsDashboardGroupStat,
  AdmissionsDashboardStatusStat,
  AdmissionsDashboardTrendPoint,
} from '@/providers/service/app.schemas';
import { useBranchControllerFindAll } from '@/providers/service/branch/branch';
import { useSessionControllerFindAll } from '@/providers/service/session/session';

import FormattedMessage, { useFormattedMessage } from '@/theme/FormattedMessage';

import { extractNetworkError } from '@/utils/extractNetworkError';

import messages from './messages';

interface StatCardProps {
  title: React.ReactNode;
  value: number | string;
  subtitle?: string;
  color?: string;
}

function StatCard({ title, value, subtitle, color }: StatCardProps) {
  const theme = useTheme();
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h4" component="div" fontWeight="bold" sx={{ color: color || theme.palette.primary.main }}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

interface ChartCardProps {
  title: React.ReactNode;
  children: React.ReactNode;
  minHeight?: number;
}

function ChartCard({ title, children, minHeight = 300 }: ChartCardProps) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Box sx={{ minHeight, width: '100%' }}>{children}</Box>
      </CardContent>
    </Card>
  );
}

export interface AdmissionDashboardProps {
  branchId?: string;
  sessionId?: string;
  onBranchChange?: (branchId: string) => void;
  onSessionChange?: (sessionId: string) => void;
}

export function AdmissionDashboard({ branchId, sessionId, onBranchChange, onSessionChange }: AdmissionDashboardProps) {
  const theme = useTheme();

  // Fetch branches and sessions for dropdowns
  const { data: branchesData } = useBranchControllerFindAll({ take: 100 });
  const { data: sessionsData } = useSessionControllerFindAll({ take: 100 });

  // Translated messages for dropdowns
  const allBranchesLabel = useFormattedMessage(messages.allBranches);
  const allSessionsLabel = useFormattedMessage(messages.allSessions);
  const branchLabel = useFormattedMessage(messages.filterByBranch);
  const sessionLabel = useFormattedMessage(messages.filterBySession);

  const {
    data: dashboardData,
    isLoading,
    isError,
    error,
  } = useAdmissionsControllerGetDashboard({
    days: 30,
    branchId: branchId || undefined,
    sessionId: sessionId || undefined,
  });

  const handleBranchChange = (event: SelectChangeEvent<string>) => {
    onBranchChange?.(event.target.value);
  };

  const handleSessionChange = (event: SelectChangeEvent<string>) => {
    onSessionChange?.(event.target.value);
  };

  const statusColors: Record<string, string> = useMemo(
    () => ({
      UNVERIFIED: theme.palette.warning.main,
      VERIFIED: theme.palette.success.main,
      REJECTED: theme.palette.error.main,
      DUPLICATE_MERGED: theme.palette.grey[500],
    }),
    [theme],
  );

  const genderColors: Record<string, string> = useMemo(
    () => ({
      MALE: theme.palette.info.main,
      FEMALE: theme.palette.secondary.main,
    }),
    [theme],
  );

  const statusChartData = useMemo(() => {
    if (!dashboardData?.data?.statusStats) return [];
    return dashboardData.data.statusStats.map((stat: AdmissionsDashboardStatusStat) => ({
      name: stat.status,
      value: stat.count,
      color: statusColors[stat.status] || theme.palette.grey[500],
    }));
  }, [dashboardData, statusColors, theme]);

  const genderChartData = useMemo(() => {
    if (!dashboardData?.data?.genderStats) return [];
    return dashboardData.data.genderStats.map((stat: AdmissionsDashboardGenderStat) => ({
      name: stat.gender,
      value: stat.count,
      color: genderColors[stat.gender] || theme.palette.grey[500],
    }));
  }, [dashboardData, genderColors, theme]);

  const trendChartData = useMemo(() => {
    if (!dashboardData?.data?.recentTrend) return [];
    return dashboardData.data.recentTrend.map((point: AdmissionsDashboardTrendPoint) => ({
      date: new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      admissions: point.admissionsCreated,
      interactions: point.interactionsSubmitted,
    }));
  }, [dashboardData]);

  const groupChartData = useMemo(() => {
    if (!dashboardData?.data?.groupStats) return [];
    return dashboardData.data.groupStats.map((stat: AdmissionsDashboardGroupStat) => ({
      name: stat.group,
      male: stat.maleCount,
      female: stat.femaleCount,
      total: stat.totalStudents,
    }));
  }, [dashboardData]);

  const areaTableData = useMemo(() => {
    if (!dashboardData?.data?.areaStats) return [];
    return dashboardData.data.areaStats.slice(0, 10) as AdmissionsDashboardAreaStat[];
  }, [dashboardData]);

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {[...Array(4)].map((_, i) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
              <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 1 }} />
            </Grid>
          ))}
          {[...Array(4)].map((_, i) => (
            <Grid size={{ xs: 12, md: 6 }} key={i + 4}>
              <Skeleton variant="rectangular" height={350} sx={{ borderRadius: 1 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  if (isError) {
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        {extractNetworkError(error)}
      </Alert>
    );
  }

  const { funnel, rates } = dashboardData?.data || {};

  return (
    <Box>
      {/* Filter Dropdowns */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel id="branch-filter-label">{branchLabel}</InputLabel>
          <Select
            labelId="branch-filter-label"
            id="branch-filter"
            value={branchId || ''}
            label={branchLabel}
            onChange={handleBranchChange}
          >
            <MenuItem value="">{allBranchesLabel}</MenuItem>
            {branchesData?.data?.map((branch) => (
              <MenuItem key={branch.id} value={branch.id}>
                {branch.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel id="session-filter-label">{sessionLabel}</InputLabel>
          <Select
            labelId="session-filter-label"
            id="session-filter"
            value={sessionId || ''}
            label={sessionLabel}
            onChange={handleSessionChange}
          >
            <MenuItem value="">{allSessionsLabel}</MenuItem>
            {sessionsData?.data?.map((session) => (
              <MenuItem key={session.id} value={session.id}>
                {session.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title={<FormattedMessage {...messages.totalAdmissions} />}
            value={funnel?.totalAdmissions || 0}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title={<FormattedMessage {...messages.feePaid} />}
            value={funnel?.feePaid || 0}
            subtitle={`${rates?.feePaidRate?.toFixed(1) || 0}%`}
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title={<FormattedMessage {...messages.finalized} />}
            value={funnel?.finalized || 0}
            subtitle={`${rates?.finalizedRate?.toFixed(1) || 0}%`}
            color={theme.palette.info.main}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title={<FormattedMessage {...messages.interactionSubmitted} />}
            value={funnel?.interactionSubmitted || 0}
            subtitle={`${rates?.interactionSubmittedRate?.toFixed(1) || 0}%`}
            color={theme.palette.secondary.main}
          />
        </Grid>
      </Grid>

      {/* Charts Row 1 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Status Distribution */}
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <ChartCard title={<FormattedMessage {...messages.statusDistribution} />} minHeight={250}>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

        {/* Gender Distribution */}
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <ChartCard title={<FormattedMessage {...messages.genderDistribution} />} minHeight={250}>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={genderChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                >
                  {genderChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

        {/* Group Stats */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <ChartCard title={<FormattedMessage {...messages.groupStats} />} minHeight={250}>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={groupChartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={80} />
                <Tooltip />
                <Legend />
                <Bar dataKey="male" name="Male" fill={genderColors.MALE} stackId="a" />
                <Bar dataKey="female" name="Female" fill={genderColors.FEMALE} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
      </Grid>

      {/* Charts Row 2 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Admission Trend */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <ChartCard title={<FormattedMessage {...messages.admissionTrend} values={{ days: '30' }} />} minHeight={300}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} interval="preserveStartEnd" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="admissions"
                  name="Admissions"
                  stroke={theme.palette.primary.main}
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="interactions"
                  name="Interactions"
                  stroke={theme.palette.secondary.main}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

        {/* Funnel Metrics */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <ChartCard title={<FormattedMessage {...messages.funnelMetrics} />} minHeight={300}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  { name: 'Unverified', value: funnel?.unverified || 0 },
                  { name: 'Verified', value: funnel?.verified || 0 },
                  { name: 'Fee Paid', value: funnel?.feePaid || 0 },
                  { name: 'Finalized', value: funnel?.finalized || 0 },
                ]}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill={theme.palette.primary.main}>
                  {[
                    { name: 'Unverified', color: statusColors.UNVERIFIED },
                    { name: 'Verified', color: statusColors.VERIFIED },
                    { name: 'Fee Paid', color: theme.palette.success.main },
                    { name: 'Finalized', color: theme.palette.info.main },
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
      </Grid>

      {/* Area Comparison Table */}
      {areaTableData.length > 0 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <FormattedMessage {...messages.areaComparison} />
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>
                          <FormattedMessage {...messages.areaName} />
                        </TableCell>
                        <TableCell align="right">
                          <FormattedMessage {...messages.thisYear} />
                        </TableCell>
                        <TableCell align="right">
                          <FormattedMessage {...messages.lastYear} />
                        </TableCell>
                        <TableCell align="right">
                          <FormattedMessage {...messages.change} />
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {areaTableData.map((area) => {
                        const change = area.lastYear > 0 ? ((area.thisYear - area.lastYear) / area.lastYear) * 100 : 0;
                        return (
                          <TableRow key={area.id}>
                            <TableCell>{area.name}</TableCell>
                            <TableCell align="right">{area.thisYear}</TableCell>
                            <TableCell align="right">{area.lastYear}</TableCell>
                            <TableCell
                              align="right"
                              sx={{
                                color:
                                  change > 0
                                    ? theme.palette.success.main
                                    : change < 0
                                      ? theme.palette.error.main
                                      : theme.palette.text.secondary,
                              }}
                            >
                              {change > 0 ? '+' : ''}
                              {change.toFixed(1)}%
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
