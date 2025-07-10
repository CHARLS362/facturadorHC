'use client';

import { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Warehouse } from "lucide-react";
import { EditarAlmacenForm } from '@/components/dashboard/editar-almacen-form';
import { Skeleton } from '@/components/ui/skeleton';

const ALMACENES_STORAGE_KEY = 'facturacionhc_mock_almacenes';

export interface Almacen {
  IdAlmacen: number;
  Nombre: string;
  Direccion: string;
  Estado: boolean;
}

export interface AlmacenFormData {
  Nombre: string;
  Direccion: string;
  Estado: boolean;
}

export default function EditarAlmacenPage() {
  const params = useParams();
  const id = params?.id as string;
  
  const [initialData, setInitialData] = useState<AlmacenFormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    // Simulate fetching data from localStorage
    setIsLoading(true);
    try {
      const storedAlmacenes = localStorage.getItem(ALMACENES_STORAGE_KEY);
      if (!storedAlmacenes) {
          notFound();
          return;
      }
      const almacenes: Almacen[] = JSON.parse(storedAlmacenes);
      const almacen = almacenes.find(a => a.IdAlmacen === parseInt(id));

      if (!almacen) {
          notFound();
          return;
      }
      setInitialData(almacen);
    } catch (error) {
      console.error("Failed to load warehouse data from storage", error);
      setInitialData(null);
    } finally {
        setIsLoading(false);
    }
  }, [id]);

  if (isLoading) {
    return (
        <div className="space-y-8">
            <PageHeader
                title="Cargando Almacén..."
                icon={Warehouse}
            />
            <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-10 w-32 ml-auto" />
            </div>
        </div>
    );
  }

  if (!initialData) {
    return <div>No se pudo cargar la información del almacén. Intente volver al listado.</div>;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Editar Almacén: ${initialData.Nombre}`}
        description="Modifique la información del almacén."
        icon={Warehouse}
        actions={
          <Button variant="outline" asChild>
            <Link href="/dashboard/almacenes">Volver al Listado</Link>
          </Button>
        }
      />
      <EditarAlmacenForm 
        almacenId={id} 
        initialData={initialData} 
      />
    </div>
  );
}
