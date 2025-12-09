'use client';

import React from 'react';

import { Cell, Legend, Pie, PieChart as RePieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { Box } from '@mui/material';

type PieChartProps = {
  data: { name: string; value: number; color?: string }[];
  height?: number;
  width?: number | string;
  innerRadius?: number;
  outerRadius?: number;
  showLegend?: boolean;
  colors?: string[];
};

export const PieChart: React.FC<PieChartProps> = ({
  data,
  height = 400,
  width = '100%',
  innerRadius = 60,
  outerRadius = 120,
  showLegend = true,
  colors = ['#620E00', '#03A9F4', '#4CAF50', '#FF9800', '#9C27B0', '#E91E63'],
}) => {
  return (
    <Box width={width} height={height}>
      <ResponsiveContainer width="100%" height="100%">
        <RePieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            dataKey="value"
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          />
          {showLegend && (
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => <span style={{ color: '#333', fontSize: '14px' }}>{value}</span>}
            />
          )}
        </RePieChart>
      </ResponsiveContainer>
    </Box>
  );
};
