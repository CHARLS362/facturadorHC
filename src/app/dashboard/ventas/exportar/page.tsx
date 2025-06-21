
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, FileDown } from "lucide-react";
import { SaleExportPreview, type MockSale } from '@/components/dashboard/sale-export-preview';
import { Skeleton } from '@/components/ui/skeleton';

// Using mock data from the sales list page
const initialMockSales: MockSale[] = [
  { id: "VENTA001", date: "2024-07-20", customer: "Carlos Mendoza", total: "S/ 150.00", status: "Pagado", paymentMethod: "Tarjeta", documentType: "Factura", clientEmail: "carlos.mendoza@example.com", clientPhone: "51987654321" },
  { id: "VENTA002", date: "2024-07-19", customer: "Luisa Fernandez", total: "S/ 85.50", status: "Pendiente", paymentMethod: "Efectivo", documentType: "Boleta", clientEmail: "luisa.fernandez@example.com", clientPhone: "51912345678" },
  { id: "VENTA003", date: "2024-07-19", customer: "Ana Torres", total: "S/ 220.00", status: "Pagado", paymentMethod: "Transferencia", documentType: "Factura", clientEmail: "ana.torres@example.com", clientPhone: "51999888777" },
  { id: "VENTA004", date: "2024-07-18", customer: "Jorge Vargas", total: "S/ 45.00", status: "Anulado", paymentMethod: "Yape", documentType: "Boleta", clientEmail: "jorge.vargas@example.com", clientPhone: "51977666555" },
];

export default function ExportarVentasPage() {
  const [sales, setSales] = useState<MockSale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchSales = async () => {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setSales(initialMockSales);
      setIsLoading(false);
    };
    fetchSales();
  }, []);

  return (
    <div className="space-y-8">
      <div className="print-hide">
        <PageHeader
          title="Previsualización de Exportación"
          description="Revisa el reporte de ventas antes de imprimir o descargar."
          icon={FileDown}
          actions={
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver
              </Button>
              <Button onClick={() => window.print()}>
                <Printer className="mr-2 h-4 w-4" />
                Descargar / Imprimir
              </Button>
            </div>
          }
        />
      </div>

      {isLoading ? (
        <div className="p-10 border rounded-lg bg-card">
           <div className="flex items-center space-x-4 mb-6">
              <Skeleton className="h-12 w-12" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
            <Skeleton className="h-8 w-full mb-4" />
            <Skeleton className="h-8 w-full mb-2" />
            <Skeleton className="h-8 w-full mb-2" />
            <Skeleton className="h-8 w-full mb-2" />
        </div>
      ) : (
        <SaleExportPreview sales={sales} />
      )}
    </div>
  );
}
