'use client';

import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';

import * as am5 from '@amcharts/amcharts5';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import * as am5xy from '@amcharts/amcharts5/xy';

import { STATUS_COLORS } from '../constants';

import { ChartCard } from './ChartCard';

export interface FunnelData {
  totalAdmissions: number;
  unverified?: number;
  verified?: number;
  rejected?: number;
  feePaid: number;
  finalized: number;
}

export interface FunnelMetricsChartProps {
  title: React.ReactNode;
  funnel?: FunnelData;
}

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function FunnelMetricsChart({ title, funnel }: FunnelMetricsChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<am5.Root | null>(null);

  const data = useMemo(
    () => [
      { name: 'Unverified', value: funnel?.unverified || 0, color: STATUS_COLORS.UNVERIFIED },
      { name: 'Verified', value: funnel?.verified || 0, color: STATUS_COLORS.VERIFIED },
      { name: 'Fee Paid', value: funnel?.feePaid || 0, color: '#2E7D32' },
      { name: 'Finalized', value: funnel?.finalized || 0, color: '#0277BD' },
    ],
    [funnel],
  );

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

    // Create series
    const series = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name: 'Value',
        xAxis: xAxis,
        yAxis: yAxis,
        valueXField: 'value',
        categoryYField: 'name',
      }),
    );

    series.columns.template.setAll({
      height: am5.percent(70),
      tooltipText: '{categoryY}: {valueX}',
      cornerRadiusBR: 4,
      cornerRadiusTR: 4,
    });

    // Set colors from data
    series.columns.template.adapters.add('fill', (fill, target) => {
      const dataItem = target.dataItem;
      if (dataItem) {
        const dataContext = dataItem.dataContext as { color: string };
        if (dataContext?.color) {
          return am5.color(dataContext.color);
        }
      }
      return fill;
    });

    series.columns.template.adapters.add('stroke', (stroke, target) => {
      const dataItem = target.dataItem;
      if (dataItem) {
        const dataContext = dataItem.dataContext as { color: string };
        if (dataContext?.color) {
          return am5.color(dataContext.color);
        }
      }
      return stroke;
    });

    // Set data
    series.data.setAll(data);

    // Animate
    series.appear(1000);
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
