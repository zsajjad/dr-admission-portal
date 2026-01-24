'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';

import * as am5 from '@amcharts/amcharts5';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import * as am5xy from '@amcharts/amcharts5/xy';

import { ChartCard } from './ChartCard';

export interface ClassChartData {
  name: string;
  code: string;
  count: number;
  age: number;
}

export interface ClassBreakdownChartProps {
  title: React.ReactNode;
  data: ClassChartData[];
  color: string;
}

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function ClassBreakdownChart({ title, data, color }: ClassBreakdownChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<am5.Root | null>(null);

  useIsomorphicLayoutEffect(() => {
    if (!chartRef.current) return;

    const root = am5.Root.new(chartRef.current);
    rootRef.current = root;

    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        paddingLeft: 0,
      }),
    );

    // Create X-axis (category)
    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: 'name',
        renderer: am5xy.AxisRendererX.new(root, {
          minGridDistance: 30,
        }),
      }),
    );

    xAxis.get('renderer').labels.template.setAll({
      rotation: -45,
      centerY: am5.p50,
      centerX: am5.p100,
      fontSize: 11,
    });

    xAxis.data.setAll(data);

    // Create Y-axis
    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {}),
        min: 0,
      }),
    );

    // Create series
    const series = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name: 'Students',
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: 'count',
        categoryXField: 'name',
        fill: am5.color(color),
        stroke: am5.color(color),
      }),
    );

    series.columns.template.setAll({
      tooltipText: '{categoryX}: {valueY}',
      cornerRadiusTL: 4,
      cornerRadiusTR: 4,
      width: am5.percent(80),
    });

    // Add labels on top of bars
    series.bullets.push(function () {
      return am5.Bullet.new(root, {
        locationY: 1,
        sprite: am5.Label.new(root, {
          text: '{valueY}',
          fill: am5.color('#333'),
          centerY: am5.p100,
          centerX: am5.p50,
          fontSize: 11,
          fontWeight: '600',
          populateText: true,
        }),
      });
    });

    // Set data
    series.data.setAll(data);

    // Animate
    series.appear(1000);
    chart.appear(1000, 100);

    return () => {
      root.dispose();
    };
  }, [data, color]);

  return (
    <ChartCard title={title} minHeight={300}>
      <div ref={chartRef} style={{ width: '100%', height: 300 }} />
    </ChartCard>
  );
}
