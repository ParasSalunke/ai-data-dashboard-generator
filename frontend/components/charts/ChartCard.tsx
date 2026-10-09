'use client';

import { memo, useMemo, useRef, useCallback } from 'react';
import type { ChartConfig as AppChartConfig } from '@/lib/types';
import { GripVertical, Download } from 'lucide-react';
import { type ChartConfig as ShadcnChartConfig } from '@/components/ui/chart';
import { ChartErrorBoundary } from './ChartErrorBoundary';

// Import our selected shadcn chart components

// Area Charts
import { AreaChartGradient } from '@/components/charts/area-charts/AreaChartGradient';
import { AreaChartLinear } from '@/components/charts/area-charts/AreaChartLinear';
import { AreaChartStep } from '@/components/charts/area-charts/AreaChartStep';
import { AreaChartStacked } from '@/components/charts/area-charts/AreaChartStacked';

// Bar Charts
import { BarChartDefault } from '@/components/charts/bar-charts/BarChartDefault';

// Line Charts
import { LineChartDefault } from '@/components/charts/line-charts/LineChartDefault';

// Scatter Charts
import { ScatterChartDefault } from '@/components/charts/scatter-charts/ScatterChartDefault';

// Pie Charts
import { PieChartDonutWithText } from '@/components/charts/pie-charts/PieChartDonutWithText';

// Radar Charts
import { RadarChartDefault } from '@/components/charts/radar-charts/RadarChartDefault';

// Radial Bar Charts
import { RadialBarChartDefault } from '@/components/charts/radial-charts/RadialBarChartDefault';


interface ChartCardProps {
    chart: AppChartConfig;
    isDragging?: boolean;
    dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
    compact?: boolean;
}

const CHART_TYPE_LABELS: Record<string, string> = {
    bar: 'Bar',
    histogram: 'Histogram',
    line: 'Line',
    area: 'Area',
    timeseries: 'Time Series',
    scatter: 'Scatter',
    pie: 'Pie',
    radar: 'Radar',
    radialbar: 'Radial',
};

function buildShadcnConfig(keys: string[], colors: string[]): ShadcnChartConfig {
    return Object.fromEntries(
        keys.map((k, i) => [
            k,
            { label: k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()), color: colors[i % colors.length] },
        ])
    );
}

function generateInsight(chart: AppChartConfig) {
    const { type, data } = chart;
    if (!data || data.length < 2) return null;

    try {
        if (type === 'area' || type === 'line' || type === 'timeseries') {
            const first = Number(data[0].value);
            const last = Number(data[data.length - 1].value);
            if (!isNaN(first) && !isNaN(last) && first !== 0) {
                const change = ((last - first) / Math.abs(first)) * 100;
                const isUp = change >= 0;
                return {
                    text: `Trending ${isUp ? 'up' : 'down'} by ${Math.abs(change).toFixed(1)}% over period`,
                    isUp,
                    subText: `Comparing first and last data points`
                };
            }
        } else if (type === 'bar' || type === 'histogram' || type === 'pie' || type === 'radialbar') {
            let maxVal = -Infinity;
            let maxCat = '';
            const valKey = type === 'histogram' ? 'count' : (type === 'pie' || type === 'radialbar' ? 'value' : 'count');
            const catKey = type === 'histogram' ? 'x' : (type === 'pie' || type === 'radialbar' ? 'name' : 'category');

            for (const d of data) {
                const v = Number(d[valKey]);
                if (!isNaN(v) && v > maxVal) {
                    maxVal = v;
                    maxCat = String(d[catKey]);
                }
            }
            if (maxVal !== -Infinity) {
                return {
                    text: `Highest value is ${maxCat}`,
                    isUp: true,
                    subText: `Top value: ${maxVal.toLocaleString()}`
                };
            }
        } else if (type === 'scatter') {
            const xVals = data.map(d => Number(d.x)).filter(v => !isNaN(v));
            const yVals = data.map(d => Number(d.y)).filter(v => !isNaN(v));
            if (xVals.length > 2 && yVals.length > 2) {
                return {
                    text: `${data.length} data points plotted`,
                    isUp: true,
                    subText: `X range: ${Math.min(...xVals).toLocaleString()} – ${Math.max(...xVals).toLocaleString()}`
                };
            }
        }
    } catch (e) {
        return null;
    }
    return null;
}

