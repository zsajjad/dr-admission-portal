'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';

import * as am5 from '@amcharts/amcharts5';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import * as am5xy from '@amcharts/amcharts5/xy';

import { GENDER_COLORS } from '../constants';

import { ChartCard } from './ChartCard';

export interface GroupChartData {
  name: string;
  male: number;
  female: number;
  total: number;
}

export interface GroupStatsChartProps {
  title: React.ReactNode;
  data: GroupChartData[];
}

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function GroupStatsChart({ title, data }: GroupStatsChartProps) {
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
        layout: root.verticalLayout,
      }),
    );

    // Create Y-axis (category)
    const yAxis = chart.yAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: 'name',
        renderer: am5xy.AxisRendererY.new(root, {
          inversed: false,
          cellStartLocation: 0.1,
          cellEndLocation: 0.9,
        }),
      }),
    );
    yAxis.data.setAll(data);

    // Create X-axis (value)
    const xAxis = chart.xAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererX.new(root, {}),
        min: 0,
      }),
    );

    // Create Male series
    const maleSeries = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name: 'Male',
        xAxis: xAxis,
        yAxis: yAxis,
        valueXField: 'male',
        categoryYField: 'name',
        stacked: true,
        fill: am5.color(GENDER_COLORS.MALE),
        stroke: am5.color(GENDER_COLORS.MALE),
      }),
    );

    maleSeries.columns.template.setAll({
      height: am5.percent(70),
      tooltipText: '{name}: {valueX}',
      cornerRadiusBR: 4,
      cornerRadiusTR: 4,
    });

    // Create Female series
    const femaleSeries = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name: 'Female',
        xAxis: xAxis,
        yAxis: yAxis,
        valueXField: 'female',
        categoryYField: 'name',
        stacked: true,
        fill: am5.color(GENDER_COLORS.FEMALE),
        stroke: am5.color(GENDER_COLORS.FEMALE),
      }),
    );

    femaleSeries.columns.template.setAll({
      height: am5.percent(70),
      tooltipText: '{name}: {valueX}',
      cornerRadiusBR: 4,
      cornerRadiusTR: 4,
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
    maleSeries.data.setAll(data);
    femaleSeries.data.setAll(data);

    // Animate
    maleSeries.appear(1000);
    femaleSeries.appear(1000);
    chart.appear(1000, 100);

    return () => {
      root.dispose();
    };
  }, [data]);

  return (
    <ChartCard title={title} minHeight={250}>
      <div ref={chartRef} style={{ width: '100%', height: 250 }} />
    </ChartCard>
  );
}
