'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';

import * as am5 from '@amcharts/amcharts5';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import * as am5xy from '@amcharts/amcharts5/xy';

import { FormattedMessage } from '@/theme/FormattedMessage';

import messages from '../messages';
import { chartColors, colors } from '../styles';
import type { AdmissionsAreaDistributionDatum } from '../hooks/useAdmissionsAreaDistribution';

import { ChartCard } from './ChartCard';

export interface AdmissionsAreaDistributionChartProps {
  data: AdmissionsAreaDistributionDatum[];
}

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function AdmissionsAreaDistributionChart({ data }: AdmissionsAreaDistributionChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<am5.Root | null>(null);

  useIsomorphicLayoutEffect(() => {
    if (!chartRef.current || data.length === 0) return;

    const root = am5.Root.new(chartRef.current);
    rootRef.current = root;

    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        layout: root.verticalLayout,
        paddingLeft: 0,
      }),
    );

    // Vertical chart:
    // X-axis = areas (Urdu font), Y-axis = counts
    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: 'areaName',
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
      fill: am5.color(colors.purple[700]),
      // Equivalent of `.font-urdu` in our theme
      fontFamily: 'var(--font-urdu), "Noto Nastaliq Urdu", serif',
    });

    xAxis.get('renderer').grid.template.setAll({
      strokeOpacity: 0,
    });

    xAxis.data.setAll(data);

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {}),
        min: 0,
      }),
    );

    yAxis.get('renderer').grid.template.setAll({
      strokeOpacity: 0.06,
      stroke: am5.color(colors.purple[300]),
    });

    yAxis.get('renderer').labels.template.setAll({
      fill: am5.color(colors.purple[500]),
      fontSize: 11,
    });

    // Top legend: "New | Legacy"
    const legend = chart.children.unshift(
      am5.Legend.new(root, {
        centerX: am5.percent(50),
        x: am5.percent(50),
        layout: root.horizontalLayout,
        marginBottom: 10,
      }),
    );

    legend.labels.template.setAll({
      fontSize: 12,
      fontWeight: '600',
      fill: am5.color(colors.purple[700]),
    });

    const legacySeries = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name: 'Legacy',
        xAxis,
        yAxis,
        valueYField: 'legacyCount',
        categoryXField: 'areaName',
        stacked: true,
        fill: am5.color(chartColors.primary),
        stroke: am5.color(chartColors.primary),
      }),
    );

    legacySeries.columns.template.setAll({
      tooltipText: '{categoryX}\nLegacy: {valueY}',
    });

    const nonLegacySeries = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name: 'New',
        xAxis,
        yAxis,
        valueYField: 'nonLegacyCount',
        categoryXField: 'areaName',
        stacked: true,
        fill: am5.color(colors.purple[400]),
        stroke: am5.color(colors.purple[400]),
      }),
    );

    nonLegacySeries.columns.template.setAll({
      // NOTE: we compute Total via adapters; `{total}` was rendering as literal text for you.
      tooltipText: '{categoryX}\nNew: {valueY}',
    });

    // Total labels (on the last stacked series)
    nonLegacySeries.bullets.push(() => {
      const label = am5.Label.new(root, {
        text: '',
        fill: am5.color(0xffffff),
        centerY: am5.percent(100),
        centerX: am5.percent(50),
        paddingBottom: 4,
        fontSize: 11,
        fontWeight: '600',
      });

      // Compute total from the data context to avoid `{total}` showing literally.
      label.adapters.add('text', (_text, target) => {
        const ctx = target.dataItem?.dataContext as AdmissionsAreaDistributionDatum | undefined;
        return typeof ctx?.total === 'number' ? String(ctx.total) : '';
      });

      return am5.Bullet.new(root, {
        locationY: 1,
        sprite: label,
      });
    });

    legend.data.setAll([nonLegacySeries, legacySeries]);

    legacySeries.data.setAll(data);
    nonLegacySeries.data.setAll(data);

    legacySeries.appear(800);
    nonLegacySeries.appear(800);
    chart.appear(800, 100);

    return () => {
      root.dispose();
    };
  }, [data]);

  const chartHeight = 380;

  return (
    <ChartCard title={<FormattedMessage {...messages.admissionsAreaDistribution} />} minHeight={chartHeight}>
      <div ref={chartRef} style={{ width: '100%', height: chartHeight }} />
    </ChartCard>
  );
}

