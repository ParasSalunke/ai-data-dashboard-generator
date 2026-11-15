'use client';

import React, { useState, useMemo } from 'react';
import type { ColumnInfo } from '@/lib/types';
import { adaptCsvData, type AdaptedChartData } from '@/lib/chart-data-adapter';
import {
  AreaChart as AreaIcon,
  BarChart3,
  LineChart as LineIcon,
  PieChart as PieIcon,
  Radar,
  CircleDot,
  MessageSquare,
} from 'lucide-react';

// ── AREA CHARTS ────────────────────────────────────────────────────────────
import { AreaChartInteractive } from './area-charts/AreaChartInteractive';
import { AreaChartDefault } from './area-charts/AreaChartDefault';
import { AreaChartLinear } from './area-charts/AreaChartLinear';
import { AreaChartStep } from './area-charts/AreaChartStep';
import { AreaChartLegend } from './area-charts/AreaChartLegend';
import { AreaChartStacked } from './area-charts/AreaChartStacked';
import { AreaChartStackedExpanded } from './area-charts/AreaChartStackedExpanded';
import { AreaChartIcons } from './area-charts/AreaChartIcons';
import { AreaChartGradient } from './area-charts/AreaChartGradient';
import { AreaChartAxes } from './area-charts/AreaChartAxes';

// ── BAR CHARTS ─────────────────────────────────────────────────────────────
import { BarChartInteractive } from './bar-charts/BarChartInteractive';
import { BarChartDefault } from './bar-charts/BarChartDefault';
import { BarChartHorizontal } from './bar-charts/BarChartHorizontal';
import { BarChartMultiple } from './bar-charts/BarChartMultiple';
import { BarChartStacked } from './bar-charts/BarChartStacked';
import { BarChartLabel } from './bar-charts/BarChartLabel';
import { BarChartLabelCustom } from './bar-charts/BarChartLabelCustom';
import { BarChartMixed } from './bar-charts/BarChartMixed';
import { BarChartActive } from './bar-charts/BarChartActive';
import { BarChartNegative } from './bar-charts/BarChartNegative';

// ── LINE CHARTS ────────────────────────────────────────────────────────────
import { LineChartInteractive } from './line-charts/LineChartInteractive';
import { LineChartDefault } from './line-charts/LineChartDefault';
import { LineChartLinear } from './line-charts/LineChartLinear';
import { LineChartStep } from './line-charts/LineChartStep';
import { LineChartMultiple } from './line-charts/LineChartMultiple';
import { LineChartDots } from './line-charts/LineChartDots';
import { LineChartCustomDots } from './line-charts/LineChartCustomDots';
import { LineChartDotsColors } from './line-charts/LineChartDotsColors';
import { LineChartLabel } from './line-charts/LineChartLabel';
import { LineChartCustomLabel } from './line-charts/LineChartCustomLabel';

// ── PIE CHARTS ─────────────────────────────────────────────────────────────
import { PieChartInteractive } from './pie-charts/PieChartInteractive';
import { PieChartDefault } from './pie-charts/PieChartDefault';
import { PieChartDonut } from './pie-charts/PieChartDonut';
import { PieChartDonutActive } from './pie-charts/PieChartDonutActive';
import { PieChartDonutWithText } from './pie-charts/PieChartDonutWithText';
import { PieChartStacked } from './pie-charts/PieChartStacked';
import { PieChartLegend } from './pie-charts/PieChartLegend';
import { PieChartLabel } from './pie-charts/PieChartLabel';
import { PieChartLabelList } from './pie-charts/PieChartLabelList';
import { PieChartSeparatorNone } from './pie-charts/PieChartSeparatorNone';
import { PieChartCustomLabel } from './pie-charts/PieChartCustomLabel';

// ── RADAR CHARTS ───────────────────────────────────────────────────────────
import { RadarChartMultiple } from './radar-charts/RadarChartMultiple';
import { RadarChartDefault } from './radar-charts/RadarChartDefault';
import { RadarChartDots } from './radar-charts/RadarChartDots';
import { RadarChartLinesOnly } from './radar-charts/RadarChartLinesOnly';
import { RadarChartLegend } from './radar-charts/RadarChartLegend';
import { RadarChartCustomLabel } from './radar-charts/RadarChartCustomLabel';
import { RadarChartGridCircle } from './radar-charts/RadarChartGridCircle';
import { RadarChartGridCircleFilled } from './radar-charts/RadarChartGridCircleFilled';
import { RadarChartGridCircleNoLines } from './radar-charts/RadarChartGridCircleNolines';
import { RadarChartGridCustom } from './radar-charts/RadarChartGridCustom';
import { RadarChartGridFilled } from './radar-charts/RadarChartGridFilled';
import { RadarChartGridNone } from './radar-charts/RadarChartGridNone';

// ── RADIAL CHARTS ──────────────────────────────────────────────────────────
import { RadialChartText } from './radial-charts/RadialChartText';
import { RadialChartDefault } from './radial-charts/RadialChartDefault';
import { RadialChartLabel } from './radial-charts/RadialChartLabel';
import { RadialChartGrid } from './radial-charts/RadialChartGrid';
import { RadialChartShape } from './radial-charts/RadialChartShape';
import { RadialBarChartDefault } from './radial-charts/RadialBarChartDefault';

