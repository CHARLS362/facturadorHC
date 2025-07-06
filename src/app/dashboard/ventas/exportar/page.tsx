"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, FileDown, Download } from "lucide-react";
import { SaleExportPreview, type MockSale } from '@/components/dashboard/sale-export-preview';
import { Skeleton } from '@/components/ui/skeleton';
import html2pdf from 'html2pdf.js';

export default function ExportarVentasPage() {
  const [sales, setSales] = useState<MockSale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchSales = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/venta');
        if (!response.ok) throw new Error("Error al obtener ventas");
        const data: MockSale[] = await response.json();

        // Mapear Estado => status para evitar errores en SaleExportPreview
        const transformed = data.map((venta) => ({
          ...venta,
          status: venta.Estado,           // alias de compatibilidad por el cambio de idioma 
          date: venta.FechaVenta ? new Date(venta.FechaVenta).toLocaleDateString('es-PE') : "",
          total: `S/ ${Number(venta.Total).toFixed(2)}`,
          paymentMethod: venta.NombreFormaPago || "Desconocido",
          documentType: venta.TipoDocumento === "Boleta" ? "Boleta" : "Factura",
          clientEmail: venta.EmailCliente || "",
          clientPhone: venta.TelefonoCliente || "",
          id: `VENTA${venta.IdVenta.toString().padStart(3, '0')}`,
          ventaId: venta.IdVenta,
          customer: venta.NombreCliente || "Sin nombre",
        }));
        // Actualizar el estado con los datos transformados
        // Esto asegura que los campos coincidan con lo que espera SaleExportPreview
        setSales(transformed);
      } catch (error) {
        console.error("Error cargando ventas:", error);
        setSales([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSales();
  }, []);

  const handleDownloadPdf = () => {
    const element = document.getElementById('printable-area');
    const opt = {
      margin: 0.5,
      filename: 'reporte-ventas.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }
    };
    html2pdf().from(element).set(opt).save();
  };

  return (
    <div className="space-y-8 p-6 print:p-0">
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
              <Button variant="outline" onClick={handleDownloadPdf}>
                <Download className="mr-2 h-4 w-4" />
                Descargar PDF
              </Button>
              <Button onClick={() => window.print()}>
                <Printer className="mr-2 h-4 w-4" />
                Imprimir
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
