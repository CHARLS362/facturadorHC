
import Link from 'next/link';
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, ShoppingCart, FileDown } from "lucide-react";
import { getConnection } from '@/lib/db';
import { VentasList } from '@/components/dashboard/ventas-list';

async function getSalesData() {
  try {
    const pool = await getConnection();
    const result = await pool.request().query(`
      SELECT 
        v.IdVenta, v.FechaVenta, cl.Nombre AS NombreCliente, cl.Email AS EmailCliente, cl.Telefono AS TelefonoCliente,
        tc.Descripcion AS TipoDocumento, v.Total, fp.Descripcion AS NombreFormaPago, v.Estado
      FROM Ventas v
      LEFT JOIN Comprobante c ON v.IdComprobante = c.IdComprobante
      LEFT JOIN Serie s ON c.IdSerie = s.IdSerie
      LEFT JOIN TipoComprobante tc ON s.IdTipoComprobante = tc.IdTipoComprobante
      LEFT JOIN Cliente cl ON v.IdCliente = cl.IdCliente
      LEFT JOIN FormaPago fp ON v.IdFormaPago = fp.IdFormaPago
    `);
    
    return result.recordset.map((venta: any) => ({
      id: `VENTA${venta.IdVenta.toString().padStart(3, '0')}`,
      ventaId: venta.IdVenta,
      date: venta.FechaVenta ? new Date(venta.FechaVenta).toLocaleDateString('es-PE') : "",
      customer: venta.NombreCliente || "Sin nombre",
      total: `S/ ${Number(venta.Total).toFixed(2)}`,
      status: venta.Estado,
      paymentMethod: venta.NombreFormaPago || "Desconocido",
      documentType: venta.TipoDocumento || "Factura",
      clientEmail: venta.EmailCliente || "",
      clientPhone: venta.TelefonoCliente || "",
    }));
  } catch (error) {
    console.error("Error fetching sales data:", error);
    return [];
  }
}

export default async function VentasPage() {
  const salesData = await getSalesData();

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Gestión de Ventas"
        description="Registra y administra todas las transacciones de ventas."
        icon={ShoppingCart}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/ventas/exportar">
                <FileDown className="mr-2 h-4 w-4" />
                Exportar Ventas
              </Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/ventas/nueva">
                <PlusCircle className="mr-2 h-4 w-4" />
                Nueva Venta
              </Link>
            </Button>
          </div>
        }
      />
      <VentasList initialData={salesData} />
    </div>
  );
}
