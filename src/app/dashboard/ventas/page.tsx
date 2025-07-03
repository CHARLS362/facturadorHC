'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, ShoppingCart, FileDown } from "lucide-react";
import { VentasList } from '@/components/dashboard/ventas-list';

interface VentaData {
  id: string;
  ventaId: number;
  date: string;
  customer: string;
  total: string;
  status: string;
  paymentMethod: string;
  documentType: string;
  clientEmail: string;
  clientPhone: string;
}

export default function VentasPage() {
  const [salesData, setSalesData] = useState<VentaData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/venta');
        if (!response.ok) {
          throw new Error('Error al obtener los datos de las ventas.');
        }
        const rawData = await response.json();
        const formattedData = rawData.map((venta: any) => ({
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
        setSalesData(formattedData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

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
      {isLoading ? (
        <p>Cargando ventas...</p>
      ) : error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : (
        <VentasList initialData={salesData} />
      )}
    </div>
  );
}