// ── TOOLTIPS ───────────────────────────────────────────────────────────────
import { TooltipChartAdvanced } from './tooltips-charts/TooltipChartAdvanced';
import { TooltipChartDefault } from './tooltips-charts/TooltipChartDefault';
import { TooltipChartLineIndicator } from './tooltips-charts/TooltipChartLineIndicator';
import { TooltipChartNoIndicator } from './tooltips-charts/TooltipChartNoIndicator';
import { TooltipChartCustomlabel } from './tooltips-charts/TooltipChartCustomlabel';
import { TooltipChartFormatter } from './tooltips-charts/TooltipChartFormatter';
import { TooltipChartIcons } from './tooltips-charts/TooltipChartIcons';
import { TooltipChartNoLabel } from './tooltips-charts/TooltipChartNoLabel';
import { TooltipChartLabelFormatter } from './tooltips-charts/TooltipChartLabelFormatter';

interface ChartShowcaseProps {
  columns: ColumnInfo[];
  preview: Record<string, unknown>[];
  fileName?: string;
}

type ChartCategory = 'area' | 'bar' | 'line' | 'pie' | 'radar' | 'radial' | 'tooltips';

interface CategoryTab {
  id: ChartCategory;
  label: string;
  icon: React.ElementType;
}

const CATEGORIES: CategoryTab[] = [
  { id: 'area', label: 'Area Charts', icon: AreaIcon },
  { id: 'bar', label: 'Bar Charts', icon: BarChart3 },
  { id: 'line', label: 'Line Charts', icon: LineIcon },
  { id: 'pie', label: 'Pie Charts', icon: PieIcon },
  { id: 'radar', label: 'Radar Charts', icon: Radar },
  { id: 'radial', label: 'Radial Charts', icon: CircleDot },
  { id: 'tooltips', label: 'Tooltips', icon: MessageSquare },
];

interface ShowcaseCardWrapperProps {
  title: string;
  categoryName: string;
  icon: React.ElementType;
  children: React.ReactNode;
}

