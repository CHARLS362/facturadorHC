
'use client'; 
import { useState, useEffect } from 'react';
import { notFound, useParams } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from "@/components/shared/page-header";
import { EditarProductoForm } from "@/components/dashboard/editar-producto-form"; 
import { Button } from "@/components/ui/button";
import { PackageSearch } from "lucide-react";

export interface ProductFormData {
  name: string;
  sku: string;
  categoryId: number; 
  price: number;
  stock: number;
  status: string;
  description: string;
  imageUrl: string;
}

export default function EditarProductoPage() {
  const params = useParams(); 
  const productId = params.id as string;

  const [initialData, setInitialData] = useState<ProductFormData | null>(null);
  const [productName, setProductName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!productId) return;

    async function fetchProductData() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/producto/${productId}`);

        if (res.status === 404) {
          notFound(); 
          return;
        }
        if (!res.ok) {
          throw new Error('Error al cargar los datos del producto');
        }

        const data = await res.json();
        
        const formattedData: ProductFormData = {
          name: data.Nombre ?? "",
          sku: data.Codigo ?? "",
          categoryId: data.IdCategoria, 
          price: data.Precio ?? 0,
          stock: data.Stock ?? 0,
          status: data.Estado ?? "En Stock",
          description: data.Descripcion ?? "",
          imageUrl: data.ImagenUrl ?? "",
        };
        
        setInitialData(formattedData);
        setProductName(data.Nombre || productId); 

      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProductData();
  }, [productId]);

  if (isLoading) {
    return <div>Cargando editor de producto...</div>;
  }

  if (!initialData) {
    return <div>No se pudieron cargar los datos del producto.</div>;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Editar Producto: ${productName}`}
        description="Modifique la información del producto o servicio."
        icon={PackageSearch}
        actions={
          <Button variant="outline" asChild>
            <Link href="/dashboard/productos">Volver al Listado</Link>
          </Button>
        }
      />
      <EditarProductoForm 
        productId={productId} 
        initialData={initialData} 
      />

    </div>
  );
}