const ChartCard = memo(function ChartCard({
    chart,
    isDragging,
    dragHandleProps,
    compact,
}: ChartCardProps) {
    const { type, data, options, y_columns } = chart;
    const colors = options.colors?.length ? options.colors : ['#6366f1'];
    const chartRef = useRef<HTMLDivElement>(null);

    const insight = useMemo(() => generateInsight(chart), [chart]);

    const insightProps = {
        insightText: insight?.text,
        insightSubText: insight?.subText,
        insightUp: insight?.isUp,
    };

    const commonProps = {
        data: data,
        title: chart.title,
        description: `${CHART_TYPE_LABELS[chart.type] || chart.type} Chart`,
        compact,
        ...insightProps,
    };

    const handleDownloadPNG = useCallback(async () => {
        if (!chartRef.current) return;
        try {
            const html2canvas = (await import('html2canvas')).default;
            const canvas = await html2canvas(chartRef.current, {
                backgroundColor: null,
                scale: 2,
                logging: false,
            });
            const link = document.createElement('a');
            link.download = `${chart.title.replace(/\s+/g, '_').toLowerCase()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error('PNG export failed:', err);
        }
    }, [chart.title]);

    if (!data?.length) {
        return (
            <div className="flex h-40 items-center justify-center text-sm text-muted-foreground border border-border/60 rounded-xl bg-card/60">
                No data available
            </div>
        );
    }

    const renderInnerChart = () => {
        // ── AREA CHART ─────────────────────────────────────────────────────────
        if (type === 'area' || type === 'timeseries') {
            const keys = y_columns && y_columns.length > 0 ? y_columns : ['value'];
            const config = buildShadcnConfig(keys, colors);
            if (options?.variant === 'stacked' || keys.length > 1) {
                return <AreaChartStacked {...commonProps} config={config} />;
            } else if (options?.variant === 'linear') {
                return <AreaChartLinear {...commonProps} config={config} />;
            } else if (options?.variant === 'step') {
                return <AreaChartStep {...commonProps} config={config} />;
            }
            return <AreaChartGradient {...commonProps} config={config} />;
        }

        // ── BAR / HISTOGRAM CHART ─────────────────────────────────────────────
        if (type === 'bar' || type === 'histogram') {
            const config = buildShadcnConfig(['count'], colors);
            return <BarChartDefault {...commonProps} config={config} />;
        }

        // ── LINE CHART ─────────────────────────────────────────────────────────
        if (type === 'line') {
            const config = buildShadcnConfig(['value'], colors);
            return <LineChartDefault {...commonProps} config={config} />;
        }

        // ── SCATTER CHART ──────────────────────────────────────────────────────
        if (type === 'scatter') {
            const config = buildShadcnConfig(['y'], colors);
            return <ScatterChartDefault {...commonProps} config={config} />;
        }

        // ── PIE / DONUT CHART ──────────────────────────────────────────────────
        if (type === 'pie') {
            const pieKeys = data.map((d) => String(d.name));
            const config = buildShadcnConfig(pieKeys, colors);
            const processedData = data.map((d, i) => ({ ...d, fill: colors[i % colors.length] }));
            return <PieChartDonutWithText {...commonProps} data={processedData} config={config} />;
        }

        // ── RADIAL BAR CHART ───────────────────────────────────────────────────
        if (type === 'radialbar') {
            const radialKeys = data.map((d) => String(d.name));
            const config = buildShadcnConfig(radialKeys, colors);
            const processedData = data.map((d, i) => ({ ...d, fill: colors[i % colors.length] }));
            return <RadialBarChartDefault {...commonProps} data={processedData} config={config} />;
        }

        // ── RADAR CHART ────────────────────────────────────────────────────────
        if (type === 'radar') {
            const seriesKeys = y_columns ?? [];
            const config = buildShadcnConfig(seriesKeys, colors);
            return <RadarChartDefault {...commonProps} config={config} />;
        }

        // Fallback if type not matched
        const config = buildShadcnConfig(['value'], colors);
        return <BarChartDefault {...commonProps} config={config} />;
    };

    return (
        <div ref={chartRef} data-chart-export-id={chart.id} className={`export-chart-card group relative h-full transition-all duration-200 ${isDragging ? 'scale-105 opacity-80' : ''}`}>
            <ChartErrorBoundary chartTitle={chart.title}>
                {renderInnerChart()}
            </ChartErrorBoundary>

            {/* Action buttons — top right on hover */}
            {!compact && (
                <div className="absolute right-4 top-4 z-10 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    {/* PNG Download */}
                    <button
                        onClick={(e) => { e.stopPropagation(); handleDownloadPNG(); }}
                        className="cursor-pointer rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground bg-background/50 backdrop-blur"
                        title="Download as PNG"
                    >
                        <Download className="h-4 w-4" />
                    </button>
                    {/* Drag handle */}
                    <div
                        {...dragHandleProps}
                        className="cursor-grab rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground active:cursor-grabbing bg-background/50 backdrop-blur"
                        title="Drag to reorder"
                    >
                        <GripVertical className="h-4 w-4" />
                    </div>
                </div>
            )}
        </div>
    );
});

export default ChartCard;
