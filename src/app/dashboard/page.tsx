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
import { KpiCard } from "@/components/dashboard/kpi-card";
import { LowStockProducts } from "@/components/dashboard/low-stock-products";

export default function DashboardPage() {
  const [ventasDia, setVentasDia] = useState("S/ 0.00");
  const [clientesMes, setClientesMes] = useState("0");
  const [facturasMes, setFacturasMes] = useState({ actual: 0, meta: 500 });
  const [totalFacturadoMes, setTotalFacturadoMes] = useState("S/ 0.00");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchKpis() {
      setLoading(true);
      // Ventas del día
      const ventasRes = await fetch("/api/venta");
      const ventas = await ventasRes.json();
      // Suponiendo que cada venta tiene { FechaVenta, Total }
      const hoy = new Date().toISOString().slice(0, 10);
      const ventasHoy = ventas.filter((v: any) => v.FechaVenta?.slice(0, 10) === hoy);
      const totalHoy = ventasHoy.reduce((acc: number, v: any) => acc + Number(v.Total), 0);
      setVentasDia(`S/ ${totalHoy.toLocaleString("es-PE", { minimumFractionDigits: 2 })}`);

      // Clientes del mes
      const clientesRes = await fetch("/api/cliente");
      const clientes = await clientesRes.json();
      const mesActual = new Date().toISOString().slice(0, 7);
      const clientesMes = clientes.filter((c: any) => c.FechaRegistro?.slice(0, 7) === mesActual);
      setClientesMes(clientesMes.length.toString());

      // Facturas emitidas (ventas del mes)
      const ventasMes = ventas.filter((v: any) => v.FechaVenta?.slice(0, 7) === mesActual);
      setFacturasMes({ actual: ventasMes.length, meta: 500 });

      // Total facturado mes
      const totalMes = ventasMes.reduce((acc: number, v: any) => acc + Number(v.Total), 0);
      setTotalFacturadoMes(`S/ ${totalMes.toLocaleString("es-PE", { minimumFractionDigits: 2 })}`);

      setLoading(false);
    }
    fetchKpis();
  }, []);

  const kpiData = [
    { 
      title: "VENTAS DEL DÍA", 
      value: ventasDia, 
      change: "", 
      iconName: "DollarSign", 
      description: "comparado a ayer", 
      trend: "up", 
      href: "/dashboard/ventas",
      iconBgClass: "bg-green-500 dark:bg-green-600",
      iconColorClass: "text-white"
    },
    { 
      title: "NUEVOS CLIENTES (MES)", 
      value: clientesMes, 
      change: "", 
      iconName: "UserPlus", 
      description: "este mes", 
      trend: "up", 
      href: "/dashboard/clientes",
      iconBgClass: "bg-blue-500 dark:bg-blue-600",
      iconColorClass: "text-white"
    },
    { 
      title: "FACTURAS EMITIDAS (MES)", 
      value: `${facturasMes.actual} / ${facturasMes.meta}`, 
      iconName: "FileText", 
      description: `Meta mensual: ${facturasMes.meta}`, 
      progressValue: Math.round((facturasMes.actual / facturasMes.meta) * 100),
      href: "/dashboard/ventas",
      iconBgClass: "bg-orange-500 dark:bg-orange-600",
      iconColorClass: "text-white"
    },
    { 
      title: "TOTAL FACTURADO (MES)", 
      value: totalFacturadoMes, 
      iconName: "TrendingUp", 
      description: "en el mes actual",
      trend: "neutral",
      href: "/dashboard/ventas",
      iconBgClass: "bg-primary",
      iconColorClass: "text-primary-foreground"
    },
  ];

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Panel Centralizado" 
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
