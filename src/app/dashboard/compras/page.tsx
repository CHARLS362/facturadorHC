"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, ClipboardList } from "lucide-react";
import { ComprasList } from '@/components/dashboard/compras-list';

type CompraStatus = "Recibido" | "Pendiente" | "Cancelado";

interface CompraData {
  id: string;
  compraId: number;
  date: string;
  provider: string;
  total: string;
  status: CompraStatus;
}

export default function ComprasPage() {
  const [comprasData, setComprasData] = useState<CompraData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/compra');
        if (!response.ok) {
          throw new Error('Error al obtener los datos de las compras.');
        }
        const rawData = await response.json();
        const allowedStatuses = ["Recibido", "Pendiente", "Cancelado"] as const;
        const formattedData = rawData.map((item: any, idx: number) => ({
          id: item.Compra_id,
          compraId: idx + 1,
          date: item.Fecha,
          provider: item.Proveedor,
          total: `S/ ${Number(item.Total).toLocaleString("es-PE", { minimumFractionDigits: 2 })}`,
          status: allowedStatuses.includes(item.Estado) ? item.Estado : "Pendiente",
        }));
        setComprasData(formattedData);
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
        title="Gestión de Compras"
        description="Administra las órdenes de compra y el abastecimiento de productos."
        icon={ClipboardList}
        actions={
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/dashboard/compras/nuevo">
                <PlusCircle className="mr-2 h-4 w-4" />
                Registrar Compra
              </Link>
            </Button>
          </div>
        }
      />
      {isLoading ? (
        <p>Cargando compras...</p>
      ) : error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : (
        <ComprasList initialData={comprasData} />
      )}
    </div>
  );
}
