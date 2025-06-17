"use client"

import { TrendingUp } from "lucide-react"
import { Pie, PieChart, Sector } from "recharts"
import type { PieSectorDataItem } from "recharts"


import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartData = [
  { product: "Camisa Casual", sales: 275, fill: "var(--color-camisa)" },
  { product: "Pantalón Jean", sales: 200, fill: "var(--color-pantalon)" },
  { product: "Zapatillas Deportivas", sales: 187, fill: "var(--color-zapatillas)" },
  { product: "Chompa de Lana", sales: 173, fill: "var(--color-chompa)" },
  { product: "Accesorio X", sales: 90, fill: "var(--color-accesorio)" },
]

const chartConfig = {
  sales: {
    label: "Ventas",
  },
  camisa: {
    label: "Camisa Casual",
    color: "hsl(var(--chart-1))",
  },
  pantalon: {
    label: "Pantalón Jean",
    color: "hsl(var(--chart-2))",
  },
  zapatillas: {
    label: "Zapatillas Deportivas",
    color: "hsl(var(--chart-3))",
  },
  chompa: {
    label: "Chompa de Lana",
    color: "hsl(var(--chart-4))",
  },
  accesorio: {
    label: "Accesorio X",
    color: "hsl(var(--chart-5))",
  },
}

export function ProductPopularityChart() {
  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square h-[300px]"
    >
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={chartData}
          dataKey="sales"
          nameKey="product"
          innerRadius={60}
          strokeWidth={5}
          activeIndex={0}
          activeShape={({ outerRadius = 0, ...props }: PieSectorDataItem) => (
            <Sector {...props} outerRadius={outerRadius + 10} />
          )}
        />
      </PieChart>
    </ChartContainer>
  )
}
