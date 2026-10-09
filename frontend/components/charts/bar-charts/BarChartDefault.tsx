"use client"

import { TrendingUp, TrendingDown } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

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
  type ChartConfig,
} from "@/components/ui/chart"
import { DynamicChartProps } from "../area-charts/AreaChartGradient"

export function BarChartDefault({
  data,
  config,
  title,
  description,
  insightText,
  insightSubText,
  insightUp,
  compact
}: DynamicChartProps) {
  const dataKey = Object.keys(config)[0] || "count"
  // If data uses 'x' instead of 'category' (like histogram), find out
  const xAxisKey = data.length > 0 && data[0].x !== undefined ? "x" : "category"

  return (
    <Card className="h-full flex flex-col group relative overflow-hidden border-border/60 bg-card/60 backdrop-blur-sm transition-all duration-200 hover:border-border hover:shadow-md hover:shadow-black/20">
      <CardHeader className="pb-4">
        <CardTitle>{title || "Bar Chart"}</CardTitle>
        {!compact && <CardDescription>{description || "Bar chart representation"}</CardDescription>}
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={config} className="w-full" style={{ height: compact ? 160 : 250 }}>
          <BarChart accessibilityLayer data={data} margin={{ top: 12, right: 12, bottom: 12, left: 12 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey={xAxisKey}
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => String(value).slice(0, 10)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel={false} />}
            />
            <Bar dataKey={dataKey} fill={`var(--color-${dataKey})`} radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      {!compact && insightText && (
        <CardFooter className="flex-col items-start gap-2 text-sm pt-4 border-t border-border/40 mt-4">
          <div className="flex gap-2 leading-none font-medium">
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
