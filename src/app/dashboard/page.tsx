"use client";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  LayoutDashboard,
  ShoppingCart,
  UserPlus2,
  PackagePlus as PackagePlusIcon,
  BarChart3, 
  PieChartIcon, 
  LineChartIcon,
  ShieldAlert,
} from "lucide-react";
import { SalesOverviewChart } from "@/components/dashboard/sales-overview-chart";
import { ProductPopularityChart } from "@/components/dashboard/product-popularity-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { KpiCard, KpiCardProps } from "@/components/dashboard/kpi-card";
import { LowStockProducts } from "@/components/dashboard/low-stock-products";

interface CustomKpiData extends KpiCardProps {}

const kpiData: CustomKpiData[] = [
  { 
    title: "VENTAS DEL DÍA", 
    value: "S/ 1,250.50", 
    change: "+5%", 
    iconName: "DollarSign", 
    description: "comparado a ayer", 
    trend: "up", 
    href: "/dashboard/ventas",
    iconBgClass: "bg-green-500 dark:bg-green-600",
    iconColorClass: "text-white"
  },
  { 
    title: "NUEVOS CLIENTES (MES)", 
    value: "12", 
    change: "+3", 
    iconName: "UserPlus", 
    description: "este mes", 
    trend: "up", 
    href: "/dashboard/clientes",
    iconBgClass: "bg-blue-500 dark:bg-blue-600",
    iconColorClass: "text-white"
  },
  { 
    title: "FACTURAS EMITIDAS (MES)", 
    value: "320 / 500", 
    iconName: "FileText", 
    description: "Meta mensual: 500", 
    progressValue: 64, // (320/500)*100
    href: "/dashboard/ventas",
    iconBgClass: "bg-orange-500 dark:bg-orange-600",
    iconColorClass: "text-white"
  },
  { 
    title: "TOTAL FACTURADO (MES)", 
    value: "S/ 25,800.00", 
    iconName: "TrendingUp", 
    description: "en el mes actual",
    trend: "neutral", // Or 'up'/'down' if comparing to previous month
    href: "/dashboard/ventas",
    iconBgClass: "bg-primary", // Using theme primary
    iconColorClass: "text-primary-foreground"
  },
];

export default function DashboardPage() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Panel Principal" 
        description="Resumen de la actividad y KPIs de tu negocio."
        icon={LayoutDashboard}
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi, index) => (
          <KpiCard 
            key={index} 
            title={kpi.title} 
            value={loading ? "..." : kpi.value} 
            change={kpi.change} 
            iconName={kpi.iconName} 
            description={kpi.description} 
            trend={kpi.trend} 
            href={kpi.href}
            iconBgClass={kpi.iconBgClass}
            iconColorClass={kpi.iconColorClass}
            progressValue={kpi.progressValue}
          />
        ))}
      </div>

      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl">Acciones Rápidas</CardTitle>
          <CardDescription>Accede rápidamente a las funciones más comunes.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button asChild size="lg" className="font-headline text-base py-8 hover:scale-[1.03] transition-transform duration-200 ease-out">
            <Link href="/dashboard/ventas/nueva">
              <ShoppingCart className="mr-3 h-6 w-6" />
              Registrar Nueva Venta
            </Link>
          </Button>
          <Button asChild size="lg" className="font-headline text-base py-8 hover:scale-[1.03] transition-transform duration-200 ease-out">
            <Link href="/dashboard/clientes/nuevo">
              <UserPlus2 className="mr-3 h-6 w-6" />
              Añadir Nuevo Cliente
            </Link>
          </Button>
          <Button asChild size="lg" className="font-headline text-base py-8 hover:scale-[1.03] transition-transform duration-200 ease-out">
            <Link href="/dashboard/productos/nuevo">
              <PackagePlusIcon className="mr-3 h-6 w-6" />
              Añadir Nuevo Producto
            </Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <LineChartIcon className="h-6 w-6 text-primary" />
              Resumen de Ventas
            </CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <SalesOverviewChart />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3 shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <PieChartIcon className="h-6 w-6 text-accent" />
              Productos Más Populares
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProductPopularityChart />
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <BarChart3 className="h-6 w-6 text-primary" />
              Actividad Reciente
            </CardTitle>
             <CardDescription>Últimas ventas y registros en el sistema.</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentActivity />
          </CardContent>
        </Card>
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <ShieldAlert className="h-6 w-6 text-yellow-500" />
              Productos con Bajo Stock
            </CardTitle>
            <CardDescription>Productos que necesitan ser reabastecidos pronto.</CardDescription>
          </CardHeader>
          <CardContent>
            <LowStockProducts />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
