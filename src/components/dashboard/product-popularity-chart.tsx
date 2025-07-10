"use client"

import React, { useMemo } from "react";
import { Pie, PieChart, Sector, Cell } from "recharts"
import type { PieSectorDataItem } from "recharts"
import * as _ from "lodash";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const initialChartData = [
  { category: "Ropa", salesValue: 320, trendPercentage: "+12%", colorName: "ropa" },
  { category: "Electrónicos", salesValue: 280, trendPercentage: "+8%", colorName: "electronicos" },
  { category: "Hogar", salesValue: 200, trendPercentage: "-5%", colorName: "hogar" },
  { category: "Servicios", salesValue: 150, trendPercentage: "+20%", colorName: "servicios" },
  { category: "Otros", salesValue: 90, trendPercentage: "+2%", colorName: "otros" },
];

const chartConfig = {
  salesValue: {
    label: "Ventas",
  },
  ropa: {
    label: "Ropa",
    color: "hsl(var(--chart-1))",
  },
  electronicos: {
    label: "Electrónicos",
    color: "hsl(var(--chart-2))",
  },
  hogar: {
    label: "Hogar",
    color: "hsl(var(--chart-3))",
  },
  servicios: {
    label: "Servicios",
    color: "hsl(var(--chart-4))",
  },
  otros: {
    label: "Otros",
    color: "hsl(var(--chart-5))",
  },
} satisfies Record<string, any>;


export function ProductPopularityChart() {
  const [activeIndex, setActiveIndex] = React.useState<number | undefined>(undefined);

  const chartData = useMemo(() => {
    return initialChartData.map(item => ({
      ...item,
      fill: chartConfig[item.colorName]?.color || "hsl(var(--muted))",
    }));
  }, []);

  const totalSales = useMemo(() => {
    return _.round(chartData.reduce((acc, curr) => acc + curr.salesValue, 0), 2);
  }, [chartData]);

  const ActiveShape = (props: PieSectorDataItem) => {
    const { cx=0, cy=0, innerRadius=0, outerRadius=0, startAngle=0, endAngle=0, fill, payload } = props;
    
    const categoryName = (payload && typeof payload === 'object' && 'category' in payload) ? String(payload.category) : 'Unknown';
    const salesValue = (payload && typeof payload === 'object' && 'salesValue' in payload) ? Number(payload.salesValue).toFixed(2) : '0.00'

    return (
      <g>
        <text x={cx} y={cy - 10} dy={8} textAnchor="middle" fill={fill} className="text-base font-semibold">
          {categoryName}
        </text>
         <text x={cx} y={cy + 10} dy={8} textAnchor="middle" fill="hsl(var(--foreground))" className="text-sm">
          S/ {salesValue}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 5} 
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
          className="transition-all duration-300 ease-in-out"
        />
      </g>
    );
  };


  return (
    <div className="flex flex-col md:flex-row items-center w-full gap-4">
      <div className="w-full md:w-1/2 relative flex justify-center items-center min-h-[280px] md:min-h-[300px]">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-full w-full max-w-[280px] md:max-w-[300px]"
        >
          <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <Pie
              data={chartData}
              dataKey="salesValue"
              nameKey="category"
              innerRadius="65%"
              outerRadius="85%"
              strokeWidth={2}
              stroke="hsl(var(--background))" 
              activeIndex={activeIndex}
              activeShape={ActiveShape as any} // Type assertion if ActiveShape type doesn't match exactly
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(undefined)}
              paddingAngle={2}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="absolute text-center pointer-events-none flex flex-col items-center justify-center">
          <p className="text-2xl md:text-3xl font-bold font-headline text-foreground">
            S/{totalSales.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Ventas Totales</p>
        </div>
      </div>

      <div className="w-full md:w-1/2 md:pl-6 space-y-3">
        {chartData.map((item) => (
          <div key={item.category} className="flex items-center justify-between text-sm py-1 border-b border-border/30 last:border-b-0">
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: item.fill }}
              />
              <span className="text-foreground/90">{item.category}</span>
            </div>
            <span className={`font-medium ${item.trendPercentage.startsWith('+') ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
              {item.trendPercentage}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
