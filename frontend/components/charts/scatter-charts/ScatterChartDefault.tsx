"use client"

import { TrendingUp, TrendingDown } from "lucide-react"
import { CartesianGrid, Scatter, ScatterChart, XAxis, YAxis, ZAxis } from "recharts"

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

export function ScatterChartDefault({
  data,
  config,
  title,
  description,
  insightText,
  insightSubText,
  insightUp,
  compact
}: DynamicChartProps) {
  const keys = Object.keys(config)
  const dataKey = keys[0] || "y"

  return (
    <Card className="h-full flex flex-col group relative overflow-hidden border-border/60 bg-card/60 backdrop-blur-sm transition-all duration-200 hover:border-border hover:shadow-md hover:shadow-black/20">
      <CardHeader className="pb-4">
        <CardTitle>{title || "Scatter Plot"}</CardTitle>
        {!compact && <CardDescription>{description || "Scatter chart representation"}</CardDescription>}
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={config} className="w-full" style={{ height: compact ? 160 : 250 }}>
          <ScatterChart
            accessibilityLayer
            margin={{ top: 12, right: 12, bottom: 12, left: 12 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="x"
              name="X"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(1)}k`
                return Number(value).toFixed(1)
              }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="Y"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                if (Math.abs(value) >= 1000) return `${(value / 1000).toFixed(1)}k`
                return Number(value).toFixed(1)
              }}
            />
            <ZAxis range={[40, 80]} />
            <ChartTooltip
              cursor={{ strokeDasharray: "3 3" }}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Scatter
              data={data}
              fill={`var(--color-${dataKey})`}
              fillOpacity={0.7}
              strokeWidth={1}
              stroke={`var(--color-${dataKey})`}
            />
          </ScatterChart>
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
