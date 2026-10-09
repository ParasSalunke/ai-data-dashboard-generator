"use client"

import { TrendingUp, TrendingDown } from "lucide-react"
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart } from "recharts"

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

export function RadarChartDefault({
  data,
  config,
  title,
  description,
  insightText,
  insightSubText,
  insightUp,
  compact
}: DynamicChartProps) {
  // Config has all the keys we need to plot
  const keys = Object.keys(config)

  return (
    <Card className="h-full flex flex-col group relative overflow-hidden border-border/60 bg-card/60 backdrop-blur-sm transition-all duration-200 hover:border-border hover:shadow-md hover:shadow-black/20">
      <CardHeader className="items-center pb-4">
        <CardTitle>{title || "Radar Chart"}</CardTitle>
        {!compact && <CardDescription>{description || "Radar chart representation"}</CardDescription>}
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer
          config={config}
          className="mx-auto aspect-square max-h-[250px] w-full"
        >
          <RadarChart data={data}>
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <PolarAngleAxis dataKey="category" />
            <PolarGrid className="fill-muted/20" />
            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
            {keys.map((key) => (
              <Radar
                key={key}
                dataKey={key}
                fill={`var(--color-${key})`}
                fillOpacity={0.4}
                stroke={`var(--color-${key})`}
                strokeWidth={2}
              />
            ))}
          </RadarChart>
        </ChartContainer>
      </CardContent>
      {!compact && insightText && (
        <CardFooter className="flex-col gap-2 text-sm pt-4 border-t border-border/40 mt-4">
          <div className="flex items-center gap-2 leading-none font-medium">
            {insightText}
            {insightUp ? <TrendingUp className="h-4 w-4 text-emerald-500" /> : <TrendingDown className="h-4 w-4 text-rose-500" />}
          </div>
          {insightSubText && (
            <div className="flex items-center gap-2 leading-none text-muted-foreground">
              {insightSubText}
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  )
}
