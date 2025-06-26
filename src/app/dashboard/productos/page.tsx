'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle, Package, FileDown, UploadCloud } from "lucide-react";
import { ProductosList } from '@/components/dashboard/productos-list';

interface ProductData {
  id: number;
  name: string;
  sku: string | null;
  category: string;
  price: string;
  stock: number;
  status: 'Agotado' | 'Stock Bajo' | 'En Stock';
  imageUrl: string | null;
}

export default function ProductosPage() {
  const [productsData, setProductsData] = useState<ProductData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/producto');

        if (!response.ok) {
          throw new Error('Error al obtener los datos de los productos.');
        }

        const rawData = await response.json();
        const formattedData = rawData.map((prod: any) => ({
            id: prod.IdProducto,
            name: prod.Nombre,
            sku: prod.Codigo || null,
            category: prod.CategoriaNombre || 'Sin categoría',
            price: `S/ ${parseFloat(prod.Precio).toFixed(2)}`,
            stock: prod.Stock,
            status:
              prod.Stock === 0
                ? 'Agotado'
                : prod.Stock <= prod.StockMinimo
                ? 'Stock Bajo'
                : 'En Stock',
            imageUrl: prod.ImagenUrl || null,
        }));
        
        setProductsData(formattedData);
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
        title="Gestión de Productos"
        description="Administra tu catálogo de productos, stock y precios."
        icon={Package}
        actions={
          <div className="flex gap-2">
             <Button variant="outline" asChild>
              <Link href="/dashboard/productos/exportar">
                <FileDown className="mr-2 h-4 w-4" />
                Exportar
              </Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/dashboard/productos/importar">
                <UploadCloud className="mr-2 h-4 w-4" />
                Importación Masiva
              </Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/productos/nuevo">
                <PlusCircle className="mr-2 h-4 w-4" />
                Añadir Producto
              </Link>
            </Button>
          </div>
        }
      />
      {isLoading ? (
        <p>Cargando productos...</p>
      ) : error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : (
        <ProductosList initialData={productsData} />
      )}
    </div>
  );
}