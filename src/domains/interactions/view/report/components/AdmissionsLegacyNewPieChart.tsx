'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';

import * as am5 from '@amcharts/amcharts5';
import * as am5percent from '@amcharts/amcharts5/percent';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';

import { FormattedMessage } from '@/theme/FormattedMessage';

import messages from '../messages';
import { colors } from '../styles';

import { ChartCard } from './ChartCard';

export interface AdmissionsLegacyNewPieChartProps {
  legacyCount: number;
  nonLegacyCount: number;
}

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function AdmissionsLegacyNewPieChart({ legacyCount, nonLegacyCount }: AdmissionsLegacyNewPieChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    if (!chartRef.current) return;

    const total = legacyCount + nonLegacyCount;
    if (total === 0) return;

    const root = am5.Root.new(chartRef.current);
    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5percent.PieChart.new(root, {
        layout: root.verticalLayout,
        innerRadius: am5.percent(55),
      }),
    );

    const series = chart.series.push(
      am5percent.PieSeries.new(root, {
        valueField: 'value',
        categoryField: 'category',
        alignLabels: false,
      }),
    );

    series.labels.template.setAll({
      textType: 'circular',
      radius: 10,
      fill: am5.color(colors.purple[700]),
      fontSize: 12,
    });

    series.ticks.template.setAll({
      strokeOpacity: 0.2,
      stroke: am5.color(colors.purple[300]),
    });

    series.slices.template.setAll({
      strokeOpacity: 0,
      tooltipText: '{category}: {value} ({valuePercentTotal.formatNumber("0.0")}%)',
    });

    series.data.setAll([
      { category: 'Legacy', value: legacyCount, fill: colors.purple[600] },
      { category: 'New', value: nonLegacyCount, fill: colors.purple[400] },
    ]);

    series.slices.template.adapters.add('fill', (fill, target) => {
      const dataItem = target.dataItem;
      const ctx = dataItem?.dataContext as { fill?: string } | undefined;
      return ctx?.fill ? am5.color(ctx.fill) : fill;
    });

    series.slices.template.adapters.add('stroke', (stroke, target) => {
      const dataItem = target.dataItem;
      const ctx = dataItem?.dataContext as { fill?: string } | undefined;
      return ctx?.fill ? am5.color(ctx.fill) : stroke;
    });

    // Center label
    chart.seriesContainer.children.push(
      am5.Label.new(root, {
        text: `${Math.round((legacyCount / total) * 100)}% Legacy`,
        centerX: am5.percent(50),
        centerY: am5.percent(50),
        fontSize: 14,
        fontWeight: '600',
        fill: am5.color(colors.purple[800]),
      }),
    );

    series.appear(800);
    chart.appear(800, 100);

    return () => {
      root.dispose();
    };
  }, [legacyCount, nonLegacyCount]);

  return (
    <ChartCard title={<FormattedMessage {...messages.admissionsLegacyNew} />} minHeight={350}>
      <div ref={chartRef} style={{ width: '100%', height: 320 }} />
    </ChartCard>
  );
}

