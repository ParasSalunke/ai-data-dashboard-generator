"use client"

import * as React from "react"
import { Label, Pie, PieChart, Sector } from "recharts"
import type {
  PieSectorShapeProps,
} from "recharts/types/polar/Pie"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { DynamicChartProps } from "../types"

export const description = "An interactive pie chart"

const defaultDesktopData = [
  { month: "january", desktop: 186, fill: "var(--color-january)" },
  { month: "february", desktop: 305, fill: "var(--color-february)" },
  { month: "march", desktop: 237, fill: "var(--color-march)" },
  { month: "april", desktop: 173, fill: "var(--color-april)" },
  { month: "may", desktop: 209, fill: "var(--color-may)" },
]

const defaultChartConfig = {
  visitors: {
    label: "Visitors",
  },
  desktop: {
    label: "Desktop",
  },
  mobile: {
    label: "Mobile",
  },
  january: {
    label: "January",
    color: "var(--chart-1)",
  },
  february: {
    label: "February",
    color: "var(--chart-2)",
  },
  march: {
    label: "March",
    color: "var(--chart-3)",
  },
  april: {
    label: "April",
    color: "var(--chart-4)",
  },
  may: {
    label: "May",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig

export function PieChartInteractive({
  data,
  config,
  title,
  description: customDesc,
}: DynamicChartProps = {}) {
  const chartData = data && data.length > 0 ? data : defaultDesktopData
  const activeConfig = config || defaultChartConfig
  const id = "pie-interactive"

  const getSliceKey = (item: Record<string, unknown>) => {
    return String(item.browser || item.month || item.name || Object.values(item)[0] || "item")
  }

  const [activeItem, setActiveItem] = React.useState<string>(() => {
    return chartData.length > 0 ? getSliceKey(chartData[0] as Record<string, unknown>) : "january"
  })

  React.useEffect(() => {
    if (chartData.length > 0) {
      setActiveItem(getSliceKey(chartData[0] as Record<string, unknown>))
    }
  }, [data])

  const activeIndex = React.useMemo(() => {
    const idx = chartData.findIndex((item) => getSliceKey(item as Record<string, unknown>) === activeItem)
    return idx >= 0 ? idx : 0
  }, [activeItem, chartData])

  const sliceKeys = React.useMemo(
    () => chartData.map((item) => getSliceKey(item as Record<string, unknown>)),
    [chartData]
  )

  const renderPieShape = React.useCallback(
    ({ index, outerRadius = 0, ...props }: PieSectorShapeProps) => {
      if (index === activeIndex) {
        return (
          <g>
            <Sector {...props} outerRadius={outerRadius + 10} />
            <Sector
              {...props}
              outerRadius={outerRadius + 25}
              innerRadius={outerRadius + 12}
            />
          </g>
        )
      }

      return <Sector {...props} outerRadius={outerRadius} />
    },
    [activeIndex]
  )

  const first = (chartData[0] || {}) as Record<string, unknown>
  const valueKey = first.visitors !== undefined ? "visitors" : first.desktop !== undefined ? "desktop" : "value"
  const nameKey = first.browser !== undefined ? "browser" : first.month !== undefined ? "month" : "name"
  const activeVal = (chartData[activeIndex] as Record<string, unknown>)?.[valueKey] ?? 0

  return (
    <Card data-chart={id} className="flex flex-col">
      <ChartStyle id={id} config={activeConfig} />
      <CardHeader className="flex-row items-start space-y-0 pb-0">
        <div className="grid gap-1">
          <CardTitle>{title || "Pie Chart - Interactive"}</CardTitle>
          <CardDescription>{customDesc || "Category Breakdown"}</CardDescription>
        </div>
        <Select value={activeItem} onValueChange={setActiveItem}>
          <SelectTrigger
            className="ml-auto h-7 w-36 rounded-lg pl-2.5"
            aria-label="Select segment"
          >
            <SelectValue placeholder="Select segment" />
          </SelectTrigger>
          <SelectContent align="end" className="rounded-xl">
            {sliceKeys.map((key) => {
              const cfg = activeConfig[key as keyof typeof activeConfig]
              const label = cfg?.label || key
              return (
                <SelectItem
                  key={key}
                  value={key}
                  className="rounded-lg [&_span]:flex"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className="flex h-3 w-3 shrink-0 rounded-xs"
                      style={{
                        backgroundColor: `var(--color-${key})`,
                      }}
                    />
                    {label}
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex flex-1 justify-center pb-0">
        <ChartContainer
          id={id}
          config={activeConfig}
          className="mx-auto aspect-square w-full max-w-[300px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey={valueKey}
              nameKey={nameKey}
              innerRadius={60}
              strokeWidth={5}
              shape={renderPieShape}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {Number(activeVal).toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          {activeItem}
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
