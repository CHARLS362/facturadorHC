
import { PageHeader } from "@/components/shared/page-header";
import { Landmark } from "lucide-react";
import { CajaManagement } from "@/components/dashboard/caja-management";
import { getConnection } from '@/lib/db';
import { sql } from "mssql";

async function getCajaData() {
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

    return { activeSession, history };

  } catch (error: any) {
    if (error.message.includes("Invalid object name 'Caja'")) {
      console.warn("ADVERTENCIA: La tabla 'Caja' no existe. Usando datos de demostración para el módulo de caja.");
      return {
        activeSession: null,
        history: [
          { IdCaja: 1, FechaApertura: new Date('2024-07-25T09:00:00'), MontoInicial: 100.00, FechaCierre: new Date('2024-07-25T17:00:00'), MontoFinalCalculado: 1250.50, MontoFinalReal: 1250.00, Diferencia: -0.50, Estado: 'Cerrada' },
          { IdCaja: 2, FechaApertura: new Date('2024-07-24T09:00:00'), MontoInicial: 100.00, FechaCierre: new Date('2024-07-24T17:05:00'), MontoFinalCalculado: 980.00, MontoFinalReal: 980.00, Diferencia: 0.00, Estado: 'Cerrada' },
        ]
      };
    }
    // For other errors, re-throw or handle them as needed
    console.error("Error al obtener datos de caja:", error);
    // Return a default state to prevent crashing the page
    return { activeSession: null, history: [] };
  }
}

export default async function CajaPage() {
  const { activeSession, history } = await getCajaData();
  
  return (
    <div className="space-y-8">
      <PageHeader 
        title="Gestión de Caja"
        description="Administra la apertura, arqueo y cierre de tu caja diaria."
        icon={Landmark}
      />
      <CajaManagement initialActiveSession={activeSession} initialHistory={history} />
    </div>
  );
}
