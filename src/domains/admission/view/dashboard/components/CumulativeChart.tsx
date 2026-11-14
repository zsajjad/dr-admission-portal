'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';

import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';

import { useTheme } from '@mui/material';

import { SessionDashboardTimelinePoint } from '@/providers/service/app.schemas';

import { DashboardMetric, SERIES_COLORS } from '../constants';

export interface CumulativeChartProps {
  points: SessionDashboardTimelinePoint[];
  metric: DashboardMetric;
  sessionName: string;
  compareName?: string;
  /** Today as a day of the session's cycle, marked on the chart */
  today?: number;
  labels: { today: string; start: string; axis: string };
}

const PREVIOUS_FIELD = {
  applied: 'previousApplied',
  feePaid: 'previousFeePaid',
  finalized: 'previousFinalized',
} as const;

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Running totals of one measure for both sessions on one axis: days from each session's first class
 * day. This session is the solid blue line and stops at today; the comparison is the dashed grey one.
 */
export function CumulativeChart({ points, metric, sessionName, compareName, today, labels }: CumulativeChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const textColor = theme.palette.text.secondary;
  const { today: todayLabel, start: startLabel, axis: axisLabel } = labels;

  useIsomorphicLayoutEffect(() => {
    if (!chartRef.current || points.length === 0) return;

    const root = am5.Root.new(chartRef.current);
    root.numberFormatter.set('numberFormat', '#,###');
    const muted = am5.color(textColor);

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, { panX: false, panY: false, layout: root.verticalLayout, paddingLeft: 0 }),
    );

    const xRenderer = am5xy.AxisRendererX.new(root, { minGridDistance: 70 });
    xRenderer.grid.template.set('forceHidden', true);
    xRenderer.labels.template.setAll({ fill: muted, fontSize: 12 });
    const xAxis = chart.xAxes.push(
      am5xy.ValueAxis.new(root, {
        min: points[0].day,
        max: points[points.length - 1].day,
        strictMinMax: true,
        maxPrecision: 0,
        renderer: xRenderer,
      }),
    );
    xAxis.children.push(
      am5.Label.new(root, { text: axisLabel, x: am5.p50, centerX: am5.p50, fill: muted, fontSize: 12 }),
    );

    const yRenderer = am5xy.AxisRendererY.new(root, {});
    yRenderer.grid.template.setAll({ strokeOpacity: 0.08 });
    yRenderer.labels.template.setAll({ fill: muted, fontSize: 12 });
    const yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, { min: 0, maxPrecision: 0, renderer: yRenderer }));

    const marker = (value: number, text: string) => {
      const range = xAxis.createAxisRange(xAxis.makeDataItem({ value }));
      range.get('grid')?.setAll({ forceHidden: false, strokeOpacity: 0.35, strokeDasharray: [2, 3] });
      range.get('label')?.setAll({ text, fill: muted, fontSize: 12, fontWeight: '600', inside: true, dy: -18 });
    };
    if (points[0].day < 0 && points[points.length - 1].day > 0) marker(0, startLabel);
    if (today !== undefined && today !== 0 && today >= points[0].day && today <= points[points.length - 1].day) {
      marker(today, todayLabel);
    }

    const addSeries = (name: string, color: string, data: Array<{ day: number; value: number }>, dashed: boolean) => {
      const series = chart.series.push(
        am5xy.LineSeries.new(root, {
          name,
          xAxis,
          yAxis,
          valueXField: 'day',
          valueYField: 'value',
          stroke: am5.color(color),
          fill: am5.color(color),
          tooltip: am5.Tooltip.new(root, { labelText: '{name}: [bold]{valueY}[/]' }),
        }),
      );
      series.strokes.template.setAll({ strokeWidth: 2, ...(dashed ? { strokeDasharray: [5, 4] } : {}) });
      series.data.setAll(data);
      return series;
    };

    const previousField = PREVIOUS_FIELD[metric];
    if (compareName) {
      addSeries(
        compareName,
        SERIES_COLORS.previous,
        points
          .filter((p) => p[previousField] !== undefined)
          .map((p) => ({ day: p.day, value: p[previousField] as number })),
        true,
      );
    }
    const current = points
      .filter((p) => p[metric] !== undefined)
      .map((p) => ({ day: p.day, value: p[metric] as number }));
    const currentSeries = addSeries(sessionName, SERIES_COLORS.current, current, false);
    // Mark where this session stands today
    const last = current[current.length - 1];
    currentSeries.bullets.push((_root, _series, dataItem) =>
      last && dataItem.get('valueX') === last.day
        ? am5.Bullet.new(root, {
            sprite: am5.Circle.new(root, {
              radius: 5,
              fill: am5.color(SERIES_COLORS.current),
              stroke: am5.color(theme.palette.background.default),
              strokeWidth: 2,
            }),
          })
        : undefined,
    );

    const cursor = chart.set('cursor', am5xy.XYCursor.new(root, { behavior: 'none', xAxis }));
    cursor.lineY.set('visible', false);

    const legend = chart.children.push(am5.Legend.new(root, { centerX: am5.p50, x: am5.p50 }));
    legend.labels.template.setAll({ fill: muted, fontSize: 13 });
    legend.valueLabels.template.set('forceHidden', true);
    legend.data.setAll(chart.series.values);

    return () => {
      root.dispose();
    };
  }, [points, metric, sessionName, compareName, today, todayLabel, startLabel, axisLabel, textColor, theme]);

  // A number axis reads left to right in Urdu too, and the canvas mis-draws its labels when mirrored
  return <div ref={chartRef} dir="ltr" data-testid="cumulative-chart" style={{ width: '100%', height: 420 }} />;
}
