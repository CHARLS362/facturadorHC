
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, FileDown } from "lucide-react";
import { ProductExportPreview, type MockProduct } from '@/components/dashboard/product-export-preview';
import { Skeleton } from '@/components/ui/skeleton';

// Using mock data from the products list page
const initialMockProducts: MockProduct[] = [
  { id: "PROD001", name: "Camisa de Algodón Premium", category: "Ropa", price: "S/ 79.90", stock: 120, status: "En Stock" },
  { id: "PROD002", name: "Pantalón Cargo Resistente", category: "Ropa", price: "S/ 119.90", stock: 75, status: "En Stock" },
  { id: "PROD003", name: "Zapatillas Urbanas Clásicas", category: "Calzado", price: "S/ 249.90", stock: 0, status: "Agotado" },
  { id: "PROD004", name: "Mochila Antirrobo Impermeable", category: "Accesorios", price: "S/ 189.50", stock: 45, status: "Stock Bajo" },
];

export default function ExportarProductosPage() {
  const [products, setProducts] = useState<MockProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      // Simulate API call
      // In a real app, you would fetch from `/api/productos`
      await new Promise(resolve => setTimeout(resolve, 500));
      setProducts(initialMockProducts);
      setIsLoading(false);
    };
    fetchProducts();
  }, []);

  return (
    <div className="space-y-8">
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
        <ProductExportPreview products={products} />
      )}
    </div>
  );
}
