"use client"

import { TrendingUp, TrendingDown } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"

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

export function LineChartDefault({
  data,
  config,
  title,
  description,
  insightText,
  insightSubText,
  insightUp,
  compact
}: DynamicChartProps) {
  const dataKey = Object.keys(config)[0] || "value"

  return (
    <Card className="h-full flex flex-col group relative overflow-hidden border-border/60 bg-card/60 backdrop-blur-sm transition-all duration-200 hover:border-border hover:shadow-md hover:shadow-black/20">
      <CardHeader className="pb-4">
        <CardTitle>{title || "Line Chart"}</CardTitle>
        {!compact && <CardDescription>{description || "Line chart representation"}</CardDescription>}
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={config} className="w-full" style={{ height: compact ? 160 : 250 }}>
          <LineChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => String(value).slice(0, 10)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Line
              dataKey={dataKey}
              type="natural"
              stroke={`var(--color-${dataKey})`}
              strokeWidth={2}
              dot={{ fill: `var(--color-${dataKey})` }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
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
