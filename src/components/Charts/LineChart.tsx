'use client';

import React, { useEffect, useLayoutEffect, useRef } from 'react';

import * as am5 from '@amcharts/amcharts5';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import * as am5xy from '@amcharts/amcharts5/xy';

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

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export const LineChart: React.FC<LineChartProps> = ({
  data,
  xKey,
  lineKeys,
  height = 400,
  width = '100%',
  colors = ['#620E00', '#03A9F4', '#4CAF50', '#FF9800'],
  showLegend = true,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    if (!chartRef.current) return;

    const root = am5.Root.new(chartRef.current);
    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: true,
        panY: false,
        layout: root.verticalLayout,
      }),
    );

    chart.set('cursor', am5xy.XYCursor.new(root, {}));

    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: xKey,
        renderer: am5xy.AxisRendererX.new(root, {
          minGridDistance: 50,
        }),
      }),
    );
    xAxis.data.setAll(data);

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {}),
      }),
    );

    lineKeys.forEach((key, index) => {
      const series = chart.series.push(
        am5xy.LineSeries.new(root, {
          name: key,
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: key,
          categoryXField: xKey,
          stroke: am5.color(colors[index % colors.length]),
          tooltip: am5.Tooltip.new(root, {
            labelText: '{name}: {valueY}',
          }),
        }),
      );

      series.strokes.template.setAll({
        strokeWidth: 2,
      });

      series.bullets.push(function () {
        return am5.Bullet.new(root, {
          sprite: am5.Circle.new(root, {
            radius: 4,
            fill: am5.color(colors[index % colors.length]),
          }),
        });
      });

      series.data.setAll(data);
      series.appear(1000);
    });

    if (showLegend) {
      const legend = chart.children.push(
        am5.Legend.new(root, {
          centerX: am5.percent(50),
          x: am5.percent(50),
        }),
      );
      legend.data.setAll(chart.series.values);
    }

    chart.appear(1000, 100);

    return () => {
      root.dispose();
    };
  }, [data, xKey, lineKeys, colors, showLegend]);

  return (
    <Box width={width} height={height}>
      <div ref={chartRef} style={{ width: '100%', height: '100%' }} />
    </Box>
  );
};
