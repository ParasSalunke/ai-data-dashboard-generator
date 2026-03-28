'use client';

import { memo, useRef } from 'react';
import type { ChartConfig as AppChartConfig } from '@/lib/types';
import {
  BarChart, Bar,
  AreaChart, Area,
  LineChart, Line,
  ScatterChart, Scatter,
  PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  RadialBarChart, RadialBar,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig as ShadcnChartConfig,
} from '@/components/ui/chart';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GripVertical } from 'lucide-react';

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

// Badge color per chart type
const CHART_TYPE_BADGE: Record<string, string> = {
  bar: 'border-violet-500/40 bg-violet-500/10 text-violet-400',
  histogram: 'border-blue-500/40 bg-blue-500/10 text-blue-400',
  line: 'border-sky-500/40 bg-sky-500/10 text-sky-400',
  area: 'border-teal-500/40 bg-teal-500/10 text-teal-400',
  timeseries: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400',
  scatter: 'border-indigo-500/40 bg-indigo-500/10 text-indigo-400',
  pie: 'border-pink-500/40 bg-pink-500/10 text-pink-400',
  radar: 'border-purple-500/40 bg-purple-500/10 text-purple-400',
  radialbar: 'border-orange-500/40 bg-orange-500/10 text-orange-400',
};

/** Build a shadcn ChartConfig from our color array and key list */
function buildShadcnConfig(keys: string[], colors: string[]): ShadcnChartConfig {
  return Object.fromEntries(
    keys.map((k, i) => [
      k,
      { label: k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()), color: colors[i % colors.length] },
    ])
  );
}

