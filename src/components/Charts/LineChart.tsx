'use client';

import React from 'react';

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart as ReLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Box } from '@mui/material';

type LineChartProps = {
  data: { [key: string]: string | number }[];
  xKey: string;
  lineKeys: string[];
  height?: number;
  width?: number | string;
  colors?: string[];
  showGrid?: boolean;
  showLegend?: boolean;
  curved?: boolean;
};

export const LineChart: React.FC<LineChartProps> = ({
  data,
  xKey,
  lineKeys,
  height = 400,
  width = '100%',
  colors = ['#620E00', '#03A9F4', '#4CAF50', '#FF9800'],
  showGrid = true,
  showLegend = true,
  curved = true,
}) => {
  return (
    <Box width={width} height={height}>
      <ResponsiveContainer width="100%" height="100%">
        <ReLineChart data={data} margin={{ left: 10, bottom: 15, right: 20 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />}
          <XAxis dataKey={xKey} tickLine={false} axisLine={false} dy={15} fontSize={14} stroke="#78828A" />
          <YAxis axisLine={false} tickLine={false} dy={-2} dx={-10} fontSize={14} stroke="#78828A" />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          />
          {showLegend && <Legend verticalAlign="top" height={36} />}
          {lineKeys.map((key, index) => (
            <Line
              key={key}
              type={curved ? 'monotone' : 'linear'}
              dataKey={key}
              stroke={colors[index % colors.length]}
              strokeWidth={2}
              dot={{ fill: colors[index % colors.length], strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          ))}
        </ReLineChart>
      </ResponsiveContainer>
    </Box>
  );
};
