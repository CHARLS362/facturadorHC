import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Users, PackageMinus, PackagePlus, BarChart3, PieChartIcon, LineChartIcon, LayoutDashboard } from "lucide-react";
import { SalesOverviewChart } from "@/components/dashboard/sales-overview-chart";
import { ProductPopularityChart } from "@/components/dashboard/product-popularity-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { KpiCard, KpiCardProps } from "@/components/dashboard/kpi-card";

const kpiData: KpiCardProps[] = [
  { title: "Ventas Hoy", value: "S/ 1,250.75", change: "+15.2%", icon: DollarSign, description: "Comparado con ayer", trend: "up" },
  { title: "Nuevos Clientes", value: "12", change: "+5", icon: Users, description: "Este mes", trend: "up" },
  { title: "Stock Bajo", value: "8 productos", change: "-2", icon: PackageMinus, description: "Necesitan reabastecimiento", trend: "down", variant: "destructive" },
  { title: "Productos Activos", value: "256", change: "+10", icon: PackagePlus, description: "Total en catálogo", trend: "up" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader 
        title="Panel Centralizado" 
        description="Resumen de la actividad y KPIs de tu negocio."
        icon={LayoutDashboard}
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi, index) => (
          <KpiCard key={index} {...kpi} />
        ))}
      </div>

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
      
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline">
            <BarChart3 className="h-6 w-6 text-primary" />
            Actividad Reciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RecentActivity />
        </CardContent>
      </Card>

    </div>
  );
}
