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
} satisfies Record<string, any>;

export function CajaChart({ data: initialData }: { data: any[] }) {
  const [activeIndex, setActiveIndex] = React.useState<number | undefined>(undefined);

  const chartData = useMemo(() => {
    return initialData.map(item => ({
      name: item.name,
      total: item.total,
      fill: item.fill || "hsl(var(--muted))",
    }));
  }, [initialData]);

  const totalValue = useMemo(() => {
    const ingresos = chartData.find(d => d.name === 'Ingresos')?.total || 0;
    const devoluciones = chartData.find(d => d.name === 'Devoluciones')?.total || 0;
    const gastos = chartData.find(d => d.name === 'Gastos')?.total || 0;
    return _.round(ingresos - devoluciones - gastos, 2);
  }, [chartData]);


  const ActiveShape = (props: PieSectorDataItem) => {
    const { cx=0, cy=0, innerRadius=0, outerRadius=0, startAngle=0, endAngle=0, fill, payload } = props;
    const categoryName = (payload && typeof payload === 'object' && 'name' in payload) ? String(payload.name) : 'Unknown';
    const value = (payload && typeof payload === 'object' && 'total' in payload) ? Number(payload.total).toFixed(2) : '0.00';

    return (
      <g>
        <text x={cx} y={cy - 10} dy={8} textAnchor="middle" fill={fill} className="text-sm font-semibold">
          {categoryName}
        </text>
         <text x={cx} y={cy + 10} dy={8} textAnchor="middle" fill="hsl(var(--foreground))" className="text-xs">
          S/ {value}
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
            <ChartTooltip
              cursor={true}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="total"
              nameKey="name"
              innerRadius="65%"
              outerRadius="85%"
              strokeWidth={2}
              stroke="hsl(var(--background))"
              activeIndex={activeIndex}
              activeShape={ActiveShape as any}
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
        {activeIndex === undefined && (
          <div className="absolute text-center pointer-events-none flex flex-col items-center justify-center transition-opacity duration-300">
            <p className="text-2xl md:text-3xl font-bold font-headline text-foreground">
              S/{totalValue.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Flujo Neto</p>
          </div>
        )}
      </div>

      <div className="w-full md:w-1/2 md:pl-6 space-y-3">
        {chartData.map((item) => (
          <div key={item.name} className="flex items-center justify-between text-sm py-1 border-b border-border/30 last:border-b-0">
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: item.fill }}
              />
              <span className="text-foreground/90">{item.name}</span>
            </div>
            <span className="font-medium">
              S/ {item.total.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
