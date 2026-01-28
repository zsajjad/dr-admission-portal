'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';

import * as am5 from '@amcharts/amcharts5';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import * as am5xy from '@amcharts/amcharts5/xy';

import { FormattedMessage } from '@/theme/FormattedMessage';

import messages from '../messages';
import { chartColors, colors } from '../styles';

import { ChartCard } from './ChartCard';

export interface RatingDistributionData {
  questionId: string;
  prompt: string;
  sortOrder: number;
  rating1: number;
  rating2: number;
  rating3: number;
  rating4: number;
  rating5: number;
  total: number;
}

export interface RatingDistributionChartProps {
  data: RatingDistributionData[];
}

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function RatingDistributionChart({ data }: RatingDistributionChartProps) {
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
      maxWidth: 180,
      oversizedBehavior: 'truncate',
      fill: am5.color(colors.purple[700]),
    });

    yAxis.get('renderer').grid.template.setAll({
      strokeOpacity: 0,
    });

    yAxis.data.setAll(data);

    // X-axis (values)
    const xAxis = chart.xAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererX.new(root, {}),
        min: 0,
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

    // Create series for each rating level
    const ratingConfigs = [
      { field: 'rating1', name: '1', color: chartColors.ratings[1] },
      { field: 'rating2', name: '2', color: chartColors.ratings[2] },
      { field: 'rating3', name: '3', color: chartColors.ratings[3] },
      { field: 'rating4', name: '4', color: chartColors.ratings[4] },
      { field: 'rating5', name: '5', color: chartColors.ratings[5] },
    ];

    ratingConfigs.forEach((config, index) => {
      const series = chart.series.push(
        am5xy.ColumnSeries.new(root, {
          name: config.name,
          xAxis: xAxis,
          yAxis: yAxis,
          valueXField: config.field,
          categoryYField: 'prompt',
          stacked: true,
          fill: am5.color(config.color),
          stroke: am5.color(config.color),
        }),
      );

      series.columns.template.setAll({
        height: am5.percent(65),
        tooltipText: `Rating ${config.name}: {valueX}`,
        cornerRadiusBL: index === 0 ? 3 : 0,
        cornerRadiusTL: index === 0 ? 3 : 0,
        cornerRadiusBR: index === 4 ? 3 : 0,
        cornerRadiusTR: index === 4 ? 3 : 0,
      });

      series.data.setAll(data);
      series.appear(800);
    });

    // Legend
    const legend = chart.children.push(
      am5.Legend.new(root, {
        centerX: am5.percent(50),
        x: am5.percent(50),
        marginTop: 12,
      }),
    );

    legend.labels.template.setAll({
      fontSize: 11,
      fill: am5.color(colors.purple[600]),
    });

    legend.data.setAll(chart.series.values);

    chart.appear(800, 100);

    return () => {
      root.dispose();
    };
  }, [data]);

  const chartHeight = Math.max(300, data.length * 45);

  return (
    <ChartCard title={<FormattedMessage {...messages.ratingDistribution} />} minHeight={chartHeight}>
      <div ref={chartRef} style={{ width: '100%', height: chartHeight }} />
    </ChartCard>
  );
}
