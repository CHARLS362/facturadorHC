"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, FileDown, Download } from "lucide-react";
import { ProductExportPreview, type MockProduct } from '@/components/dashboard/product-export-preview';
import { Skeleton } from '@/components/ui/skeleton';
import html2pdf from 'html2pdf.js';

export default function ExportarProductosPage() {
  const [products, setProducts] = useState<MockProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/producto');
        if (!response.ok) throw new Error("Error al obtener productos");
        const data: MockProduct[] = await response.json();

        // Transformar Estado => status
        const transformed = data.map((producto) => ({
          ...producto,
          status: producto.Estado,
          stock: producto.Stock || 0,
          price: `S/ ${Number(producto.Precio).toFixed(2)}`,
          id: `PROD${producto.IdProducto.toString().padStart(3, '0')}`,
          productoId: producto.IdProducto,
          name: producto.Nombre || "Sin nombre",
          category: producto.CategoriaNombre || "Sin categoría",
          description: producto.Descripcion || "Sin descripción",
        }));

        setProducts(transformed);
      } catch (error) {
        console.error("Error cargando productos:", error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleDownloadPdf = () => {
    const element = document.getElementById('printable-area');
    const opt = {
      margin: 0.5,
      filename: 'reporte-productos.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().from(element).set(opt).save();
  };

  return (
    <div className="space-y-8 p-6 print:p-0">
      <div className="print-hide">
        <PageHeader
          title="Previsualización de Exportación"
          description="Revisa el reporte de productos antes de imprimir o descargar."
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
        <ProductExportPreview products={products} />
      )}
    </div>
  );
}
