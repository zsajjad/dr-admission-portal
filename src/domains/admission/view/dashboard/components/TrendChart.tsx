'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';

import * as am5 from '@amcharts/amcharts5';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import * as am5xy from '@amcharts/amcharts5/xy';

import { ChartCard } from './ChartCard';

export interface TrendChartData {
  date: string;
  admissions: number;
  interactions: number;
}

export interface TrendChartProps {
  title: React.ReactNode;
  data: TrendChartData[];
}

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function TrendChart({ title, data }: TrendChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<am5.Root | null>(null);

  useIsomorphicLayoutEffect(() => {
    if (!chartRef.current) return;

    const root = am5.Root.new(chartRef.current);
    rootRef.current = root;

    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: true,
        panY: false,
        layout: root.verticalLayout,
      }),
    );

    // Add cursor
    chart.set('cursor', am5xy.XYCursor.new(root, {}));

    // Create X-axis (category for dates)
    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: 'date',
        renderer: am5xy.AxisRendererX.new(root, {
          minGridDistance: 50,
        }),
      }),
    );
    xAxis.data.setAll(data);

    // Create Y-axis
    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {}),
      }),
    );

    // Create Admissions series
    const admissionsSeries = chart.series.push(
      am5xy.LineSeries.new(root, {
        name: 'Admissions',
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: 'admissions',
        categoryXField: 'date',
        stroke: am5.color('#1565C0'),
        tooltip: am5.Tooltip.new(root, {
          labelText: '{name}: {valueY}',
        }),
      }),
    );

    admissionsSeries.strokes.template.setAll({
      strokeWidth: 3,
    });

    // Create Interactions series
    const interactionsSeries = chart.series.push(
      am5xy.LineSeries.new(root, {
        name: 'Interactions',
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: 'interactions',
        categoryXField: 'date',
        stroke: am5.color('#7B1FA2'),
        tooltip: am5.Tooltip.new(root, {
          labelText: '{name}: {valueY}',
        }),
      }),
    );

    interactionsSeries.strokes.template.setAll({
      strokeWidth: 3,
    });

    // Add legend
    const legend = chart.children.push(
      am5.Legend.new(root, {
        centerX: am5.percent(50),
        x: am5.percent(50),
      }),
    );
    legend.data.setAll(chart.series.values);

    // Set data
    admissionsSeries.data.setAll(data);
    interactionsSeries.data.setAll(data);

    // Animate
    admissionsSeries.appear(1000);
    interactionsSeries.appear(1000);
    chart.appear(1000, 100);

    return () => {
      root.dispose();
    };
  }, [data]);

  return (
    <ChartCard title={title} minHeight={300}>
      <div ref={chartRef} style={{ width: '100%', height: 300 }} />
    </ChartCard>
  );
}
