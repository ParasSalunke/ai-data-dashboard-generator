"use client"

import * as React from "react"
import { TrendingUp, TrendingDown } from "lucide-react"
import { RadialBar, RadialBarChart, PolarAngleAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { DynamicChartProps } from "../area-charts/AreaChartGradient"

export function RadialBarChartDefault({
  data,
  config,
  title,
  description,
  insightText,
  insightSubText,
  insightUp,
  compact
}: DynamicChartProps) {
  const totalValue = React.useMemo(() => {
    return data.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0)
  }, [data])

  // Add fill colors from config or data if present
  const chartData = React.useMemo(() => {
    return data.map((d, i) => ({
      ...d,
      fill: d.fill || `var(--color-${String(d.name).toLowerCase().replace(/\s+/g, '_')})`,
    }))
  }, [data])

  return (
    <Card className="h-full flex flex-col group relative overflow-hidden border-border/60 bg-card/60 backdrop-blur-sm transition-all duration-200 hover:border-border hover:shadow-md hover:shadow-black/20">
      <CardHeader className="items-center pb-0">
        <CardTitle>{title || "Radial Bar Chart"}</CardTitle>
        {!compact && <CardDescription>{description || "Radial bar chart representation"}</CardDescription>}
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={config}
          className="mx-auto aspect-square max-h-[250px] w-full"
        >
          <RadialBarChart
            data={chartData}
            innerRadius={compact ? 25 : 40}
            outerRadius={compact ? 75 : 110}
            startAngle={180}
            endAngle={-180}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, Math.max(...data.map(d => Number(d.value) || 0)) * 1.1]}
              angleAxisId={0}
              tick={false}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel nameKey="name" />}
            />
            <RadialBar
              dataKey="value"
              background={{ fill: "hsl(var(--muted) / 0.3)" }}
              cornerRadius={compact ? 4 : 6}
            />
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      {!compact && insightText && (
        <CardFooter className="flex-col gap-2 text-sm pt-4 border-t border-border/40 mt-4">
          <div className="flex items-center gap-2 leading-none font-medium">
            {insightText}
            {insightUp ? <TrendingUp className="h-4 w-4 text-emerald-500" /> : <TrendingDown className="h-4 w-4 text-rose-500" />}
          </div>
          {insightSubText && (
            <div className="leading-none text-muted-foreground">
              {insightSubText}
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  )
}
