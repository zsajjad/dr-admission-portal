'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';

import * as am5 from '@amcharts/amcharts5';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import * as am5xy from '@amcharts/amcharts5/xy';

import { FormattedMessage } from '@/theme/FormattedMessage';

import messages from '../messages';
import { colors } from '../styles';

import { ChartCard } from './ChartCard';

export interface QuestionMetricsData {
  questionId: string;
  prompt: string;
  sortOrder: number;
  averageRating: number;
  color: string;
}

export interface QuestionMetricsChartProps {
  data: QuestionMetricsData[];
}

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function QuestionMetricsChart({ data }: QuestionMetricsChartProps) {
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

    // Y-axis (categories - questions)
    const yAxis = chart.yAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: 'prompt',
        renderer: am5xy.AxisRendererY.new(root, {
          inversed: true,
          cellStartLocation: 0.1,
          cellEndLocation: 0.9,
          minGridDistance: 20,
        }),
      }),
    );

    yAxis.get('renderer').labels.template.setAll({
      fontSize: 11,
      maxWidth: 160,
      oversizedBehavior: 'truncate',
      fill: am5.color(colors.purple[700]),
    });

    yAxis.get('renderer').grid.template.setAll({
      strokeOpacity: 0,
    });

    yAxis.data.setAll(data);

    // X-axis (values - rating 0-5)
    const xAxis = chart.xAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererX.new(root, {}),
        min: 0,
        max: 5,
        strictMinMax: true,
      }),
    );

    xAxis.get('renderer').grid.template.setAll({
      strokeOpacity: 0.06,
      stroke: am5.color(colors.purple[300]),
    });

    xAxis.get('renderer').labels.template.setAll({
      fill: am5.color(colors.purple[500]),
      fontSize: 11,
    });

    // Create series
    const series = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name: 'Average Rating',
        xAxis: xAxis,
        yAxis: yAxis,
        valueXField: 'averageRating',
        categoryYField: 'prompt',
      }),
    );

    series.columns.template.setAll({
      height: am5.percent(55),
      tooltipText: '{categoryY}: {valueX.formatNumber("#.##")}',
      cornerRadiusBR: 6,
      cornerRadiusTR: 6,
    });

    // Dynamic color based on rating
    series.columns.template.adapters.add('fill', (fill, target) => {
      const dataItem = target.dataItem;
      if (dataItem) {
        const dataContext = dataItem.dataContext as QuestionMetricsData;
        if (dataContext?.color) {
          return am5.color(dataContext.color);
        }
      }
      return fill;
    });

    series.columns.template.adapters.add('stroke', (stroke, target) => {
      const dataItem = target.dataItem;
      if (dataItem) {
        const dataContext = dataItem.dataContext as QuestionMetricsData;
        if (dataContext?.color) {
          return am5.color(dataContext.color);
        }
      }
      return stroke;
    });

    // Value labels
    series.bullets.push(() => {
      return am5.Bullet.new(root, {
        locationX: 1,
        sprite: am5.Label.new(root, {
          text: '{valueX.formatNumber("#.#")}',
          fill: am5.color(0xffffff),
          centerY: am5.percent(50),
          centerX: am5.percent(100),
          paddingRight: 8,
          fontSize: 11,
          fontWeight: '600',
        }),
      });
    });

    series.data.setAll(data);

    series.appear(800);
    chart.appear(800, 100);

    return () => {
      root.dispose();
    };
  }, [data]);

  const chartHeight = Math.max(300, data.length * 45);

  return (
    <ChartCard title={<FormattedMessage {...messages.questionMetrics} />} minHeight={chartHeight}>
      <div ref={chartRef} style={{ width: '100%', height: chartHeight }} />
    </ChartCard>
  );
}
