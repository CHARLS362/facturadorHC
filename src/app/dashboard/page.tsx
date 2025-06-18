
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
} from "lucide-react";
import { SalesOverviewChart } from "@/components/dashboard/sales-overview-chart";
import { ProductPopularityChart } from "@/components/dashboard/product-popularity-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { KpiCard, type KpiCardProps } from "@/components/dashboard/kpi-card";

// Define a local type for kpiData items if KpiCardProps is not directly compatible or for clarity
interface CustomKpiData extends KpiCardProps {}


const kpiData: CustomKpiData[] = [
  { 
    title: "BUDGET", 
    value: "$24k", 
    change: "12%", 
    iconName: "DollarSign", 
    description: "Since last month", 
    trend: "up", 
    href: "/dashboard/ventas", // Placeholder link
    iconBgClass: "bg-red-500 dark:bg-red-600",
    iconColorClass: "text-white"
  },
  { 
    title: "TOTAL CUSTOMERS", 
    value: "1.6k", 
    change: "16%", 
    iconName: "Users", 
    description: "Since last month", 
    trend: "down", 
    href: "/dashboard/clientes",
    iconBgClass: "bg-green-500 dark:bg-green-600",
    iconColorClass: "text-white"
  },
  { 
    title: "TASK PROGRESS", 
    value: "75.5%", 
    iconName: "List", 
    description: "Overall project completion", // Updated description
    progressValue: 75.5, 
    href: "/dashboard/proyectos", // Placeholder link
    iconBgClass: "bg-orange-500 dark:bg-orange-600",
    iconColorClass: "text-white"
  },
  { 
    title: "TOTAL PROFIT", 
    value: "$15k", 
    iconName: "DollarSign", 
    description: "This fiscal year",  // Updated description
    // No change or trend shown in image for this one
    href: "/dashboard/finanzas", // Placeholder link
    iconBgClass: "bg-blue-500 dark:bg-blue-600",
    iconColorClass: "text-white"
  },
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
          <KpiCard 
            key={index} 
            title={kpi.title} 
            value={kpi.value} 
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
          <Button asChild size="lg" className="font-headline text-base py-8 hover:scale-[1.03] transition-transform duration-200 ease-out bg-primary hover:bg-primary/90">
            <Link href="/dashboard/ventas/nueva">
              <ShoppingCart className="mr-3 h-6 w-6" />
              Registrar Nueva Venta
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary" className="font-headline text-base py-8 hover:scale-[1.03] transition-transform duration-200 ease-out">
            <Link href="/dashboard/clientes/nuevo">
              <UserPlus2 className="mr-3 h-6 w-6" />
              Añadir Nuevo Cliente
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="font-headline text-base py-8 hover:scale-[1.03] transition-transform duration-200 ease-out border-primary/50 hover:border-primary hover:bg-primary/5">
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
