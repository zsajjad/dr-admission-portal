'use client';

import React, { useEffect, useLayoutEffect, useRef } from 'react';

import * as am5 from '@amcharts/amcharts5';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import * as am5xy from '@amcharts/amcharts5/xy';

import { Box } from '@mui/material';

type BarChartProps = {
  data: { [key: string]: string | number }[];
  xKey: string;
  barKeys: string[];
  height?: number;
  width?: number | string;
  colors?: string[];
  showGrid?: boolean;
  axisFontSize?: number;
  axisFontColor?: string;
};

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export const BarChart: React.FC<BarChartProps> = ({
  data,
  xKey,
  barKeys,
  height = 400,
  width = '100%',
  colors = ['#6366f1', '#a5b4fc'],
}) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    if (!chartRef.current) return;

    const root = am5.Root.new(chartRef.current);
    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        layout: root.verticalLayout,
      }),
    );

    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: xKey,
        renderer: am5xy.AxisRendererX.new(root, {
          minGridDistance: 30,
        }),
      }),
    );
    xAxis.data.setAll(data);

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {}),
        min: 0,
      }),
    );

    barKeys.forEach((key, index) => {
      const series = chart.series.push(
        am5xy.ColumnSeries.new(root, {
          name: key,
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: key,
          categoryXField: xKey,
          fill: am5.color(colors[index % colors.length]),
          stroke: am5.color(colors[index % colors.length]),
        }),
      );

      series.columns.template.setAll({
        tooltipText: '{categoryX}: {valueY}',
        cornerRadiusTL: 4,
        cornerRadiusTR: 4,
        width: am5.percent(80),
      });

      series.data.setAll(data);
      series.appear(1000);
    });

    chart.appear(1000, 100);

    return () => {
      root.dispose();
    };
  }, [data, xKey, barKeys, colors]);

  return (
    <Box width={width} height={height}>
      <div ref={chartRef} style={{ width: '100%', height: '100%' }} />
    </Box>
  );
};
