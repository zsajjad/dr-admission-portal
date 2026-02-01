'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';

import * as am5 from '@amcharts/amcharts5';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import * as am5xy from '@amcharts/amcharts5/xy';

import { ChartCard } from './ChartCard';

export interface ClassFeeChartData {
  name: string;
  code: string;
  confirmed: number; // feePaidCount
  remaining: number; // expected - confirmed (not yet paid)
  total: number; // total expected
  age: number;
}

export interface ClassFeeBreakdownChartProps {
  title: React.ReactNode;
  data: ClassFeeChartData[];
}

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

// Colors for confirmed (green) and remaining (orange)
const CONFIRMED_COLOR = '#2E7D32';
const REMAINING_COLOR = '#E67E22';

export function ClassFeeBreakdownChart({ title, data }: ClassFeeBreakdownChartProps) {
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
        layout: root.verticalLayout,
      }),
    );

    // Create X-axis (category)
    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: 'name',
        renderer: am5xy.AxisRendererX.new(root, {
          minGridDistance: 30,
          cellStartLocation: 0.1,
          cellEndLocation: 0.9,
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

    // Create Confirmed series (fee paid)
    const confirmedSeries = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name: 'Confirmed',
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: 'confirmed',
        categoryXField: 'name',
        stacked: true,
        fill: am5.color(CONFIRMED_COLOR),
        stroke: am5.color(CONFIRMED_COLOR),
      }),
    );

    confirmedSeries.columns.template.setAll({
      tooltipText: '{name} - Confirmed: {valueY}',
      cornerRadiusTL: 0,
      cornerRadiusTR: 0,
      width: am5.percent(70),
    });

    // Create Remaining series (fee not paid)
    const remainingSeries = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name: 'Remaining',
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: 'remaining',
        categoryXField: 'name',
        stacked: true,
        fill: am5.color(REMAINING_COLOR),
        stroke: am5.color(REMAINING_COLOR),
      }),
    );

    remainingSeries.columns.template.setAll({
      tooltipText: '{name} - Remaining: {valueY}',
      cornerRadiusTL: 4,
      cornerRadiusTR: 4,
      width: am5.percent(70),
    });

    // Add total labels on top of stacked bars
    remainingSeries.bullets.push(function () {
      return am5.Bullet.new(root, {
        locationY: 1,
        sprite: am5.Label.new(root, {
          text: '{confirmed} / {total}',
          fill: am5.color('#333'),
          centerY: am5.p100,
          centerX: am5.p50,
          fontSize: 11,
          fontWeight: '600',
          populateText: true,
        }),
      });
    });

    // Add legend
    // const legend = chart.children.push(
    //   am5.Legend.new(root, {
    //     centerX: am5.percent(50),
    //     x: am5.percent(50),
    //   }),
    // );
    // legend.data.setAll(chart.series.values);

    // Set data
    confirmedSeries.data.setAll(data);
    remainingSeries.data.setAll(data);

    // Animate
    confirmedSeries.appear(1000);
    remainingSeries.appear(1000);
    chart.appear(1000, 100);

    return () => {
      root.dispose();
    };
  }, [data]);

  return (
    <ChartCard title={title} minHeight={320}>
      <div ref={chartRef} style={{ width: '100%', height: 320 }} />
    </ChartCard>
  );
}
