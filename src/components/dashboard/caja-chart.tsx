
"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartConfig = {
  total: {
    label: "Total (S/)",
  },
  ingresos: {
    label: "Ingresos",
    color: "hsl(var(--chart-1))",
  },
  devoluciones: {
    label: "Devoluciones",
    color: "hsl(var(--chart-3))",
  },
  gastos: {
    label: "Gastos",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function CajaChart({ data }: { data: any[] }) {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="name"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
         <YAxis
          tickFormatter={(value) => `S/${value}`}
        />
        <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="dot" />}
        />
        <Bar dataKey="total" radius={4} />
      </BarChart>
    </ChartContainer>
  )
}
