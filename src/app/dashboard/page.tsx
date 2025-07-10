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
import { getConnection } from '@/lib/db';
import sql from 'mssql';

async function getDashboardData() {
    try {
        const pool = await getConnection();

        // 1. Ventas del día
        const ventasHoyResult = await pool.request().query(`
            SELECT ISNULL(SUM(Total), 0) as TotalVentasHoy
            FROM Ventas
            WHERE CONVERT(date, FechaVenta) = CONVERT(date, GETDATE())
              AND Estado <> 'Anulado'
        `);
        const ventasHoy = ventasHoyResult.recordset[0].TotalVentasHoy;

<<<<<<< HEAD
export default function DashboardPage() {
  const [loading, setLoading] = useState(false);

  // You can add useEffect here if you want to fetch data and set loading
=======
        // 2. Nuevos clientes (mes)
        const nuevosClientesResult = await pool.request().query(`
            SELECT COUNT(IdCliente) as NuevosClientes
            FROM Cliente
            WHERE MONTH(FechaRegistro) = MONTH(GETDATE()) AND YEAR(FechaRegistro) = YEAR(GETDATE())
        `);
        const nuevosClientes = nuevosClientesResult.recordset[0].NuevosClientes;

        // 3. Facturas emitidas (mes)
        const facturasEmitidasResult = await pool.request().query(`
            SELECT COUNT(v.IdVenta) as FacturasEmitidas
            FROM Ventas v
            INNER JOIN Comprobante c ON v.IdComprobante = c.IdComprobante
            INNER JOIN Serie s ON c.IdSerie = s.IdSerie
            WHERE s.IdTipoComprobante = (SELECT IdTipoComprobante FROM TipoComprobante WHERE Descripcion = 'Factura')
              AND MONTH(v.FechaVenta) = MONTH(GETDATE()) AND YEAR(v.FechaVenta) = YEAR(GETDATE())
              AND v.Estado <> 'Anulado'
        `);
        const facturasEmitidas = facturasEmitidasResult.recordset[0].FacturasEmitidas;

        // 4. Total facturado (mes)
        const totalMesResult = await pool.request().query(`
            SELECT ISNULL(SUM(Total), 0) as TotalMes
            FROM Ventas
            WHERE MONTH(FechaVenta) = MONTH(GETDATE()) AND YEAR(FechaVenta) = YEAR(GETDATE())
              AND Estado <> 'Anulado'
        `);
        const totalMes = totalMesResult.recordset[0].TotalMes;

        return {
            ventasHoy,
            nuevosClientes,
            facturasEmitidas,
            totalMes
        };
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
        // Return default values in case of error
        return {
            ventasHoy: 0,
            nuevosClientes: 0,
            facturasEmitidas: 0,
            totalMes: 0
        };
    }
}

export default async function DashboardPage() {
  const data = await getDashboardData();
  const facturasMeta = 500;
  const kpiData: KpiCardProps[] = [
    { 
      title: "VENTAS DEL DÍA", 
      value: `S/ ${data.ventasHoy.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
      iconName: "DollarSign", 
      description: "Ventas de hoy", 
      href: "/dashboard/ventas",
      iconBgClass: "bg-green-500 dark:bg-green-600",
      iconColorClass: "text-white"
    },
    { 
      title: "NUEVOS CLIENTES (MES)", 
      value: data.nuevosClientes.toString(), 
      iconName: "UserPlus", 
      description: "en el mes actual", 
      href: "/dashboard/clientes",
      iconBgClass: "bg-blue-500 dark:bg-blue-600",
      iconColorClass: "text-white"
    },
    { 
      title: "FACTURAS EMITIDAS (MES)", 
      value: `${data.facturasEmitidas} / ${facturasMeta}`, 
      iconName: "FileText", 
      description: `Meta mensual: ${facturasMeta}`, 
      progressValue: (data.facturasEmitidas / facturasMeta) * 100,
      href: "/dashboard/ventas",
      iconBgClass: "bg-orange-500 dark:bg-orange-600",
      iconColorClass: "text-white"
    },
    { 
      title: "TOTAL FACTURADO (MES)", 
      value: `S/ ${data.totalMes.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
      iconName: "TrendingUp", 
      description: "en el mes actual",
      href: "/dashboard/ventas",
      iconBgClass: "bg-primary",
      iconColorClass: "text-primary-foreground"
    },
  ];
>>>>>>> de17c3d (tenemos problemas en el dashboarb principal este componente estaba conec)

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
