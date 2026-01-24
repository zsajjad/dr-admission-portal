'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';

import * as am5 from '@amcharts/amcharts5';
import * as am5percent from '@amcharts/amcharts5/percent';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';

import { ChartCard } from './ChartCard';

export interface GenderChartData {
  name: string;
  value: number;
  color: string;
}

export interface GenderDistributionChartProps {
  title: React.ReactNode;
  data: GenderChartData[];
}

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function GenderDistributionChart({ title, data }: GenderDistributionChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<am5.Root | null>(null);

  useIsomorphicLayoutEffect(() => {
    if (!chartRef.current) return;

    const root = am5.Root.new(chartRef.current);
    rootRef.current = root;

    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5percent.PieChart.new(root, {
        innerRadius: am5.percent(50),
        layout: root.verticalLayout,
      }),
    );

    const series = chart.series.push(
      am5percent.PieSeries.new(root, {
        valueField: 'value',
        categoryField: 'name',
      }),
    );

    series.slices.template.setAll({
      strokeWidth: 2,
      stroke: am5.color(0xffffff),
    });

    series.slices.template.adapters.add('fill', (fill, target) => {
      const dataItem = target.dataItem;
      if (dataItem) {
        const dataContext = dataItem.dataContext as GenderChartData;
        if (dataContext?.color) {
          return am5.color(dataContext.color);
        }
      }
      return fill;
    });

    series.slices.template.adapters.add('stroke', (stroke, target) => {
      const dataItem = target.dataItem;
      if (dataItem) {
        const dataContext = dataItem.dataContext as GenderChartData;
        if (dataContext?.color) {
          return am5.color(dataContext.color);
        }
      }
      return stroke;
    });

    series.labels.template.setAll({
      text: '{category}: {value}',
      fontSize: 12,
    });

    series.data.setAll(data);
    series.appear(1000, 100);

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
