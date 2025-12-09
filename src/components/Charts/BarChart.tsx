'use client';

import React from 'react';

import { Bar, CartesianGrid, BarChart as ReBarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { Box } from '@mui/material';

type BarChartProps = {
  data: { [key: string]: string | number }[];
  xKey: string;
  barKeys: string[]; // multiple series
  height?: number;
  width?: number | string;
  colors?: string[];
  showGrid?: boolean;
  axisFontSize?: number;
  axisFontColor?: string;
};

export const BarChart: React.FC<BarChartProps> = ({
  data,
  xKey,
  barKeys,
  height = 400,
  width = '100%',
  colors = ['#6366f1', '#a5b4fc'],
  showGrid = true,
}) => {
  return (
    <Box width={width} height={height}>
      <ResponsiveContainer width="100%" height="100%">
        <ReBarChart data={data} barGap={0} margin={{ left: 10, bottom: 15 }}>
          {showGrid && <CartesianGrid strokeDasharray="2 2" vertical={false} />}
          <XAxis dataKey={xKey} tickLine={false} axisLine={false} dy={15} fontSize={14} />
          <YAxis axisLine={false} tickLine={false} dy={-2} dx={-10} fontSize={14} />
          <Tooltip cursor={false} />
          {barKeys.map((key, index) => (
            <Bar key={key} dataKey={key} fill={colors[index % colors.length]} radius={[4, 4, 0, 0]} barSize={32} />
          ))}
        </ReBarChart>
      </ResponsiveContainer>
    </Box>
  );
};