/** Renders the inner recharts component based on chart type */
function ChartRenderer({ chart, compact }: { chart: AppChartConfig; compact?: boolean }) {
  const { type, data, options, x_column, y_columns } = chart;
  const colors = options.colors?.length ? options.colors : ['#6366f1'];
  const height = compact ? 160 : 240;

  if (!data?.length) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
        No data available
      </div>
    );
  }

  // ── BAR CHART ──────────────────────────────────────────────────────────
  if (type === 'bar') {
    const cfg = buildShadcnConfig(['count'], colors);
    return (
      <ChartContainer config={cfg} className={`w-full`} style={{ height }}>
        <BarChart data={data} margin={{ top: 4, right: 8, bottom: 28, left: 4 }}>
          {options.showGrid && <CartesianGrid vertical={false} strokeDasharray="3 3" />}
          <XAxis
            dataKey="category"
            tickLine={false}
            axisLine={false}
            angle={-30}
            textAnchor="end"
            interval="preserveStartEnd"
            tick={{ fontSize: 11 }}
          />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="count" fill="var(--color-count)" radius={[5, 5, 0, 0]} />
        </BarChart>
      </ChartContainer>
    );
  }

  // ── HISTOGRAM ──────────────────────────────────────────────────────────
  if (type === 'histogram') {
    const cfg = buildShadcnConfig(['count'], colors);
    return (
      <ChartContainer config={cfg} className="w-full" style={{ height }}>
        <BarChart data={data} margin={{ top: 4, right: 8, bottom: 8, left: 4 }} barCategoryGap="2%">
          {options.showGrid && <CartesianGrid vertical={false} strokeDasharray="3 3" />}
          <XAxis
            dataKey="x"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 10 }}
            tickFormatter={(v) => (typeof v === 'number' ? v.toLocaleString() : v)}
          />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
          <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
          <Bar dataKey="count" fill="var(--color-count)" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ChartContainer>
    );
  }

  // ── AREA CHART ─────────────────────────────────────────────────────────
  if (type === 'area' || type === 'timeseries') {
    const cfg = buildShadcnConfig(['value'], colors);
    return (
      <ChartContainer config={cfg} className="w-full" style={{ height }}>
        <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 8, left: 4 }}>
          <defs>
            <linearGradient id={`grad-${chart.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors[0]} stopOpacity={0.25} />
              <stop offset="95%" stopColor={colors[0]} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          {options.showGrid && <CartesianGrid vertical={false} strokeDasharray="3 3" />}
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 10 }}
            interval="preserveStartEnd"
          />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
          <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
          {options.showLegend && <ChartLegend content={<ChartLegendContent />} />}
          <Area
            type="monotone"
            dataKey="value"
            stroke={colors[0]}
            strokeWidth={2}
            fill={`url(#grad-${chart.id})`}
            dot={false}
          />
        </AreaChart>
      </ChartContainer>
    );
  }

  // ── LINE CHART ─────────────────────────────────────────────────────────
  if (type === 'line') {
    const cfg = buildShadcnConfig(['value'], colors);
    return (
      <ChartContainer config={cfg} className="w-full" style={{ height }}>
        <LineChart data={data} margin={{ top: 4, right: 8, bottom: 8, left: 4 }}>
          {options.showGrid && <CartesianGrid vertical={false} strokeDasharray="3 3" />}
          <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} interval="preserveStartEnd" />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
          <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
          {options.showLegend && <ChartLegend content={<ChartLegendContent />} />}
          <Line type="monotone" dataKey="value" stroke={colors[0]} strokeWidth={2} dot={false} />
        </LineChart>
      </ChartContainer>
    );
  }

  // ── SCATTER CHART ──────────────────────────────────────────────────────
  if (type === 'scatter') {
    const cfg = buildShadcnConfig(['x', 'y'], [colors[0], colors[0]]);
    return (
      <ChartContainer config={cfg} className="w-full" style={{ height }}>
        <ScatterChart margin={{ top: 4, right: 8, bottom: 8, left: 4 }}>
          {options.showGrid && <CartesianGrid strokeDasharray="3 3" />}
          <XAxis
            dataKey="x"
            name={x_column || 'X'}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 10 }}
            type="number"
          />
          <YAxis
            dataKey="y"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 10 }}
            type="number"
          />
          <ChartTooltip
            cursor={{ strokeDasharray: '3 3' }}
            content={<ChartTooltipContent indicator="dot" />}
          />
          <Scatter data={data} fill={colors[0]} opacity={0.75} />
        </ScatterChart>
      </ChartContainer>
    );
  }

  // ── PIE / DONUT CHART ──────────────────────────────────────────────────
  if (type === 'pie') {
    const pieKeys = data.map((d) => String(d.name));
    const cfg = buildShadcnConfig(pieKeys, colors);
    return (
      <ChartContainer config={cfg} className="w-full" style={{ height }}>
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent nameKey="name" indicator="dot" />} />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={compact ? 55 : 80}
            innerRadius={compact ? 24 : 40}
            paddingAngle={3}
            strokeWidth={2}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={colors[i % colors.length]} className="stroke-background" />
            ))}
          </Pie>
          {options.showLegend && !compact && (
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(value) => (
                <span className="text-[11px] text-muted-foreground">{value}</span>
              )}
            />
          )}
        </PieChart>
      </ChartContainer>
    );
  }

  // ── RADAR CHART ────────────────────────────────────────────────────────
  if (type === 'radar') {
    const seriesKeys = y_columns ?? [];
    const cfg = buildShadcnConfig(seriesKeys, colors);
    return (
      <ChartContainer config={cfg} className="w-full" style={{ height }}>
        <RadarChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 16 }}>
          <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
          <PolarGrid />
          <PolarAngleAxis
            dataKey="category"
            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
            tickCount={3}
          />
          {seriesKeys.map((key, i) => (
            <Radar
              key={key}
              name={key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
              dataKey={key}
              stroke={colors[i % colors.length]}
              fill={colors[i % colors.length]}
              fillOpacity={0.15}
              strokeWidth={2}
            />
          ))}
          {options.showLegend && !compact && <ChartLegend content={<ChartLegendContent />} />}
        </RadarChart>
      </ChartContainer>
    );
  }

  // ── RADIAL BAR CHART ───────────────────────────────────────────────────
  if (type === 'radialbar') {
    const cfg: ShadcnChartConfig = Object.fromEntries(
      data.map((d) => [
        String(d.name),
        { label: String(d.name), color: String(d.fill ?? colors[0]) },
      ])
    );
    return (
      <ChartContainer config={cfg} className="w-full" style={{ height }}>
        <RadialBarChart
          data={data}
          innerRadius={compact ? 20 : 30}
          outerRadius={compact ? 70 : 110}
          startAngle={180}
          endAngle={-180}
          barSize={compact ? 10 : 16}
        >
          <ChartTooltip
            content={
              <ChartTooltipContent
                nameKey="name"
                indicator="dot"
                formatter={(value, name) => (
                  <div className="flex gap-2 text-xs">
                    <span className="text-muted-foreground">{name}</span>
                    <span className="font-mono font-medium">{value}</span>
                  </div>
                )}
              />
            }
          />
          <RadialBar
            background
            dataKey="value"
            label={compact ? false : { position: 'insideStart', fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={String(entry.fill ?? colors[i % colors.length])} />
            ))}
          </RadialBar>
          {options.showLegend && !compact && (
            <Legend
              iconSize={8}
              iconType="circle"
              formatter={(value) => (
                <span className="text-[11px] text-muted-foreground">{value}</span>
              )}
            />
          )}
        </RadialBarChart>
      </ChartContainer>
    );
  }

  return null;
}

const ChartCard = memo(function ChartCard({
  chart,
  isDragging,
  dragHandleProps,
  compact,
}: ChartCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const badgeCls = CHART_TYPE_BADGE[chart.type] ?? 'border-border/50 text-muted-foreground';

  return (
    <Card
      ref={cardRef}
      className={`group relative flex flex-col overflow-hidden border border-border/60 bg-card/60 backdrop-blur-sm transition-all duration-200
        ${isDragging
          ? 'scale-105 shadow-2xl shadow-violet-500/20 ring-2 ring-violet-500/40'
          : 'hover:border-border hover:shadow-md hover:shadow-black/20'
        }`}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-1 pr-3 pt-3">
        <div className="flex-1 min-w-0 pr-2">
          <CardTitle className="truncate text-sm font-semibold text-foreground leading-tight">
            {chart.title}
          </CardTitle>
          <Badge
            variant="outline"
            className={`mt-1.5 text-[10px] px-1.5 py-0 h-4 border ${badgeCls}`}
          >
            {CHART_TYPE_LABELS[chart.type] || chart.type}
          </Badge>
        </div>

        {/* Drag handle — only shown in full (non-compact) mode */}
        {!compact && (
          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <div
              {...dragHandleProps}
              className="cursor-grab rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground active:cursor-grabbing"
              title="Drag to reorder"
            >
              <GripVertical className="h-4 w-4" />
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 pb-3 pt-0">
        <ChartRenderer chart={chart} compact={compact} />
      </CardContent>
    </Card>
  );
});

export default ChartCard;
