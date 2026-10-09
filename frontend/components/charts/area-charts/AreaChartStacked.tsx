"use client"

import { TrendingUp, TrendingDown } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

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

export interface DynamicChartProps {
  data: any[]
  config: ChartConfig
  title?: string
  description?: string
  insightText?: string | null
  insightSubText?: string | null
  insightUp?: boolean
  compact?: boolean
}

export function AreaChartStacked({
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

  return (
    <Card className="h-full flex flex-col group relative overflow-hidden border-border/60 bg-card/60 backdrop-blur-sm transition-all duration-200 hover:border-border hover:shadow-md hover:shadow-black/20">
      <CardHeader className="pb-4">
        <CardTitle>{title || "Area Chart - Stacked"}</CardTitle>
        {!compact && <CardDescription>{description || "Stacked area chart representation"}</CardDescription>}
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={config} className="w-full" style={{ height: compact ? 160 : 250 }}>
          <AreaChart
            accessibilityLayer
            data={data}
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => String(value).slice(0, 10)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
            {keys.map((key) => (
              <Area
                key={key}
                dataKey={key}
                type="natural"
                fill={`var(--color-${key})`}
                fillOpacity={0.4}
                stroke={`var(--color-${key})`}
                stackId="a"
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        </ChartContainer>
      </CardContent>
      {!compact && insightText && (
        <CardFooter>
          <div className="flex w-full items-start gap-2 text-sm pt-4 border-t border-border/40 mt-4">
            <div className="grid gap-2">
              <div className="flex items-center gap-2 leading-none font-medium">
                {insightText}
                {insightUp ? <TrendingUp className="h-4 w-4 text-emerald-500" /> : <TrendingDown className="h-4 w-4 text-rose-500" />}
              </div>
              {insightSubText && (
                <div className="flex items-center gap-2 leading-none text-muted-foreground">
                  {insightSubText}
                </div>
              )}
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}
