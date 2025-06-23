
import { PageHeader } from "@/components/shared/page-header";
import { Landmark } from "lucide-react";
import { CajaManagement } from "@/components/dashboard/caja-management";
import { getConnection } from '@/lib/db';
import { sql } from "mssql";

async function getCajaData() {
  // Mock data for the chart. In a real app, this would be calculated from sales, etc.
  const chartData = [
    { name: 'Ingresos', total: 1250.50, fill: "hsl(var(--chart-1))" },
    { name: 'Devoluciones', total: 85.00, fill: "hsl(var(--chart-2))" },
    { name: 'Gastos', total: 210.00, fill: "hsl(var(--chart-3))" },
  ];

  try {
    const pool = await getConnection();
    
    const estadoResult = await pool.request().query(
      "SELECT TOP 1 c.*, u.Nombre AS UsuarioApertura FROM Caja c LEFT JOIN Usuario u ON c.IdUsuarioApertura = u.IdUsuario WHERE c.Estado = 'Abierta' ORDER BY c.FechaApertura DESC"
    );
    const activeSession = estadoResult.recordset.length > 0 ? estadoResult.recordset[0] : null;

    const historialResult = await pool.request().query(
      "SELECT TOP 10 * FROM Caja WHERE Estado = 'Cerrada' ORDER BY FechaCierre DESC"
    );
    const history = historialResult.recordset;

    // TODO: In a real implementation, calculate real chart data based on active session.
    // For now, we return mock data alongside real session data.

    return { activeSession, history, chartData };

  } catch (error: any) {
    if (error.message.includes("Invalid object name 'Caja'")) {
      console.warn("ADVERTENCIA: La tabla 'Caja' no existe. Usando datos de demostración para el módulo de caja.");
      return {
        activeSession: null,
        history: [
          { IdCaja: 1, FechaApertura: new Date('2024-07-25T09:00:00'), MontoInicial: 100.00, FechaCierre: new Date('2024-07-25T17:00:00'), MontoFinalCalculado: 1250.50, MontoFinalReal: 1250.00, Diferencia: -0.50, Estado: 'Cerrada' },
          { IdCaja: 2, FechaApertura: new Date('2024-07-24T09:00:00'), MontoInicial: 100.00, FechaCierre: new Date('2024-07-24T17:05:00'), MontoFinalCalculado: 980.00, MontoFinalReal: 980.00, Diferencia: 0.00, Estado: 'Cerrada' },
        ],
        chartData // Return mock chart data
      };
    }
    // For other errors, re-throw or handle them as needed
    console.error("Error al obtener datos de caja:", error);
    // Return a default state to prevent crashing the page
    return { activeSession: null, history: [], chartData };
  }
}

export default async function CajaPage() {
  const { activeSession, history, chartData } = await getCajaData();
  
  return (
    <div className="space-y-8">
      <PageHeader 
        title="Gestión de Caja"
        description="Administra la apertura, arqueo y cierre de tu caja diaria."
        icon={Landmark}
      />
      <CajaManagement 
        initialActiveSession={activeSession} 
        initialHistory={history} 
        chartData={chartData}
      />
    </div>
  );
}