function ShowcaseCardWrapper({
  title,
  categoryName,
  icon: Icon,
  children,
}: ShowcaseCardWrapperProps) {
  const subtitle = title.replace(new RegExp(`^${categoryName}\\s*[-–]?\\s*`, 'i'), '').trim() || 'Variant';

  return (
    <div
      className="export-chart-card group flex flex-col rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm transition-all duration-200 hover:border-border hover:shadow-lg hover:shadow-black/20 overflow-hidden"
      data-chart-export-title={title}
    >
      {/* Top systematic header strip */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/40 text-xs text-muted-foreground bg-card/30">
        <div className="flex items-center gap-1.5 font-medium">
          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-foreground/80">{categoryName}</span>
        </div>
        <span className="text-[10px] font-mono tracking-wider uppercase text-muted-foreground/60 bg-muted/40 px-1.5 py-0.5 rounded">
          {subtitle}
        </span>
      </div>
      {/* Chart component with clean borderless integration */}
      <div className="flex-1 [&>div]:border-0 [&>div]:shadow-none [&>div]:bg-transparent [&>div]:rounded-none">
        {children}
      </div>
    </div>
  );
}

export function ChartShowcase({ columns, preview, fileName }: ChartShowcaseProps) {
  const [activeCategory, setActiveCategory] = useState<ChartCategory>('area');

  const adaptedData: AdaptedChartData = useMemo(() => {
    return adaptCsvData(columns, preview, fileName);
  }, [columns, preview, fileName]);

  return (
    <div className="w-full space-y-6">
      {/* ── Category Navigation Bar ────────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-border/40 pb-3 overflow-x-auto [&::-webkit-scrollbar]:hidden">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                isActive
                  ? 'bg-foreground text-background font-semibold shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/40'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── AREA CHARTS ────────────────────────────────────────────────────── */}
      {activeCategory === 'area' && (
        <div className="space-y-6">
          {/* Featured Top Card */}
          <ShowcaseCardWrapper
            title="Area Chart - Interactive"
            categoryName="Area Chart"
            icon={AreaIcon}
          >
            <AreaChartInteractive
              data={adaptedData.areaData}
              config={adaptedData.areaConfig}
              title={`Area Chart - Interactive (${adaptedData.numericColumn1})`}
              description={`Interactive time progression for ${adaptedData.datasetName}`}
            />
          </ShowcaseCardWrapper>

          {/* 3-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ShowcaseCardWrapper title="Area Chart" categoryName="Area Chart" icon={AreaIcon}>
              <AreaChartDefault
                data={adaptedData.areaData}
                config={adaptedData.areaConfig}
                title="Area Chart"
                description={`Progression of ${adaptedData.numericColumn1}`}
                insightText={adaptedData.areaTrend.text}
                insightSubText={adaptedData.areaTrend.subText}
                insightUp={adaptedData.areaTrend.isUp}
              />
            </ShowcaseCardWrapper>

            <ShowcaseCardWrapper title="Area Chart - Linear" categoryName="Area Chart" icon={AreaIcon}>
              <AreaChartLinear
                data={adaptedData.areaData}
                config={adaptedData.areaConfig}
                title="Area Chart - Linear"
                description="Linear interpolation curve"
                insightText={adaptedData.areaTrend.text}
                insightSubText={adaptedData.areaTrend.subText}
                insightUp={adaptedData.areaTrend.isUp}
              />
            </ShowcaseCardWrapper>

            <ShowcaseCardWrapper title="Area Chart - Step" categoryName="Area Chart" icon={AreaIcon}>
              <AreaChartStep
                data={adaptedData.areaData}
                config={adaptedData.areaConfig}
                title="Area Chart - Step"
                description="Step curve progression"
                insightText={adaptedData.areaTrend.text}
                insightSubText={adaptedData.areaTrend.subText}
                insightUp={adaptedData.areaTrend.isUp}
              />
            </ShowcaseCardWrapper>

            <ShowcaseCardWrapper title="Area Chart - Legend" categoryName="Area Chart" icon={AreaIcon}>
              <AreaChartLegend
                data={adaptedData.areaData}
                config={adaptedData.areaConfig}
                title="Area Chart - Legend"
                description={`${adaptedData.numericColumn1} & ${adaptedData.numericColumn2} series`}
                insightText={adaptedData.areaTrend.text}
                insightSubText={adaptedData.areaTrend.subText}
                insightUp={adaptedData.areaTrend.isUp}
              />
            </ShowcaseCardWrapper>

            <ShowcaseCardWrapper title="Area Chart - Stacked" categoryName="Area Chart" icon={AreaIcon}>
              <AreaChartStacked
                data={adaptedData.areaData}
                config={adaptedData.areaConfig}
                title="Area Chart - Stacked"
                description="Stacked comparative layers"
                insightText={adaptedData.areaTrend.text}
                insightSubText={adaptedData.areaTrend.subText}
                insightUp={adaptedData.areaTrend.isUp}
              />
            </ShowcaseCardWrapper>

            <ShowcaseCardWrapper title="Area Chart - Stacked Expanded" categoryName="Area Chart" icon={AreaIcon}>
              <AreaChartStackedExpanded
                data={adaptedData.areaData}
                config={adaptedData.areaConfig}
                title="Area Chart - Stacked Expanded"
                description="Proportional expanded area"
                insightText={adaptedData.areaTrend.text}
                insightSubText={adaptedData.areaTrend.subText}
                insightUp={adaptedData.areaTrend.isUp}
              />
            </ShowcaseCardWrapper>

            <ShowcaseCardWrapper title="Area Chart - Icons" categoryName="Area Chart" icon={AreaIcon}>
              <AreaChartIcons
                data={adaptedData.areaData}
                config={adaptedData.areaConfig}
                title="Area Chart - Icons"
                description="Legend with icon indicators"
                insightText={adaptedData.areaTrend.text}
                insightSubText={adaptedData.areaTrend.subText}
                insightUp={adaptedData.areaTrend.isUp}
              />
            </ShowcaseCardWrapper>

            <ShowcaseCardWrapper title="Area Chart - Gradient" categoryName="Area Chart" icon={AreaIcon}>
              <AreaChartGradient
                data={adaptedData.areaData}
                config={adaptedData.areaConfig}
                title="Area Chart - Gradient"
                description="Smooth opacity gradient fill"
                insightText={adaptedData.areaTrend.text}
                insightSubText={adaptedData.areaTrend.subText}
                insightUp={adaptedData.areaTrend.isUp}
              />
            </ShowcaseCardWrapper>

            <ShowcaseCardWrapper title="Area Chart - Axes" categoryName="Area Chart" icon={AreaIcon}>
              <AreaChartAxes
                data={adaptedData.areaData}
                config={adaptedData.areaConfig}
                title="Area Chart - Axes"
                description="Explicit value and time axes"
                insightText={adaptedData.areaTrend.text}
                insightSubText={adaptedData.areaTrend.subText}
                insightUp={adaptedData.areaTrend.isUp}
              />
            </ShowcaseCardWrapper>
          </div>
        </div>
      )}

      {/* ── BAR CHARTS ─────────────────────────────────────────────────────── */}
      {activeCategory === 'bar' && (
        <div className="space-y-6">
          {/* Featured Top Card */}
          <ShowcaseCardWrapper
            title="Bar Chart - Interactive"
            categoryName="Bar Chart"
            icon={BarChart3}
          >
            <BarChartInteractive
              data={adaptedData.barData}
              config={adaptedData.barConfig}
              title={`Bar Chart - Interactive (${adaptedData.categoryColumn})`}
              description={`Interactive metric breakdown for ${adaptedData.datasetName}`}
            />
          </ShowcaseCardWrapper>

          {/* 3-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ShowcaseCardWrapper title="Bar Chart" categoryName="Bar Chart" icon={BarChart3}>
              <BarChartDefault
                data={adaptedData.barData}
                config={adaptedData.barConfig}
                title="Bar Chart"
                description={`Distribution of ${adaptedData.categoryColumn}`}
                insightText={adaptedData.barTrend.text}
                insightSubText={adaptedData.barTrend.subText}
                insightUp={adaptedData.barTrend.isUp}
              />
            </ShowcaseCardWrapper>

            <ShowcaseCardWrapper title="Bar Chart - Horizontal" categoryName="Bar Chart" icon={BarChart3}>
              <BarChartHorizontal
                data={adaptedData.barData}
                config={adaptedData.barConfig}
                title="Bar Chart - Horizontal"
                description="Horizontal ranking layout"
                insightText={adaptedData.barTrend.text}
                insightSubText={adaptedData.barTrend.subText}
                insightUp={adaptedData.barTrend.isUp}
              />
            </ShowcaseCardWrapper>

            <ShowcaseCardWrapper title="Bar Chart - Multiple" categoryName="Bar Chart" icon={BarChart3}>
              <BarChartMultiple
                data={adaptedData.barData}
                config={adaptedData.barConfig}
                title="Bar Chart - Multiple"
                description={`${adaptedData.numericColumn1} & ${adaptedData.numericColumn2}`}
                insightText={adaptedData.barTrend.text}
                insightSubText={adaptedData.barTrend.subText}
                insightUp={adaptedData.barTrend.isUp}
              />
            </ShowcaseCardWrapper>

            <ShowcaseCardWrapper title="Bar Chart - Stacked" categoryName="Bar Chart" icon={BarChart3}>
              <BarChartStacked
                data={adaptedData.barData}
                config={adaptedData.barConfig}
                title="Bar Chart - Stacked"
                description="Stacked multi-series bars"
                insightText={adaptedData.barTrend.text}
                insightSubText={adaptedData.barTrend.subText}
                insightUp={adaptedData.barTrend.isUp}
              />
            </ShowcaseCardWrapper>

            <ShowcaseCardWrapper title="Bar Chart - Label" categoryName="Bar Chart" icon={BarChart3}>
              <BarChartLabel
                data={adaptedData.barData}
                config={adaptedData.barConfig}
                title="Bar Chart - Label"
                description="Direct value labels atop bars"
                insightText={adaptedData.barTrend.text}
                insightSubText={adaptedData.barTrend.subText}
                insightUp={adaptedData.barTrend.isUp}
              />
            </ShowcaseCardWrapper>

            <ShowcaseCardWrapper title="Bar Chart - Custom Label" categoryName="Bar Chart" icon={BarChart3}>
              <BarChartLabelCustom
                data={adaptedData.barData}
                config={adaptedData.barConfig}
                title="Bar Chart - Custom Label"
                description="Formatted metric positioning"
                insightText={adaptedData.barTrend.text}
                insightSubText={adaptedData.barTrend.subText}
                insightUp={adaptedData.barTrend.isUp}
              />
            </ShowcaseCardWrapper>

            <ShowcaseCardWrapper title="Bar Chart - Mixed" categoryName="Bar Chart" icon={BarChart3}>
              <BarChartMixed
                data={adaptedData.barData}
                config={adaptedData.barConfig}
                title="Bar Chart - Mixed"
                description="Color differentiated categories"
                insightText={adaptedData.barTrend.text}
                insightSubText={adaptedData.barTrend.subText}
                insightUp={adaptedData.barTrend.isUp}
              />
            </ShowcaseCardWrapper>

            <ShowcaseCardWrapper title="Bar Chart - Active" categoryName="Bar Chart" icon={BarChart3}>
              <BarChartActive
                data={adaptedData.barData}
                config={adaptedData.barConfig}
                title="Bar Chart - Active"
                description="Highlighted focal segment"
                insightText={adaptedData.barTrend.text}
                insightSubText={adaptedData.barTrend.subText}
                insightUp={adaptedData.barTrend.isUp}
              />
            </ShowcaseCardWrapper>

            <ShowcaseCardWrapper title="Bar Chart - Negative" categoryName="Bar Chart" icon={BarChart3}>
              <BarChartNegative
                data={adaptedData.barData}
                config={adaptedData.barConfig}
                title="Bar Chart - Negative"
                description="Deviations from dataset average"
                insightText={adaptedData.barTrend.text}
                insightSubText={adaptedData.barTrend.subText}
                insightUp={adaptedData.barTrend.isUp}
              />
            </ShowcaseCardWrapper>
          </div>
        </div>
      )}

      {/* ── LINE CHARTS ────────────────────────────────────────────────────── */}
      {activeCategory === 'line' && (
        <div className="space-y-6">
          {/* Featured Top Card */}
          <ShowcaseCardWrapper
            title="Line Chart - Interactive"
            categoryName="Line Chart"
            icon={LineIcon}
          >
            <LineChartInteractive
              data={adaptedData.lineData}
              config={adaptedData.lineConfig}
              title={`Line Chart - Interactive (${adaptedData.numericColumn1})`}
              description={`Continuous progression for ${adaptedData.datasetName}`}
            />
          </ShowcaseCardWrapper>

          {/* 3-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ShowcaseCardWrapper title="Line Chart" categoryName="Line Chart" icon={LineIcon}>
              <LineChartDefault
                data={adaptedData.lineData}
                config={adaptedData.lineConfig}
                title="Line Chart"
                description={`Sequential curve of ${adaptedData.numericColumn1}`}
                insightText={adaptedData.lineTrend.text}
                insightSubText={adaptedData.lineTrend.subText}
                insightUp={adaptedData.lineTrend.isUp}
              />
            </ShowcaseCardWrapper>

            <ShowcaseCardWrapper title="Line Chart - Linear" categoryName="Line Chart" icon={LineIcon}>
              <LineChartLinear
                data={adaptedData.lineData}
                config={adaptedData.lineConfig}
                title="Line Chart - Linear"
                description="Linear straight-segment trend"
                insightText={adaptedData.lineTrend.text}
                insightSubText={adaptedData.lineTrend.subText}
                insightUp={adaptedData.lineTrend.isUp}
              />
            </ShowcaseCardWrapper>

            <ShowcaseCardWrapper title="Line Chart - Step" categoryName="Line Chart" icon={LineIcon}>
              <LineChartStep
                data={adaptedData.lineData}
                config={adaptedData.lineConfig}
                title="Line Chart - Step"
                description="Discrete step changes"
                insightText={adaptedData.lineTrend.text}
                insightSubText={adaptedData.lineTrend.subText}
                insightUp={adaptedData.lineTrend.isUp}
              />
            </ShowcaseCardWrapper>

            <ShowcaseCardWrapper title="Line Chart - Multiple" categoryName="Line Chart" icon={LineIcon}>
              <LineChartMultiple
                data={adaptedData.lineData}
                config={adaptedData.lineConfig}
                title="Line Chart - Multiple"
                description="Dual metric comparative lines"
                insightText={adaptedData.lineTrend.text}
                insightSubText={adaptedData.lineTrend.subText}
                insightUp={adaptedData.lineTrend.isUp}
              />
            </ShowcaseCardWrapper>

            <ShowcaseCardWrapper title="Line Chart - Dots" categoryName="Line Chart" icon={LineIcon}>
              <LineChartDots
                data={adaptedData.lineData}
                config={adaptedData.lineConfig}
                title="Line Chart - Dots"
                description="Explicit data point markers"
                insightText={adaptedData.lineTrend.text}
                insightSubText={adaptedData.lineTrend.subText}
                insightUp={adaptedData.lineTrend.isUp}
              />
            </ShowcaseCardWrapper>

            <ShowcaseCardWrapper title="Line Chart - Custom Dots" categoryName="Line Chart" icon={LineIcon}>
              <LineChartCustomDots
                data={adaptedData.lineData}
                config={adaptedData.lineConfig}
                title="Line Chart - Custom Dots"
                description="Styled custom node markers"
                insightText={adaptedData.lineTrend.text}
                insightSubText={adaptedData.lineTrend.subText}
                insightUp={adaptedData.lineTrend.isUp}
              />
            </ShowcaseCardWrapper>

            <ShowcaseCardWrapper title="Line Chart - Dots Colors" categoryName="Line Chart" icon={LineIcon}>
              <LineChartDotsColors
                data={adaptedData.lineData}
                config={adaptedData.lineConfig}
                title="Line Chart - Dots Colors"
                description="Palette styled node dots"
                insightText={adaptedData.lineTrend.text}
                insightSubText={adaptedData.lineTrend.subText}
                insightUp={adaptedData.lineTrend.isUp}
              />
            </ShowcaseCardWrapper>

            <ShowcaseCardWrapper title="Line Chart - Label" categoryName="Line Chart" icon={LineIcon}>
              <LineChartLabel
                data={adaptedData.lineData}
                config={adaptedData.lineConfig}
                title="Line Chart - Label"
                description="Inline numerical point labels"
                insightText={adaptedData.lineTrend.text}
                insightSubText={adaptedData.lineTrend.subText}
                insightUp={adaptedData.lineTrend.isUp}
              />
            </ShowcaseCardWrapper>

            <ShowcaseCardWrapper title="Line Chart - Custom Label" categoryName="Line Chart" icon={LineIcon}>
              <LineChartCustomLabel
                data={adaptedData.lineData}
                config={adaptedData.lineConfig}
                title="Line Chart - Custom Label"
                description="Formatted positioning indicators"
                insightText={adaptedData.lineTrend.text}
                insightSubText={adaptedData.lineTrend.subText}
                insightUp={adaptedData.lineTrend.isUp}
              />
            </ShowcaseCardWrapper>
          </div>
        </div>
      )}

      {/* ── PIE CHARTS ─────────────────────────────────────────────────────── */}
      {activeCategory === 'pie' && (
        <div className="space-y-6">
          {/* Featured Top Card */}
          <ShowcaseCardWrapper
            title="Pie Chart - Interactive"
            categoryName="Pie Chart"
            icon={PieIcon}
          >
            <PieChartInteractive
              data={adaptedData.pieData}
              config={adaptedData.pieConfig}
              title={`Pie Chart - Interactive (${adaptedData.categoryColumn})`}
              description={`Interactive segment breakdown for ${adaptedData.datasetName}`}
            />
          </ShowcaseCardWrapper>

          {/* 3-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ShowcaseCardWrapper title="Pie Chart" categoryName="Pie Chart" icon={PieIcon}>
              <PieChartDefault
                data={adaptedData.pieData}
                config={adaptedData.pieConfig}
                title="Pie Chart"
                description={`Share of ${adaptedData.categoryColumn}`}
                insightText={adaptedData.pieTrend.text}
                insightSubText={adaptedData.pieTrend.subText}
                insightUp={adaptedData.pieTrend.isUp}
              />
            </ShowcaseCardWrapper>

            <ShowcaseCardWrapper title="Pie Chart - Donut" categoryName="Pie Chart" icon={PieIcon}>
              <PieChartDonut
                data={adaptedData.pieData}
                config={adaptedData.pieConfig}
                title="Pie Chart - Donut"
                description="Clean donut ring distribution"
                insightText={adaptedData.pieTrend.text}
                insightSubText={adaptedData.pieTrend.subText}
                insightUp={adaptedData.pieTrend.isUp}
              />
            </ShowcaseCardWrapper>

            <ShowcaseCardWrapper title="Pie Chart - Donut Active" categoryName="Pie Chart" icon={PieIcon}>
              <PieChartDonutActive
                data={adaptedData.pieData}
                config={adaptedData.pieConfig}
                title="Pie Chart - Donut Active"
                description="Highlighted primary slice"
                insightText={adaptedData.pieTrend.text}
                insightSubText={adaptedData.pieTrend.subText}
                insightUp={adaptedData.pieTrend.isUp}
              />
            </ShowcaseCardWrapper>

            <ShowcaseCardWrapper title="Pie Chart - Donut with Text" categoryName="Pie Chart" icon={PieIcon}>
              <PieChartDonutWithText
                data={adaptedData.pieData}
                config={adaptedData.pieConfig}
                title="Pie Chart - Donut with Text"
                description="Central total metrics counter"
                insightText={adaptedData.pieTrend.text}
                insightSubText={adaptedData.pieTrend.subText}
                insightUp={adaptedData.pieTrend.isUp}
              />
            </ShowcaseCardWrapper>

            <ShowcaseCardWrapper title="Pie Chart - Stacked" categoryName="Pie Chart" icon={PieIcon}>
              <PieChartStacked
                data={adaptedData.pieData}
                config={adaptedData.pieConfig}
                title="Pie Chart - Stacked"
                description="Multi-layer concentric rings"
                insightText={adaptedData.pieTrend.text}
                insightSubText={adaptedData.pieTrend.subText}
                insightUp={adaptedData.pieTrend.isUp}
              />
            </ShowcaseCardWrapper>

            <ShowcaseCardWrapper title="Pie Chart - Legend" categoryName="Pie Chart" icon={PieIcon}>
              <PieChartLegend
                data={adaptedData.pieData}
                config={adaptedData.pieConfig}
                title="Pie Chart - Legend"
                description="Interactive categorized legend"
                insightText={adaptedData.pieTrend.text}
                insightSubText={adaptedData.pieTrend.subText}
                insightUp={adaptedData.pieTrend.isUp}
              />
            </ShowcaseCardWrapper>

            <ShowcaseCardWrapper title="Pie Chart - Label" categoryName="Pie Chart" icon={PieIcon}>
              <PieChartLabel
                data={adaptedData.pieData}
                config={adaptedData.pieConfig}
                title="Pie Chart - Label"
                description="Outside indicator labels"
                insightText={adaptedData.pieTrend.text}
                insightSubText={adaptedData.pieTrend.subText}
                insightUp={adaptedData.pieTrend.isUp}
              />
            </ShowcaseCardWrapper>

            <ShowcaseCardWrapper title="Pie Chart - Label List" categoryName="Pie Chart" icon={PieIcon}>
              <PieChartLabelList
                data={adaptedData.pieData}
                config={adaptedData.pieConfig}
                title="Pie Chart - Label List"
                description="Inline percentage indicators"
                insightText={adaptedData.pieTrend.text}
                insightSubText={adaptedData.pieTrend.subText}
                insightUp={adaptedData.pieTrend.isUp}
              />
            </ShowcaseCardWrapper>

            <ShowcaseCardWrapper title="Pie Chart - Separator None" categoryName="Pie Chart" icon={PieIcon}>
              <PieChartSeparatorNone
                data={adaptedData.pieData}
                config={adaptedData.pieConfig}
                title="Pie Chart - Separator None"
                description="Seamless contiguous slice layout"
                insightText={adaptedData.pieTrend.text}
                insightSubText={adaptedData.pieTrend.subText}
                insightUp={adaptedData.pieTrend.isUp}
              />
            </ShowcaseCardWrapper>
          </div>
        </div>
      )}

      {/* ── RADAR CHARTS ───────────────────────────────────────────────────── */}
      {activeCategory === 'radar' && (
        <div className="space-y-6">
          {/* Featured Top Card */}
          <ShowcaseCardWrapper
            title="Radar Chart - Multiple"
            categoryName="Radar Chart"
            icon={Radar}
          >
            <RadarChartMultiple
              data={adaptedData.radarData}
              config={adaptedData.radarConfig}
              title={`Radar Chart - Comparison (${adaptedData.categoryColumn})`}
              description={`${adaptedData.numericColumn1} vs ${adaptedData.numericColumn2}`}
            />
          </ShowcaseCardWrapper>

          {/* 3-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ShowcaseCardWrapper title="Radar Chart" categoryName="Radar Chart" icon={Radar}>
              <RadarChartDefault
                data={adaptedData.radarData}
                config={adaptedData.radarConfig}
                title="Radar Chart"
                description={`Polar metrics for ${adaptedData.categoryColumn}`}
                insightText={adaptedData.radarTrend.text}
                insightSubText={adaptedData.radarTrend.subText}
                insightUp={adaptedData.radarTrend.isUp}
              />
            </ShowcaseCardWrapper>

            <ShowcaseCardWrapper title="Radar Chart - Dots" categoryName="Radar Chart" icon={Radar}>
              <RadarChartDots
                data={adaptedData.radarData}
                config={adaptedData.radarConfig}
                title="Radar Chart - Dots"
                description="Corner node markers"
                insightText={adaptedData.radarTrend.text}
                insightSubText={adaptedData.radarTrend.subText}
                insightUp={adaptedData.radarTrend.isUp}
              />
            </ShowcaseCardWrapper>

            <ShowcaseCardWrapper title="Radar Chart - Lines Only" categoryName="Radar Chart" icon={Radar}>
              <RadarChartLinesOnly
                data={adaptedData.radarData}
                config={adaptedData.radarConfig}
                title="Radar Chart - Lines Only"
                description="Outline polygons without fills"
                insightText={adaptedData.radarTrend.text}
                insightSubText={adaptedData.radarTrend.subText}
                insightUp={adaptedData.radarTrend.isUp}
              />
            </ShowcaseCardWrapper>

            <ShowcaseCardWrapper title="Radar Chart - Legend" categoryName="Radar Chart" icon={Radar}>
              <RadarChartLegend
                data={adaptedData.radarData}
                config={adaptedData.radarConfig}
                title="Radar Chart - Legend"
                description="Comparative series legend"
                insightText={adaptedData.radarTrend.text}
                insightSubText={adaptedData.radarTrend.subText}
                insightUp={adaptedData.radarTrend.isUp}
              />
            </ShowcaseCardWrapper>

            <ShowcaseCardWrapper title="Radar Chart - Custom Label" categoryName="Radar Chart" icon={Radar}>
              <RadarChartCustomLabel
                data={adaptedData.radarData}
                config={adaptedData.radarConfig}
                title="Radar Chart - Custom Label"
                description="Category vertex indicators"
                insightText={adaptedData.radarTrend.text}
                insightSubText={adaptedData.radarTrend.subText}
                insightUp={adaptedData.radarTrend.isUp}
              />
            </ShowcaseCardWrapper>

            <ShowcaseCardWrapper title="Radar Chart - Grid Circle" categoryName="Radar Chart" icon={Radar}>
              <RadarChartGridCircle
                data={adaptedData.radarData}
                config={adaptedData.radarConfig}
                title="Radar Chart - Grid Circle"
                description="Circular polar web grid"
                insightText={adaptedData.radarTrend.text}
                insightSubText={adaptedData.radarTrend.subText}
                insightUp={adaptedData.radarTrend.isUp}
              />
            </ShowcaseCardWrapper>

            <ShowcaseCardWrapper title="Radar Chart - Grid Circle Filled" categoryName="Radar Chart" icon={Radar}>
              <RadarChartGridCircleFilled
                data={adaptedData.radarData}
                config={adaptedData.radarConfig}
                title="Radar Chart - Grid Circle Filled"
                description="Concentric shaded web"
                insightText={adaptedData.radarTrend.text}
                insightSubText={adaptedData.radarTrend.subText}
                insightUp={adaptedData.radarTrend.isUp}
              />
            </ShowcaseCardWrapper>

            <ShowcaseCardWrapper title="Radar Chart - Grid Circle No Lines" categoryName="Radar Chart" icon={Radar}>
              <RadarChartGridCircleNoLines
                data={adaptedData.radarData}
                config={adaptedData.radarConfig}
                title="Radar Chart - Grid Circle No Lines"
                description="Clean perimeter circles"
                insightText={adaptedData.radarTrend.text}
                insightSubText={adaptedData.radarTrend.subText}
                insightUp={adaptedData.radarTrend.isUp}
              />
            </ShowcaseCardWrapper>

            <ShowcaseCardWrapper title="Radar Chart - Grid None" categoryName="Radar Chart" icon={Radar}>
              <RadarChartGridNone
                data={adaptedData.radarData}
                config={adaptedData.radarConfig}
                title="Radar Chart - Grid None"
                description="Minimalist floating polygon"
                insightText={adaptedData.radarTrend.text}
                insightSubText={adaptedData.radarTrend.subText}
                insightUp={adaptedData.radarTrend.isUp}
              />
            </ShowcaseCardWrapper>
          </div>
        </div>
      )}

      {/* ── RADIAL CHARTS ──────────────────────────────────────────────────── */}
      {activeCategory === 'radial' && (
        <div className="space-y-6">
          {/* Featured Top Card */}
          <ShowcaseCardWrapper
            title="Radial Chart - Text"
            categoryName="Radial Chart"
            icon={CircleDot}
          >
            <RadialChartText
              data={adaptedData.radialData}
              config={adaptedData.radialConfig}
              title={`Radial Chart - Top Segments (${adaptedData.categoryColumn})`}
              description={`Relative volume share for ${adaptedData.datasetName}`}
            />
          </ShowcaseCardWrapper>

          {/* 3-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ShowcaseCardWrapper title="Radial Chart" categoryName="Radial Chart" icon={CircleDot}>
              <RadialChartDefault
                data={adaptedData.radialData}
                config={adaptedData.radialConfig}
                title="Radial Chart"
                description={`Gauge representation for ${adaptedData.categoryColumn}`}
                insightText={adaptedData.radialTrend.text}
                insightSubText={adaptedData.radialTrend.subText}
                insightUp={adaptedData.radialTrend.isUp}
              />
            </ShowcaseCardWrapper>

            <ShowcaseCardWrapper title="Radial Chart - Label" categoryName="Radial Chart" icon={CircleDot}>
              <RadialChartLabel
                data={adaptedData.radialData}
                config={adaptedData.radialConfig}
                title="Radial Chart - Label"
                description="Per-segment radial progress arc"
                insightText={adaptedData.radialTrend.text}
                insightSubText={adaptedData.radialTrend.subText}
                insightUp={adaptedData.radialTrend.isUp}
              />
            </ShowcaseCardWrapper>

            <ShowcaseCardWrapper title="Radial Chart - Grid" categoryName="Radial Chart" icon={CircleDot}>
              <RadialChartGrid
                data={adaptedData.radialData}
                config={adaptedData.radialConfig}
                title="Radial Chart - Grid"
                description="Concentric background grid"
                insightText={adaptedData.radialTrend.text}
                insightSubText={adaptedData.radialTrend.subText}
                insightUp={adaptedData.radialTrend.isUp}
              />
            </ShowcaseCardWrapper>

            <ShowcaseCardWrapper title="Radial Chart - Shape" categoryName="Radial Chart" icon={CircleDot}>
              <RadialChartShape
                data={adaptedData.radialData}
                config={adaptedData.radialConfig}
                title="Radial Chart - Shape"
                description="Custom shaped arc sectors"
                insightText={adaptedData.radialTrend.text}
                insightSubText={adaptedData.radialTrend.subText}
                insightUp={adaptedData.radialTrend.isUp}
              />
            </ShowcaseCardWrapper>

            <ShowcaseCardWrapper title="Radial Bar Chart" categoryName="Radial Chart" icon={CircleDot}>
              <RadialBarChartDefault
                data={adaptedData.radialData}
                config={adaptedData.radialConfig}
                title="Radial Bar Chart"
                description="Comparative radial bar layout"
                insightText={adaptedData.radialTrend.text}
                insightSubText={adaptedData.radialTrend.subText}
                insightUp={adaptedData.radialTrend.isUp}
              />
            </ShowcaseCardWrapper>
          </div>
        </div>
      )}

      {/* ── TOOLTIPS ───────────────────────────────────────────────────────── */}
      {activeCategory === 'tooltips' && (
        <div className="space-y-6">
          {/* Featured Top Card */}
          <ShowcaseCardWrapper
            title="Tooltip - Advanced"
            categoryName="Tooltip Chart"
            icon={MessageSquare}
          >
            <TooltipChartAdvanced
              data={adaptedData.tooltipData}
              config={adaptedData.tooltipConfig}
              title={`Tooltip - Advanced Inspection (${adaptedData.numericColumn1})`}
              description={`Hover over data points to inspect detailed breakdown`}
            />
          </ShowcaseCardWrapper>

          {/* 3-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ShowcaseCardWrapper title="Tooltip - Default" categoryName="Tooltip Chart" icon={MessageSquare}>
              <TooltipChartDefault
                data={adaptedData.tooltipData}
                config={adaptedData.tooltipConfig}
                title="Tooltip - Default"
                description="Standard multi-metric tooltip"
                insightText={adaptedData.tooltipTrend.text}
                insightSubText={adaptedData.tooltipTrend.subText}
                insightUp={adaptedData.tooltipTrend.isUp}
              />
            </ShowcaseCardWrapper>

            <ShowcaseCardWrapper title="Tooltip - Line Indicator" categoryName="Tooltip Chart" icon={MessageSquare}>
              <TooltipChartLineIndicator
                data={adaptedData.tooltipData}
                config={adaptedData.tooltipConfig}
                title="Tooltip - Line Indicator"
                description="Vertical hover guideline"
                insightText={adaptedData.tooltipTrend.text}
                insightSubText={adaptedData.tooltipTrend.subText}
                insightUp={adaptedData.tooltipTrend.isUp}
              />
            </ShowcaseCardWrapper>

            <ShowcaseCardWrapper title="Tooltip - No Indicator" categoryName="Tooltip Chart" icon={MessageSquare}>
              <TooltipChartNoIndicator
                data={adaptedData.tooltipData}
                config={adaptedData.tooltipConfig}
                title="Tooltip - No Indicator"
                description="Floating contextual popover"
                insightText={adaptedData.tooltipTrend.text}
                insightSubText={adaptedData.tooltipTrend.subText}
                insightUp={adaptedData.tooltipTrend.isUp}
              />
            </ShowcaseCardWrapper>

            <ShowcaseCardWrapper title="Tooltip - Custom Label" categoryName="Tooltip Chart" icon={MessageSquare}>
              <TooltipChartCustomlabel
                data={adaptedData.tooltipData}
                config={adaptedData.tooltipConfig}
                title="Tooltip - Custom Label"
                description="Rich header formatting"
                insightText={adaptedData.tooltipTrend.text}
                insightSubText={adaptedData.tooltipTrend.subText}
                insightUp={adaptedData.tooltipTrend.isUp}
              />
            </ShowcaseCardWrapper>

            <ShowcaseCardWrapper title="Tooltip - Formatter" categoryName="Tooltip Chart" icon={MessageSquare}>
              <TooltipChartFormatter
                data={adaptedData.tooltipData}
                config={adaptedData.tooltipConfig}
                title="Tooltip - Formatter"
                description="Formatted currency and numeric units"
                insightText={adaptedData.tooltipTrend.text}
                insightSubText={adaptedData.tooltipTrend.subText}
                insightUp={adaptedData.tooltipTrend.isUp}
              />
            </ShowcaseCardWrapper>

            <ShowcaseCardWrapper title="Tooltip - Icons" categoryName="Tooltip Chart" icon={MessageSquare}>
              <TooltipChartIcons
                data={adaptedData.tooltipData}
                config={adaptedData.tooltipConfig}
                title="Tooltip - Icons"
                description="Series icon identifiers"
                insightText={adaptedData.tooltipTrend.text}
                insightSubText={adaptedData.tooltipTrend.subText}
                insightUp={adaptedData.tooltipTrend.isUp}
              />
            </ShowcaseCardWrapper>

            <ShowcaseCardWrapper title="Tooltip - No Label" categoryName="Tooltip Chart" icon={MessageSquare}>
              <TooltipChartNoLabel
                data={adaptedData.tooltipData}
                config={adaptedData.tooltipConfig}
                title="Tooltip - No Label"
                description="Compact value-only badges"
                insightText={adaptedData.tooltipTrend.text}
                insightSubText={adaptedData.tooltipTrend.subText}
                insightUp={adaptedData.tooltipTrend.isUp}
              />
            </ShowcaseCardWrapper>

            <ShowcaseCardWrapper title="Tooltip - Label Formatter" categoryName="Tooltip Chart" icon={MessageSquare}>
              <TooltipChartLabelFormatter
                data={adaptedData.tooltipData}
                config={adaptedData.tooltipConfig}
                title="Tooltip - Label Formatter"
                description="Custom chronological dates"
                insightText={adaptedData.tooltipTrend.text}
                insightSubText={adaptedData.tooltipTrend.subText}
                insightUp={adaptedData.tooltipTrend.isUp}
              />
            </ShowcaseCardWrapper>
          </div>
        </div>
      )}
    </div>
  );
}
